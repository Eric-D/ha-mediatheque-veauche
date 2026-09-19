"""The Médiathèque de Veauche integration."""
from __future__ import annotations

import copy
import logging
from pathlib import Path
from typing import Any

import homeassistant.helpers.config_validation as cv
import voluptuous as vol
from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry, ConfigEntryState
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant, ServiceCall, callback
from homeassistant.exceptions import HomeAssistantError, ServiceValidationError
from homeassistant.helpers.start import async_at_started
from homeassistant.util import dt as dt_util

from .const import CONF_PASSWORD, CONF_USERNAME, DOMAIN
from .coordinator import MediathequeConfigEntry, MediathequeRuntimeData
from .migration import async_migrate_unique_ids
from .read_status import READ_STATUS_KEY, async_get_read_status
from .scraper import MediathequeVeaucheClient

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [Platform.SENSOR]

CARD_VERSION = "4.2.0"
CARD_URL = f"/{DOMAIN}/mediatheque-card.js"
# Même URL exacte pour les deux mécanismes d'injection : un module ES n'est
# évalué qu'une fois par URL, donc le double enregistrement est gratuit et ne
# produit ni double téléchargement ni double bannière.
CARD_RESOURCE_URL = f"{CARD_URL}?v={CARD_VERSION}"

# Sans ce schéma, Home Assistant n'a aucun moyen de savoir que le domaine
# n'accepte pas de configuration YAML : un « mediatheque_veauche: » égaré dans
# configuration.yaml serait accepté en silence au lieu d'être signalé.
# hassfest le réclame dès lors qu'async_setup est défini.
CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

SERVICE_EXTEND_LOAN = "extend_loan"
SERVICE_EXTEND_SCHEMA = vol.Schema({
    vol.Required("extend_url"): cv.url,
})
SERVICE_SET_READ = "set_read"
SERVICE_SET_READ_SCHEMA = vol.Schema({
    vol.Required("read_key"): cv.string,
    vol.Required("read"): cv.boolean,
})


def _mark_loan_extended(data: dict, extend_url: str) -> dict | None:
    """Renvoie une copie de `data` où le prêt visé est marqué comme prolongé.

    Surtout pas de mutation en place : l'ancien State de HA référence les mêmes
    dicts de prêts, donc la comparaison d'attributs les verrait déjà modifiés,
    aucun state_changed ne serait émis et la carte n'afficherait la prolongation
    qu'au prochain cycle de poll.
    """
    for member, loans in (data.get("membres") or {}).items():
        for index, loan in enumerate(loans):
            if loan.get("extend_url") == extend_url:
                updated = copy.deepcopy(data)
                marked = updated["membres"][member][index]
                marked["can_extend"] = False
                marked["extended"] = True
                marked["extend_url"] = None
                return updated
    return None


def _owns_loan(entry_data: MediathequeRuntimeData, extend_url: str) -> bool:
    """Le compte de cette entrée a-t-il un prêt portant cette URL ?"""
    data = getattr(entry_data.coordinator, "data", None) or {}
    membres = data.get("membres")
    if not isinstance(membres, dict):
        return False
    # Les gardes portent sur chaque niveau : une exception ici interromprait la
    # boucle de _select_entry, et un seul compte aux données corrompues
    # empêcherait tous les autres de prolonger.
    return any(
        isinstance(loan, dict) and loan.get("extend_url") == extend_url
        for loans in membres.values()
        if isinstance(loans, list)
        for loan in loans
    )


def _select_entry(
    entries: list[tuple[str, MediathequeRuntimeData]], extend_url: str
) -> tuple[str, MediathequeRuntimeData] | None:
    """Choisit le compte à qui appartient ce prêt.

    Fonction pure, séparée du handler pour être testable sans Home Assistant.

    Aucun repli sur « le seul compte configuré » : la carte ne peut proposer
    « Prolonger » que pour une URL lue dans les attributs du coordinator, et
    sensor.py pré-remplit ce coordinator depuis le cache disque avant même
    d'ajouter les entités. Une URL introuvable est donc périmée ou étrangère,
    jamais un démarrage à froid.

    Le repli était d'ailleurs contre-productif : avec deux comptes dont un en
    échec de configuration, il ne restait qu'une entrée, et l'URL du compte
    absent partait sur la session de l'autre — exactement le bug corrigé ici,
    mais redevenu silencieux.
    """
    for entry_id, data in entries:
        if _owns_loan(data, extend_url):
            return entry_id, data
    return None


def _loan_entries(hass: HomeAssistant) -> list[tuple[str, MediathequeRuntimeData]]:
    """Comptes utilisables, dans l'ordre d'ajout à la collection.

    Deux filtres, et les deux sont nécessaires :

    - `runtime_data` n'existe pas tant qu'async_setup_entry ne l'a pas posé, et
      Home Assistant le supprime au déchargement réussi. Ça écarte les entrées
      désactivées, ignorées et déchargées.
    - l'état, parce que `runtime_data` est posé en première instruction et
      **survit à un setup qui échoue ensuite** : HA ne le supprime que sur le
      chemin du déchargement. Sans ce filtre, un compte resté en erreur
      continue de compter — et empêche le retrait du service `extend_loan` le
      jour où le dernier compte valide est supprimé. C'était déjà le défaut du
      dictionnaire global ; le porter tel quel l'aurait reconduit.

    L'ordre n'est plus celui d'achèvement des setups, qui tournent
    concurremment, mais celui d'ajout à la collection. Plus déterministe, sans
    conséquence ici : le choix du compte se fait sur la possession du prêt.
    """
    return [
        (entry.entry_id, data)
        for entry in hass.config_entries.async_entries(DOMAIN)
        if entry.state is ConfigEntryState.LOADED
        and (data := getattr(entry, "runtime_data", None)) is not None
    ]


async def _async_extend_loan(hass: HomeAssistant, extend_url: str) -> None:
    """Prolonge un prêt sur le compte qui le détient.

    Au niveau module et non dans une closure : c'est le seul moyen de tester le
    câblage — que le client appelé et le coordinator mis à jour soient bien ceux
    de l'entrée sélectionnée. Tester la seule fonction de sélection laissait
    passer une régression qui aurait rebranché le tout sur la première entrée.
    """
    entries = _loan_entries(hass)
    if not entries:
        raise ServiceValidationError(
            "Aucun compte médiathèque configuré pour prolonger ce prêt"
        )

    selected = _select_entry(entries, extend_url)
    if selected is None:
        raise ServiceValidationError(
            "Prêt introuvable dans les données des comptes configurés : "
            "impossible de déterminer lequel doit le prolonger"
        )

    entry_id, entry_data = selected
    try:
        await hass.async_add_executor_job(entry_data.client.extend_loan, extend_url)
    except Exception as err:
        # Enveloppé : sans ça, l'erreur brute de requests remonte en « erreur
        # inconnue » avec une trace complète, et son message — qui contient
        # l'URL de prolongation — s'affiche tel quel dans la notification.
        _LOGGER.error("Erreur lors de la prolongation: %s", err)
        raise HomeAssistantError(f"La prolongation a échoué : {err}") from err

    coordinator = entry_data.coordinator
    if coordinator and coordinator.data:
        updated = _mark_loan_extended(coordinator.data, extend_url)
        if updated is not None:
            coordinator.async_set_updated_data(updated)
        else:
            _LOGGER.warning(
                "Prolongation réussie mais prêt introuvable dans les données du "
                "compte %s : la carte ne se mettra à jour qu'au prochain cycle",
                entry_id,
            )


def _mark_loans_read(data: dict, read_key: str, read: bool) -> tuple[dict | None, str | None]:
    """Copie de `data` où tout prêt portant cette clé est (dé)marqué lu.

    Renvoie aussi le titre rencontré, pour que le fichier de `.storage` reste
    lisible à l'œil : les clés `id:` sont des identifiants de catalogue opaques.

    Tous les prêts portant la clé sont marqués, pas seulement le premier : la
    portée étant le foyer, deux membres qui ont emprunté le même titre doivent
    voir le badge basculer ensemble. Copie et non mutation, même raison que
    `_mark_loan_extended`.
    """
    membres = data.get("membres")
    if not isinstance(membres, dict):
        return None, None

    updated: dict | None = None
    titre: str | None = None
    for membre, loans in membres.items():
        if not isinstance(loans, list):
            continue
        for index, loan in enumerate(loans):
            if not isinstance(loan, dict) or loan.get("read_key") != read_key:
                continue
            if titre is None and isinstance(loan.get("titre"), str):
                titre = loan["titre"]
            if loan.get("read") == read:
                continue
            if updated is None:
                updated = copy.deepcopy(data)
            updated["membres"][membre][index]["read"] = read
    return updated, titre


async def _async_set_read(hass: HomeAssistant, read_key: str, read: bool) -> None:
    """Marque un livre lu ou non lu, sur tous les comptes à la fois.

    Au niveau module et non dans une closure, pour la raison donnée à
    `_async_extend_loan` : c'est le seul moyen de tester le câblage.

    Aucune sélection de compte ici, contrairement à la prolongation : l'état de
    lecture est global au foyer, donc le même livre emprunté par deux membres
    bascule partout. C'est aussi pourquoi l'écriture disque a lieu même si
    aucun prêt en cours ne porte la clé — on peut marquer lu un livre qu'on
    vient de rendre, et le marquage doit survivre pour le prochain emprunt.
    """
    entries = _loan_entries(hass)
    if not entries:
        raise ServiceValidationError(
            "Aucun compte médiathèque configuré pour enregistrer l'état de lecture"
        )

    marked: list[tuple[Any, dict]] = []
    titre: str | None = None
    for _entry_id, entry_data in entries:
        coordinator = entry_data.coordinator
        if not coordinator or not coordinator.data:
            continue
        updated, found = _mark_loans_read(coordinator.data, read_key, read)
        if titre is None:
            titre = found
        if updated is not None:
            marked.append((coordinator, updated))

    status = await async_get_read_status(hass)
    try:
        await status.async_set(read_key, read, dt_util.utcnow(), titre)
    except Exception as err:
        # Avant toute mise à jour des coordinators : sans ça la carte
        # afficherait le badge alors que rien n'est sur le disque, et le
        # prochain redémarrage le ferait disparaître sans explication.
        _LOGGER.error("Écriture de l'état « lu » impossible: %s", err)
        raise HomeAssistantError(
            f"L'enregistrement de l'état de lecture a échoué : {err}"
        ) from err

    for coordinator, updated in marked:
        coordinator.async_set_updated_data(updated)


def _get_lovelace_resources(hass: HomeAssistant):
    """Récupère la collection de ressources Lovelace, ou None si indisponible.

    On sonde défensivement plutôt que d'importer le composant lovelace : un
    import créerait une dépendance que hassfest exigerait de déclarer dans le
    manifeste. À défaut de collection, on retombe sur add_extra_js_url.

    Le repli sur `lovelace.get("resources")` a disparu avec le plancher 2026 :
    hass.data["lovelace"] était un dict jusqu'en 2025.1, c'est la dataclass
    LovelaceData depuis 2025.2.
    """
    lovelace = hass.data.get("lovelace")
    if lovelace is None:
        return None
    resources = getattr(lovelace, "resources", None)
    if resources is None:
        return None
    # Mode YAML : collection en lecture seule, les ressources sont déclarées
    # dans configuration.yaml et c'est à l'utilisateur de le faire.
    if getattr(resources, "store", None) is None:
        return None
    return resources


async def _async_register_lovelace_resource(hass: HomeAssistant) -> bool:
    """Déclare la carte comme ressource Lovelace. True si c'est en place.

    C'est le mécanisme à privilégier, et pas seulement pour l'ordre de
    chargement : Home Assistant charge @webcomponents/scoped-custom-element-
    registry, qui REMPLACE window.customElements par sa propre implémentation
    et sa propre table, sans jamais consulter le registre natif. Un module
    injecté par add_extra_js_url est évalué avant ce remplacement : sa
    définition atterrit dans le registre natif et reste invisible à HA, qui
    affiche « Custom element doesn't exist » de façon définitive.

    Les ressources Lovelace sont chargées par le panneau, donc bien après
    l'installation du polyfill. C'est pour cette raison que les cartes
    distribuées en ressource ne rencontrent jamais ce problème.
    """
    try:
        resources = _get_lovelace_resources(hass)
        if resources is None:
            return False

        if not resources.loaded:
            await resources.async_get_info()

        for item in resources.async_items():
            url = item.get("url", "")
            if url.split("?")[0] != CARD_URL:
                continue
            if url == CARD_RESOURCE_URL:
                return True
            # Version changée : on met à jour plutôt que d'accumuler les
            # doublons, sinon deux versions du module coexisteraient et la
            # première enregistrée gagnerait.
            await resources.async_update_item(item["id"], {"url": CARD_RESOURCE_URL})
            _LOGGER.info("Ressource Lovelace mise à jour : %s", CARD_RESOURCE_URL)
            return True

        await resources.async_create_item(
            {"res_type": "module", "url": CARD_RESOURCE_URL}
        )
        _LOGGER.info("Ressource Lovelace enregistrée : %s", CARD_RESOURCE_URL)
        return True
    except Exception:
        # Volontairement large : l'enregistrement de la ressource ne doit jamais
        # empêcher le setup de l'intégration. À défaut, la carte reste injectée
        # par add_extra_js_url.
        _LOGGER.exception("Enregistrement de la ressource Lovelace impossible")
        return False


async def _async_setup_card(hass: HomeAssistant) -> None:
    """Rend la carte disponible, par le chemin le plus sûr d'abord."""
    if await _async_register_lovelace_resource(hass):
        return

    # Repli : mode YAML, ou API des ressources inattendue. La carte sera
    # injectée dans le document, donc potentiellement évaluée avant le polyfill
    # de registre — le module sait se ré-enregistrer dans ce cas, mais mieux
    # vaut que l'utilisateur sache pourquoi.
    _LOGGER.warning(
        "Ressources Lovelace non modifiables (mode YAML ?) : repli sur "
        "add_extra_js_url. Pour un chargement plus fiable, déclarez la "
        "ressource vous-même : url %s, type « module ».",
        CARD_RESOURCE_URL,
    )
    add_extra_js_url(hass, CARD_RESOURCE_URL)


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Set up the integration via async_setup (runs once at HA start)."""
    if DOMAIN + "_static_registered" in hass.data:
        return True

    # Card JS — icons are served via brand/ directory (brands proxy API)
    card_path = Path(__file__).parent / "www" / "mediatheque-card.js"
    if not card_path.is_file():
        # Sans ce garde-fou on injecterait un <script> vers une URL en 404 :
        # la carte ne serait jamais définie et HA afficherait une carte en
        # erreur sans que rien n'apparaisse dans les logs.
        _LOGGER.error(
            "Fichier de la carte introuvable (%s) — la carte Lovelace ne sera "
            "pas disponible. Réinstallez l'intégration via HACS puis redémarrez "
            "Home Assistant.",
            card_path,
        )
        hass.data[DOMAIN + "_static_registered"] = True
        return True

    await hass.http.async_register_static_paths(
        [StaticPathConfig(CARD_URL, str(card_path), False)]
    )

    # Après le démarrage : le composant lovelace n'est pas encore configuré au
    # moment où async_setup tourne. On n'injecte plus systématiquement le script
    # dans le document — c'était précisément la cause du « Custom element
    # doesn't exist » intermittent.
    async_at_started(hass, _async_setup_card)

    hass.data[DOMAIN + "_static_registered"] = True

    return True


async def async_setup_entry(hass: HomeAssistant, entry: MediathequeConfigEntry) -> bool:
    """Set up Médiathèque de Veauche from a config entry."""
    username = entry.data[CONF_USERNAME]
    password = entry.data[CONF_PASSWORD]

    entry.runtime_data = MediathequeRuntimeData(
        client=MediathequeVeaucheClient(username, password),
        username=username,
    )

    # Register extend_loan service (once)
    if not hass.services.has_service(DOMAIN, SERVICE_EXTEND_LOAN):
        async def handle_extend_loan(call: ServiceCall) -> None:
            """Point d'entrée du service ; la logique est testable au niveau module."""
            await _async_extend_loan(hass, call.data["extend_url"])

        hass.services.async_register(
            DOMAIN, SERVICE_EXTEND_LOAN, handle_extend_loan, schema=SERVICE_EXTEND_SCHEMA
        )

    if not hass.services.has_service(DOMAIN, SERVICE_SET_READ):
        async def handle_set_read(call: ServiceCall) -> None:
            """Point d'entrée du service ; la logique est testable au niveau module."""
            await _async_set_read(hass, call.data["read_key"], call.data["read"])

        hass.services.async_register(
            DOMAIN, SERVICE_SET_READ, handle_set_read, schema=SERVICE_SET_READ_SCHEMA
        )

    # Avant le forward vers la plateforme sensor, qui en a besoin pour servir
    # son pré-remplissage depuis le cache : sans ça le premier rendu après un
    # redémarrage n'aurait aucun badge « Lu », jusqu'au premier fetch.
    await async_get_read_status(hass)

    # Avant la création des entités : leurs identifiants uniques dérivaient du
    # login, donc en changer aurait créé cinq entités neuves et orpheliné les
    # anciennes. Idempotente, donc rejouée à chaque démarrage.
    await async_migrate_unique_ids(hass, entry)

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    entry.async_on_unload(entry.add_update_listener(async_update_options))

    return True


@callback
def update_entry_and_ensure_reload(
    hass: HomeAssistant, entry: ConfigEntry, **updates: Any
) -> None:
    """Met à jour l'entrée en garantissant qu'elle sera rechargée.

    Pas async_update_reload_and_abort : il programme lui-même un rechargement
    alors qu'un listener de mise à jour est enregistré, ce que Home Assistant
    déprécie avec une casse annoncée en 2026.12.

    Deux cas n'appellent aucun listener et exigent donc un rechargement
    explicite :

    - l'entrée n'a pas changé — reconfiguration rouverte puis resoumise à
      l'identique — auquel cas async_update_entry renvoie False sans rien
      notifier ;
    - aucun listener n'est enregistré : entrée désactivée, ou async_setup_entry
      interrompu avant add_update_listener — une migration qui lève, par
      exemple. Ce n'est PAS le cas d'une réauthentification : le
      ConfigEntryAuthFailed vient d'un rafraîchissement de fond, postérieur au
      setup, qui laisse l'entrée LOADED et son listener en place.

    Sans ça l'entrée resterait en erreur alors que les identifiants viennent
    d'être validés.
    """
    changed = hass.config_entries.async_update_entry(entry, **updates)
    if not changed or not entry.update_listeners:
        hass.config_entries.async_schedule_reload(entry.entry_id)


async def async_update_options(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Recharge l'entrée après toute modification.

    Ce listener est le SEUL endroit qui recharge sur modification, et c'est ce
    que Home Assistant attend d'une intégration qui en enregistre un :
    async_update_reload_and_abort déprécie le fait de programmer lui-même un
    rechargement dans ce cas, avec une casse annoncée en 2026.12.

    Il était auparavant conditionné aux options, pour éviter le double
    rechargement que produisait async_update_reload_and_abort. Cette condition
    n'a plus lieu d'être — et la garder rendrait une reconfiguration sans
    effet, puisqu'elle ne touche que les données.
    """
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry: MediathequeConfigEntry) -> bool:
    """Unload a config entry.

    Rien à nettoyer : Home Assistant supprime runtime_data lui-même quand le
    déchargement réussit.
    """
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)


async def async_remove_entry(hass: HomeAssistant, entry: MediathequeConfigEntry) -> None:
    """Retire le service quand le dernier compte est supprimé.

    Au retrait de l'entrée et non à son déchargement : un rechargement passe
    par unload puis setup, et retirer le service entre les deux laisserait une
    fenêtre — le temps du setup de la plateforme, entrées/sorties disque
    comprises — pendant laquelle un clic sur la carte reçoit ServiceNotFound.
    Les rechargements sont fréquents : changement d'options, reconfiguration,
    ré-authentification.
    """
    # Pas d'exclusion de l'entrée en cours de suppression : Home Assistant la
    # décharge avant d'appeler ce handler, donc son état n'est plus LOADED et
    # le filtre d'état de _loan_entries l'écarte déjà. Se fier à sa présence
    # dans la collection serait de toute façon fragile : HA a inversé l'ordre
    # en 2025.3 — auparavant l'entrée était encore listée ici, depuis elle en
    # est déjà sortie.
    if _loan_entries(hass):
        return
    for service in (SERVICE_EXTEND_LOAN, SERVICE_SET_READ):
        if hass.services.has_service(DOMAIN, service):
            hass.services.async_remove(DOMAIN, service)
    # L'état de lecture reste sur le disque : supprimer le compte n'est pas
    # renoncer à savoir ce qu'on a lu, et le reconfigurer doit retrouver ses
    # badges. Seul le singleton en mémoire part, sans quoi un ReadStatus
    # rattaché à l'ancien Store survivrait au retrait.
    hass.data.pop(READ_STATUS_KEY, None)
