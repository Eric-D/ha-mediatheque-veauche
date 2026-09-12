"""Config flow for Médiathèque de Veauche."""
from __future__ import annotations

import logging
from collections.abc import Mapping
from typing import Any

import voluptuous as vol
from homeassistant.config_entries import ConfigEntry, ConfigFlow, OptionsFlow
from homeassistant.core import callback
from homeassistant.data_entry_flow import FlowResult

from .const import (
    CONF_PASSWORD,
    CONF_SCAN_INTERVAL,
    CONF_USERNAME,
    DEFAULT_SCAN_INTERVAL,
    DOMAIN,
)
from .migration import async_migrate_unique_ids
from .scraper import (
    AuthenticationError,
    InvalidCredentialsError,
    MediathequeVeaucheClient,
)

_LOGGER = logging.getLogger(__name__)

STEP_USER_DATA_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_USERNAME): str,
        vol.Required(CONF_PASSWORD): str,
        vol.Optional(CONF_SCAN_INTERVAL, default=DEFAULT_SCAN_INTERVAL): vol.All(
            int, vol.Range(min=5, max=1440)
        ),
    }
)


class MediathequeVeaucheConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Médiathèque de Veauche."""

    VERSION = 1

    async def _async_validate(self, username: str, password: str) -> str | None:
        """Tente une connexion. Renvoie une clé d'erreur, ou None si ça passe.

        InvalidCredentialsError est distingué à dessein : un échec structurel
        (page de connexion modifiée, portail en maintenance) ne doit pas
        s'afficher « identifiants invalides » à l'utilisateur, qui chercherait
        au mauvais endroit.
        """
        client = MediathequeVeaucheClient(username, password)
        try:
            await self.hass.async_add_executor_job(client.login)
        except InvalidCredentialsError:
            return "invalid_auth"
        except AuthenticationError:
            _LOGGER.warning("Échec d'authentification non lié aux identifiants")
            return "cannot_connect"
        except Exception:
            _LOGGER.exception("Erreur inattendue à la connexion")
            return "cannot_connect"
        return None

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the initial step."""
        errors: dict[str, str] = {}

        if user_input is not None:
            # Check if already configured with same username
            await self.async_set_unique_id(user_input[CONF_USERNAME])
            self._abort_if_unique_id_configured()

            error = await self._async_validate(
                user_input[CONF_USERNAME], user_input[CONF_PASSWORD]
            )
            if error:
                errors["base"] = error
            else:
                return self.async_create_entry(
                    title=f"Médiathèque ({user_input[CONF_USERNAME]})",
                    data=user_input,
                )

        return self.async_show_form(
            step_id="user",
            data_schema=STEP_USER_DATA_SCHEMA,
            errors=errors,
        )

    async def async_step_reconfigure(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle reconfiguration of credentials."""
        errors: dict[str, str] = {}
        # _get_reconfigure_entry lève UnknownEntry au lieu de renvoyer None,
        # qui produisait un AttributeError opaque plus bas.
        entry = self._get_reconfigure_entry()

        if user_input is not None:
            new_username = user_input[CONF_USERNAME]
            if self._username_taken_by_another_entry(entry, new_username):
                errors["base"] = "already_configured"
            else:
                error = await self._async_validate(
                    new_username, user_input[CONF_PASSWORD]
                )
                if error:
                    errors["base"] = error
                else:
                    # Migrer AVANT d'écrire le nouveau login. L'entrée porte
                    # encore l'ancien, donc la correspondance exacte fonctionne.
                    # Sans ça, une entrée désactivée — jamais configurée, donc
                    # jamais migrée — reconfigurée avec un nouveau login verrait
                    # la migration ultérieure ne correspondre à rien, et cinq
                    # entités neuves remplacer les siennes. Idempotent : au
                    # prochain démarrage, la migration redevient un no-op.
                    await async_migrate_unique_ids(self.hass, entry)
                    # unique_id suit l'identifiant : sans ça, une entrée
                    # ultérieure portant le nouveau login ne serait pas détectée
                    # comme doublon. Les identifiants uniques des entités, eux,
                    # dérivent de l'entry_id et ne bougent pas.
                    return self.async_update_reload_and_abort(
                        entry,
                        unique_id=new_username,
                        title=f"Médiathèque ({new_username})",
                        data_updates=user_input,
                    )

        current_username = entry.data.get(CONF_USERNAME, "")
        return self.async_show_form(
            step_id="reconfigure",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_USERNAME, default=current_username): str,
                    vol.Required(CONF_PASSWORD): str,
                }
            ),
            errors=errors,
        )

    def _username_taken_by_another_entry(
        self, entry: ConfigEntry, username: str
    ) -> bool:
        """Une autre entrée utilise-t-elle déjà cet identifiant ?

        _abort_if_unique_id_configured ne convient pas : il refuserait aussi
        l'entrée qu'on est en train de reconfigurer.
        """
        return any(
            other.entry_id != entry.entry_id and other.unique_id == username
            for other in self._async_current_entries()
        )

    async def async_step_reauth(
        self, entry_data: Mapping[str, Any]
    ) -> FlowResult:
        """Déclenché par ConfigEntryAuthFailed depuis le coordinator."""
        return await self.async_step_reauth_confirm()

    async def async_step_reauth_confirm(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Redemande le mot de passe, l'identifiant étant celui de l'entrée."""
        entry = self._get_reauth_entry()
        username = entry.data[CONF_USERNAME]
        errors: dict[str, str] = {}

        if user_input is not None:
            error = await self._async_validate(username, user_input[CONF_PASSWORD])
            if error:
                errors["base"] = error
            else:
                return self.async_update_reload_and_abort(
                    entry, data_updates=user_input
                )

        return self.async_show_form(
            step_id="reauth_confirm",
            data_schema=vol.Schema({vol.Required(CONF_PASSWORD): str}),
            description_placeholders={"username": username},
            errors=errors,
        )

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow:
        """Get the options flow."""
        return MediathequeVeaucheOptionsFlow(config_entry)


class MediathequeVeaucheOptionsFlow(OptionsFlow):
    """Handle options for Médiathèque de Veauche."""

    def __init__(self, config_entry: ConfigEntry) -> None:
        self._config_entry = config_entry

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Manage the options."""
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        current_interval = self._config_entry.options.get(
            CONF_SCAN_INTERVAL,
            self._config_entry.data.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL),
        )

        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(
                {
                    vol.Optional(
                        CONF_SCAN_INTERVAL, default=current_interval
                    ): vol.All(int, vol.Range(min=5, max=1440)),
                }
            ),
        )
