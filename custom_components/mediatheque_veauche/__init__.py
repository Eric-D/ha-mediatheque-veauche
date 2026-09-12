"""The Médiathèque de Veauche integration."""
from __future__ import annotations

import copy
import logging
from pathlib import Path

import voluptuous as vol

from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant, ServiceCall
import homeassistant.helpers.config_validation as cv
from homeassistant.helpers.start import async_at_started

from .const import CONF_PASSWORD, CONF_USERNAME, DOMAIN
from .scraper import MediathequeVeaucheClient

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [Platform.SENSOR]

CARD_VERSION = "3.5.0"
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


def _get_lovelace_resources(hass: HomeAssistant):
    """Récupère la collection de ressources Lovelace, ou None si indisponible.

    La forme de hass.data['lovelace'] a changé selon les versions de HA
    (dataclass LovelaceData récemment, dict auparavant), et en mode YAML la
    collection n'est pas modifiable. On sonde défensivement : à défaut, on
    retombe simplement sur add_extra_js_url.
    """
    lovelace = hass.data.get("lovelace")
    if lovelace is None:
        return None
    resources = getattr(lovelace, "resources", None)
    if resources is None and isinstance(lovelace, dict):
        resources = lovelace.get("resources")
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
    except Exception:  # noqa: BLE001 - ne doit jamais empêcher le setup
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


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Médiathèque de Veauche from a config entry."""
    hass.data.setdefault(DOMAIN, {})

    username = entry.data[CONF_USERNAME]
    password = entry.data[CONF_PASSWORD]
    client = MediathequeVeaucheClient(username, password)

    hass.data[DOMAIN][entry.entry_id] = {
        "client": client,
        "username": username,
        # Mémorisé pour que le listener de mise à jour sache distinguer un
        # changement d'options d'un simple changement de données.
        "options": dict(entry.options),
    }

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    # Register extend_loan service (once)
    if not hass.services.has_service(DOMAIN, SERVICE_EXTEND_LOAN):
        async def handle_extend_loan(call: ServiceCall) -> None:
            """Handle the extend_loan service call."""
            extend_url = call.data["extend_url"]
            for entry_data in hass.data[DOMAIN].values():
                if not isinstance(entry_data, dict) or "client" not in entry_data:
                    continue
                try:
                    await hass.async_add_executor_job(
                        entry_data["client"].extend_loan, extend_url
                    )
                except Exception as err:
                    _LOGGER.error("Erreur lors de la prolongation: %s", err)
                    raise
                # Update coordinator data to reflect the extension
                coordinator = entry_data.get("coordinator")
                if coordinator and coordinator.data:
                    updated = _mark_loan_extended(coordinator.data, extend_url)
                    if updated is not None:
                        coordinator.async_set_updated_data(updated)
                    else:
                        _LOGGER.warning(
                            "Prolongation réussie mais prêt introuvable dans les "
                            "données du coordinator (%s) : la carte ne se mettra "
                            "à jour qu'au prochain cycle",
                            extend_url,
                        )
                return
            _LOGGER.error("Aucun client disponible pour la prolongation")

        hass.services.async_register(
            DOMAIN, SERVICE_EXTEND_LOAN, handle_extend_loan, schema=SERVICE_EXTEND_SCHEMA
        )

    entry.async_on_unload(entry.add_update_listener(async_update_options))

    return True


async def async_update_options(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Recharge l'entrée, mais seulement si les options ont réellement changé.

    async_update_reload_and_abort — utilisé par les flux de reconfiguration et
    de ré-authentification — met à jour l'entrée ET programme un rechargement.
    La mise à jour déclenche au passage ce listener, d'où un second
    rechargement : deux cycles unload/setup, donc deux connexions consécutives
    au portail, juste après qu'on l'a soupçonné de refuser le compte.
    """
    stored = hass.data.get(DOMAIN, {}).get(entry.entry_id, {})
    if isinstance(stored, dict) and stored.get("options") == dict(entry.options):
        return
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id, None)
    return unload_ok
