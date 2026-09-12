"""Obtention et mise en cache des données, hors de toute classe d'entité.

Ce code vivait dans une closure de `sensor.async_setup_entry`. Il y était
**intestable** : `sensor.py` n'est pas importable sous les mocks de
`tests/conftest.py`, parce que `class _MediathequeBase(CoordinatorEntity,
SensorEntity)` lève un conflit de métaclasse quand les deux bases sont des
MagicMock. Tout ce qui décide de ce que voit l'utilisateur quand le portail est
indisponible — repli sur cache, marquage de fraîcheur, ré-authentification —
n'était donc couvert que par relecture.

Ce module n'hérite de rien et n'importe que des symboles simulables, ce qui le
rend importable sous les mocks. Même motif que `_async_extend_loan` dans
`__init__.py`, sorti de sa closure pour la même raison.
"""
from __future__ import annotations

import logging
from datetime import date
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryAuthFailed
from homeassistant.helpers.storage import Store
from homeassistant.helpers.update_coordinator import UpdateFailed
from homeassistant.util import dt as dt_util

from .const import DOMAIN
from .dates import with_days_left
from .scraper import InvalidCredentialsError

_LOGGER = logging.getLogger(__name__)

STORAGE_VERSION = 1


def _is_number(value: object) -> bool:
    """Nombre exploitable pour une comparaison (None accepté, bool refusé)."""
    return value is None or (isinstance(value, (int, float)) and not isinstance(value, bool))


def is_valid_payload(data: object) -> bool:
    """Vérifie qu'un payload (souvent relu du cache disque) a la forme attendue.

    Le Store versionne le conteneur, pas le contenu : un cache écrit par une
    version antérieure peut manquer de clés et faire lever les sensors à chaque
    écriture d'état. Mieux vaut l'ignorer que casser l'intégration.
    """
    if not isinstance(data, dict):
        return False
    membres = data.get("membres")
    if not isinstance(membres, dict):
        return False
    for loans in membres.values():
        if not isinstance(loans, list):
            return False
        for loan in loans:
            if not isinstance(loan, dict):
                return False
            # days_left n'est plus relu du cache — with_days_left l'écrase —
            # mais un cache hérité en contient, et un format qui aurait dérivé
            # à ce point sur une clé connue n'est pas un cache de confiance.
            # None passe : c'est la forme du cache écrit depuis 3.7.
            if not _is_number(loan.get("days_left")):
                return False
    subscription = data.get("subscription")
    return subscription is None or isinstance(subscription, dict)


async def async_take_over_legacy_cache(hass: HomeAssistant, username: str) -> dict:
    """Récupère le cache de l'ancien nom de fichier, puis le supprime.

    Se tromper ici ne coûte qu'un cycle de rafraîchissement, jamais de
    l'historique : à défaut, le coordinator repart simplement à vide.
    """
    legacy = Store(hass, STORAGE_VERSION, f"{DOMAIN}_{username}_cache")
    try:
        data = await legacy.async_load() or {}
        if data:
            _LOGGER.info("Reprise du cache disque hérité de %s", username)
            await legacy.async_remove()
        return data
    except Exception:
        _LOGGER.exception("Reprise du cache hérité impossible")
        return {}


async def async_load_cache(hass: HomeAssistant, store: Store, username: str) -> dict:
    """Relit le cache disque, en écartant ce qui n'est pas exploitable."""
    cached = await store.async_load() or {}
    if not cached:
        cached = await async_take_over_legacy_cache(hass, username)
    if not isinstance(cached, dict):
        _LOGGER.warning("Cache disque corrompu (conteneur %s), ignoré", type(cached).__name__)
        return {}
    if cached.get("data") is not None and not is_valid_payload(cached["data"]):
        _LOGGER.warning(
            "Cache disque au format inattendu (écrit par une version antérieure ?), ignoré"
        )
        cached.pop("data", None)
        cached.pop("last_success", None)
    return cached


class MediathequeDataSource:
    """Méthode de mise à jour du coordinator, et le cache qui va avec.

    `state` est partagé avec le capteur « Dernière mise à jour » : il le lit
    pour sa valeur. `coordinator` est posé après coup par l'appelant, le
    coordinator ayant besoin de `async_update` pour être construit. Il ne sert
    qu'au repli sur cache, qui doit repartir des données en mémoire pour
    conserver les prolongations marquées depuis le dernier fetch.
    """

    def __init__(
        self,
        hass: HomeAssistant,
        client: Any,
        store: Store,
        cached: dict,
        state: dict,
    ) -> None:
        self.hass = hass
        self.client = client
        self.store = store
        self.cached = cached
        self.state = state
        self.coordinator: Any = None

    def _today(self) -> date:
        """Date du jour dans le fuseau de Home Assistant, pas celui de l'hôte."""
        return dt_util.now().date()

    async def async_update(self) -> dict:
        """Récupère les données, avec repli sur le cache disque."""
        try:
            raw = await self.hass.async_add_executor_job(self.client.fetch_all)
            self.state["last_success"] = dt_util.utcnow().isoformat()
            # Le cache disque reçoit la sortie brute du scraper : y écrire les
            # marqueurs de fraîcheur — ou les délais, qui dépendent du jour —
            # les figerait pour la prochaine relecture.
            self.cached["data"] = raw
            self.cached["last_success"] = self.state["last_success"]
            await self.store.async_save(self.cached)
            data = with_days_left(raw, self._today())
            _LOGGER.info(
                "Données récupérées: %d emprunts, %d à rendre cette semaine, %d en retard",
                data.get("total", 0),
                data.get("due_this_week", 0),
                data.get("overdue", 0),
            )
            return {**data, "last_success": self.state["last_success"], "fetch_ok": True}
        except InvalidCredentialsError as err:
            # Pas de repli sur le cache : réessayer ne servira à rien, et
            # continuer à servir des données périmées masquerait le vrai
            # problème. ConfigEntryAuthFailed déclenche la notification
            # « Reconfigurer » de Home Assistant.
            _LOGGER.warning("Identifiants refusés par la médiathèque: %s", err)
            raise ConfigEntryAuthFailed(str(err)) from err
        except Exception as err:
            _LOGGER.warning("Échec de la mise à jour des données: %s", err)
            if self.cached.get("data"):
                _LOGGER.info(
                    "Utilisation des données en cache (dernier fetch: %s)",
                    self.state["last_success"],
                )
                # Copie marquée : sans horodatage d'échec, le payload serait
                # identique au cycle précédent, HA dédoublonnerait l'écriture
                # d'état et la carte n'aurait aucun moyen de savoir que les
                # données affichées sont périmées.
                # coordinator.data plutôt que cached["data"] : il porte les
                # prolongations marquées en mémoire depuis le dernier fetch.
                current = self.coordinator.data if self.coordinator else None
                base = current if current else self.cached["data"]
                # Recalculé ici aussi : c'est le seul chemin où les données
                # peuvent traverser un minuit sans nouveau scrape.
                return {
                    **with_days_left(base, self._today()),
                    "last_success": self.state["last_success"],
                    "fetch_ok": False,
                    "last_error_at": dt_util.utcnow().isoformat(),
                }
            raise UpdateFailed(f"Error fetching library data: {err}") from err
