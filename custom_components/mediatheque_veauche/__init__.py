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
ICON_URL = f"/{DOMAIN}/icon.png"
LOGO_URL = f"/{DOMAIN}/logo.png"


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Médiathèque de Veauche from a config entry."""
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = entry.data

    # Register the Lovelace card JS and icons
    await _register_card(hass)
    await _register_icons(hass)

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    entry.async_on_unload(entry.add_update_listener(async_update_options))

    return True


async def _register_card(hass: HomeAssistant) -> None:
    """Register the custom Lovelace card."""
    if DOMAIN + "_card_registered" in hass.data:
        return

    card_path = Path(__file__).parent / "www" / "mediatheque-card.js"
    if not card_path.is_file():
        _LOGGER.warning("Card JS file not found: %s", card_path)
        return

    # Serve the JS file at a static URL
    await hass.http.async_register_static_paths(
        [StaticPathConfig(CARD_URL, str(card_path), True)]
    )
    add_extra_js_url(hass, CARD_URL)

    # Also register as a Lovelace resource for reliable loading
    try:
        lovelace = hass.data.get("lovelace")
        if lovelace:
            resources = lovelace.get("resources")
            if resources is not None:
                # Check if already registered
                for item in resources.async_items():
                    if CARD_URL in item.get("url", ""):
                        break
                else:
                    await resources.async_create_item(
                        {"res_type": "module", "url": CARD_URL}
                    )
    except Exception:
        _LOGGER.debug("Could not auto-register Lovelace resource, manual setup needed")

    hass.data[DOMAIN + "_card_registered"] = True


async def _register_icons(hass: HomeAssistant) -> None:
    """Serve integration icons via static paths."""
    if DOMAIN + "_icons_registered" in hass.data:
        return

    component_dir = Path(__file__).parent
    static_paths = []

    for filename, url in [
        ("icon.png", ICON_URL),
        ("icon@2x.png", f"/{DOMAIN}/icon@2x.png"),
        ("logo.png", LOGO_URL),
        ("logo@2x.png", f"/{DOMAIN}/logo@2x.png"),
    ]:
        path = component_dir / filename
        if path.is_file():
            static_paths.append(StaticPathConfig(url, str(path), True))

    if static_paths:
        await hass.http.async_register_static_paths(static_paths)

    hass.data[DOMAIN + "_icons_registered"] = True


async def async_update_options(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Handle options update."""
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id, None)
    return unload_ok
