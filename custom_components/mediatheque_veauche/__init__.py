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

from .const import CONF_PASSWORD, CONF_USERNAME, DOMAIN
from .scraper import MediathequeVeaucheClient

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [Platform.SENSOR]

CARD_VERSION = "3.3.0"
CARD_URL = f"/{DOMAIN}/mediatheque-card.js"

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
    add_extra_js_url(hass, f"{CARD_URL}?v={CARD_VERSION}")
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
    """Handle options update."""
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id, None)
    return unload_ok
