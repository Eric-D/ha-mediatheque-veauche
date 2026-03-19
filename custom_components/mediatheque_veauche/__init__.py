"""The Médiathèque de Veauche integration."""
from __future__ import annotations

import logging
from pathlib import Path

from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [Platform.SENSOR]

CARD_URL = f"/{DOMAIN}/mediatheque-card.js"


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Set up the integration via async_setup (runs once at HA start)."""
    if DOMAIN + "_static_registered" in hass.data:
        return True

    component_dir = Path(__file__).parent
    static_paths = []

    # Card JS
    card_path = component_dir / "www" / "mediatheque-card.js"
    if card_path.is_file():
        static_paths.append(StaticPathConfig(CARD_URL, str(card_path), True))

    # Icons
    for filename in ("icon.png", "icon@2x.png", "logo.png", "logo@2x.png"):
        path = component_dir / filename
        if path.is_file():
            static_paths.append(
                StaticPathConfig(f"/{DOMAIN}/{filename}", str(path), True)
            )

    if static_paths:
        await hass.http.async_register_static_paths(static_paths)

    add_extra_js_url(hass, CARD_URL)
    hass.data[DOMAIN + "_static_registered"] = True

    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Médiathèque de Veauche from a config entry."""
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = entry.data

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

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
