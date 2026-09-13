"""État « lu » des livres, persistant et partagé par tout le foyer.

Même forme que `dates.py`, et pour la même raison : le drapeau est **dérivé au
moment de servir**, jamais écrit dans le cache disque. Le cache garde la sortie
brute du scraper ; y figer un `read` le rendrait faux dès le marquage suivant,
et une journée d'indisponibilité du portail resservirait l'état de lecture de
la veille sans le dire.

Ce module n'hérite de rien et n'importe que des symboles simulables, donc il
est importable sous les mocks de `tests/conftest.py` — contrairement à
`sensor.py`. Toute la logique décidable vit ici plutôt que dans une classe
d'entité, sans quoi elle serait hors de portée des tests et la suite resterait
verte quoi qu'on y casse.

La portée est le **foyer**, pas le membre : la clé est celle du livre seul.
Deux enfants qui empruntent le même titre voient donc le même badge. C'est un
choix, pas un oubli — le rendre par membre demanderait de clé sur
(emprunteur, livre), ce que le stockage sait faire mais que l'interface ne
distingue pas.
"""
from __future__ import annotations

import asyncio
import logging
import re
from datetime import datetime, timedelta
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

STORAGE_VERSION = 1
STORAGE_KEY = f"{DOMAIN}_read"

# L'état « lu » est un singleton de domaine, pas une donnée d'entrée : sa portée
# est le foyer, et il doit survivre au rechargement d'une entrée. Il ne peut
# donc pas vivre dans `entry.runtime_data`, que Home Assistant supprime au
# déchargement. Clé distincte de DOMAIN pour ne pas entrer en conflit avec
# l'usage qu'en fait le cœur.
READ_STATUS_KEY = f"{DOMAIN}_read_status"

# Un livre rendu reste connu deux ans : réemprunter un titre déjà lu doit
# réafficher le badge, c'est tout l'intérêt de garder l'information après le
# retour. Sans purge le fichier grossirait indéfiniment, à raison d'une entrée
# par livre jamais réemprunté.
PRUNE_AFTER = timedelta(days=730)

_SPACES = re.compile(r"\s+")


def loan_key(loan: Any) -> str | None:
    """Clé stable d'un livre, ou None s'il n'en a aucune d'exploitable.

    `book_id` est l'identifiant du catalogue, présent sur tout prêt dont le
    titre est un lien. Il survit au retour puis au réemprunt, ce qui est
    exactement la propriété recherchée.

    Repli sur le titre normalisé quand le lien manque — le scraper laisse alors
    `book_id` à None. Les deux espaces de noms sont préfixés : sans ça un
    catalogue dont les identifiants sont des mots ferait collisionner un livre
    avec le titre d'un autre.
    """
    if not isinstance(loan, dict):
        return None
    book_id = loan.get("book_id")
    if isinstance(book_id, str) and book_id.strip():
        return f"id:{book_id.strip()}"
    titre = loan.get("titre")
    if isinstance(titre, str) and titre.strip():
        # casefold et non lower : « STRASSE » et « straße » sont le même titre.
        return f"titre:{_SPACES.sub(' ', titre.strip()).casefold()}"
    return None


def with_read_flags(data: dict, read_keys: set[str]) -> dict:
    """Copie de `data` où chaque prêt porte `read` et `read_key`.

    Copie, jamais mutation, pour la raison décrite dans `with_days_left` :
    `coordinator.data` est comparé aux attributs de l'entité à chaque écriture
    d'état. Muter en place laisserait l'ancien State référencer les mêmes
    dicts, la comparaison les verrait déjà modifiés, aucun `state_changed` ne
    serait émis, et le badge n'apparaîtrait qu'au cycle de poll suivant — soit
    une heure par défaut après le clic.

    `read_key` est exposé à la carte pour qu'elle le renvoie tel quel au
    service. Recalculer la clé côté TypeScript dupliquerait la normalisation du
    titre dans un langage dont le `toLowerCase` ne fait pas le même travail que
    `casefold`, et la divergence ne se verrait que sur les livres sans lien.
    """
    membres = data.get("membres")
    if not isinstance(membres, dict):
        return data

    flagged: dict[str, list[dict]] = {}
    for membre, loans in membres.items():
        if not isinstance(loans, list):
            flagged[membre] = loans
            continue
        marked = []
        for loan in loans:
            if not isinstance(loan, dict):
                marked.append(loan)
                continue
            key = loan_key(loan)
            marked.append({
                **loan,
                "read_key": key,
                "read": key is not None and key in read_keys,
            })
        flagged[membre] = marked

    return {**data, "membres": flagged}


def prune_entries(entries: dict[str, dict], now: datetime) -> dict[str, dict]:
    """Écarte les marquages trop anciens, et tout ce qui n'est pas exploitable.

    Une entrée sans `marked_at` lisible est **gardée**, pas purgée : c'est plus
    probablement le fait d'une version antérieure du format que d'une
    corruption, et perdre l'état de lecture d'un utilisateur pour une date
    illisible serait un remède pire que le mal.

    TypeError autant que ValueError : `now` est conscient du fuseau, et
    soustraire un `marked_at` naïf — ce qu'écrirait une version antérieure —
    lève TypeError, pas ValueError. Ne rattraper que la seconde ferait planter
    le chargement sur un fichier hérité, donc une intégration qui ne démarre
    plus.
    """
    kept: dict[str, dict] = {}
    for key, entry in entries.items():
        if not isinstance(key, str) or not isinstance(entry, dict):
            continue
        marked_at = entry.get("marked_at")
        if isinstance(marked_at, str):
            try:
                if now - datetime.fromisoformat(marked_at) > PRUNE_AFTER:
                    continue
            except (ValueError, TypeError):
                _LOGGER.debug("Date de marquage inexploitable pour %r, entrée gardée", key)
        kept[key] = entry
    return kept


class ReadStatus:
    """Les livres marqués lus, et leur persistance sur disque.

    Un seul objet pour tout le domaine, et non un par entrée de configuration :
    la portée est le foyer, donc deux comptes doivent voir le même état. Il ne
    peut donc pas vivre dans `entry.runtime_data`, qui est par définition par
    entrée et que Home Assistant supprime au déchargement — l'état de lecture,
    lui, doit survivre à un rechargement d'entrée.

    `now` est un paramètre plutôt qu'un appel à `dt_util.utcnow()` : c'est ce
    qui rend la purge testable sans figer l'horloge.
    """

    def __init__(self, store: Store) -> None:
        self._store = store
        self._entries: dict[str, dict] = {}
        self._loaded = False
        self._lock = asyncio.Lock()

    @property
    def keys(self) -> set[str]:
        """Clés des livres actuellement marqués lus."""
        return set(self._entries)

    async def async_ensure_loaded(self, now: datetime) -> None:
        """Relit le disque une seule fois, même sur appels concurrents.

        Le verrou n'est pas décoratif : deux entrées de configuration font leur
        setup concurremment, et sans lui la seconde pourrait lire `keys` entre
        la construction de l'objet et la fin du chargement — donc servir un
        premier rendu où aucun livre n'est lu.
        """
        if self._loaded:
            return
        async with self._lock:
            if self._loaded:
                return
            self._entries = await self._async_read(now)
            self._loaded = True

    async def _async_read(self, now: datetime) -> dict[str, dict]:
        try:
            raw = await self._store.async_load() or {}
        except Exception:
            # Avalé à dessein : un fichier d'état de lecture illisible ne doit
            # pas empêcher l'intégration de se charger. On repart à vide, ce
            # qui n'affiche aucun badge — visible, contrairement à une entrée
            # en erreur pour une raison décorative.
            _LOGGER.exception("Lecture de l'état « lu » impossible, on repart à vide")
            return {}
        if not isinstance(raw, dict):
            _LOGGER.warning(
                "État « lu » corrompu (conteneur %s), ignoré", type(raw).__name__
            )
            return {}
        entries = raw.get("entries")
        if not isinstance(entries, dict):
            return {}
        kept = prune_entries(entries, now)
        if len(kept) != len(entries):
            _LOGGER.info(
                "État « lu » : %d marquage(s) purgé(s), %d gardé(s)",
                len(entries) - len(kept),
                len(kept),
            )
            await self._async_write(kept)
        return kept

    async def _async_write(self, entries: dict[str, dict]) -> None:
        await self._store.async_save({"entries": entries})

    async def async_set(
        self, key: str, read: bool, now: datetime, titre: str | None = None
    ) -> bool:
        """Marque ou démarque un livre. Renvoie True si l'état a changé.

        `titre` n'est jamais relu : il n'est là que pour rendre le fichier de
        `.storage` lisible à l'œil quand on diagnostique, les clés `id:` étant
        des identifiants de catalogue opaques.
        """
        present = key in self._entries
        if read == present:
            return False
        if read:
            entry: dict[str, Any] = {"marked_at": now.isoformat()}
            if titre:
                entry["titre"] = titre
            self._entries[key] = entry
        else:
            self._entries.pop(key, None)
        await self._async_write(self._entries)
        return True


async def async_get_read_status(hass: HomeAssistant) -> ReadStatus:
    """Le ReadStatus du domaine, créé et relu une seule fois.

    `setdefault` et non un « si absent, créer » en deux temps : les setups de
    deux entrées tournent concurremment, et le moindre `await` entre le test et
    l'affectation laisserait chacune installer son propre objet — donc deux
    vues divergentes du même fichier, la dernière écriture écrasant l'autre.
    `setdefault` est atomique faute de point de suspension.

    Le chargement, lui, est protégé par le verrou interne de l'objet.
    """
    status: ReadStatus = hass.data.setdefault(
        READ_STATUS_KEY,
        ReadStatus(Store(hass, STORAGE_VERSION, STORAGE_KEY)),
    )
    await status.async_ensure_loaded(dt_util.utcnow())
    return status
