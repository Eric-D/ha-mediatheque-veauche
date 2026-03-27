"""Sensor platform for Médiathèque de Veauche."""
from __future__ import annotations

from datetime import date, datetime, timedelta
import logging

from homeassistant.components.sensor import SensorEntity, SensorDeviceClass
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.storage import Store
from homeassistant.helpers.update_coordinator import (
    CoordinatorEntity,
    DataUpdateCoordinator,
    UpdateFailed,
)
from homeassistant.util import dt as dt_util

from .const import (
    CONF_SCAN_INTERVAL,
    CONF_USERNAME,
    DEFAULT_SCAN_INTERVAL,
    DOMAIN,
)

_LOGGER = logging.getLogger(__name__)

STORAGE_VERSION = 1


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up sensor from a config entry."""
    username = entry.data[CONF_USERNAME]
    scan_interval = entry.options.get(
        CONF_SCAN_INTERVAL,
        entry.data.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL),
    )

    client = hass.data[DOMAIN][entry.entry_id]["client"]

    store = Store(hass, STORAGE_VERSION, f"{DOMAIN}_{username}_cache")
    cached = await store.async_load() or {}
    state = {"last_success": cached.get("last_success")}

    async def async_update_data() -> dict:
        """Fetch data from the library."""
        try:
            data = await hass.async_add_executor_job(client.fetch_all)
            state["last_success"] = dt_util.utcnow().isoformat()
            cached["data"] = data
            cached["last_success"] = state["last_success"]
            await store.async_save(cached)
            _LOGGER.info(
                "Données récupérées: %d emprunts, %d à rendre cette semaine, %d en retard",
                data.get("total", 0),
                data.get("due_this_week", 0),
                data.get("overdue", 0),
            )
            return data
        except Exception as err:
            _LOGGER.warning("Échec de la mise à jour des données: %s", err)
            if cached.get("data"):
                _LOGGER.info(
                    "Utilisation des données en cache (dernier fetch: %s)",
                    state["last_success"],
                )
                return cached["data"]
            raise UpdateFailed(f"Error fetching library data: {err}") from err

    coordinator = DataUpdateCoordinator(
        hass,
        _LOGGER,
        name=f"{DOMAIN}_{username}",
        update_method=async_update_data,
        update_interval=timedelta(minutes=scan_interval),
    )

    # Store coordinator reference for service access
    hass.data[DOMAIN][entry.entry_id]["coordinator"] = coordinator

    # Pre-fill coordinator with cached data so sensors have values immediately
    if cached.get("data"):
        coordinator.async_set_updated_data(cached["data"])

    async_add_entities([
        MediathequeEmpruntsTotal(coordinator, entry),
        MediathequeEmpruntsSemaine(coordinator, entry),
        MediathequeEmpruntsRetard(coordinator, entry),
        MediathequeFinCotisation(coordinator, entry),
        MediathequeDerniereMaj(coordinator, entry, state),
    ])

    # Fire and forget — don't block platform setup
    entry.async_create_background_task(
        hass, coordinator.async_request_refresh(), "mediatheque_first_refresh"
    )


class MediathequeEmpruntsTotal(CoordinatorEntity, SensorEntity):
    """Total borrowings."""

    _attr_icon = "mdi:book-open-variant"
    _attr_native_unit_of_measurement = "emprunts"

    def __init__(self, coordinator: DataUpdateCoordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator)
        self._username = entry.data[CONF_USERNAME]
        self._attr_unique_id = f"{DOMAIN}_{self._username}_total"
        self._attr_name = "Emprunts Médiathèque"

    @property
    def native_value(self) -> int | None:
        if self.coordinator.data:
            return self.coordinator.data.get("total", 0)
        return None

    @property
    def extra_state_attributes(self) -> dict:
        if not self.coordinator.data:
            return {}
        return {
            "card_id": self._username,
            "compte": self.coordinator.data.get("compte", ""),
            "membres": self.coordinator.data.get("membres", {}),
            "total": self.coordinator.data.get("total", 0),
        }


class MediathequeEmpruntsSemaine(CoordinatorEntity, SensorEntity):
    """Books due within the next 7 days."""

    _attr_icon = "mdi:calendar-clock"
    _attr_native_unit_of_measurement = "emprunts"

    def __init__(self, coordinator: DataUpdateCoordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{DOMAIN}_{entry.data[CONF_USERNAME]}_due_week"
        self._attr_name = "Emprunts à rendre cette semaine"

    @property
    def native_value(self) -> int | None:
        if self.coordinator.data:
            return self.coordinator.data.get("due_this_week", 0)
        return None

    @property
    def extra_state_attributes(self) -> dict:
        if not self.coordinator.data:
            return {}
        all_loans = [
            loan
            for loans in self.coordinator.data.get("membres", {}).values()
            for loan in loans
        ]
        due_loans = [l for l in all_loans if 0 <= l["days_left"] <= 7]
        due_loans.sort(key=lambda l: l["days_left"])
        return {"livres": due_loans}


class MediathequeEmpruntsRetard(CoordinatorEntity, SensorEntity):
    """Overdue books."""

    _attr_icon = "mdi:alert-circle"
    _attr_native_unit_of_measurement = "emprunts"

    def __init__(self, coordinator: DataUpdateCoordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{DOMAIN}_{entry.data[CONF_USERNAME]}_overdue"
        self._attr_name = "Emprunts en retard"

    @property
    def native_value(self) -> int | None:
        if self.coordinator.data:
            return self.coordinator.data.get("overdue", 0)
        return None

    @property
    def extra_state_attributes(self) -> dict:
        if not self.coordinator.data:
            return {}
        all_loans = [
            loan
            for loans in self.coordinator.data.get("membres", {}).values()
            for loan in loans
        ]
        overdue_loans = [l for l in all_loans if l["days_left"] < 0]
        overdue_loans.sort(key=lambda l: l["days_left"])
        return {"livres": overdue_loans}


class MediathequeFinCotisation(CoordinatorEntity, SensorEntity):
    """Library subscription expiration date."""

    _attr_icon = "mdi:card-account-details-outline"
    _attr_device_class = SensorDeviceClass.DATE

    def __init__(self, coordinator: DataUpdateCoordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{DOMAIN}_{entry.data[CONF_USERNAME]}_subscription"
        self._attr_name = "Fin cotisation Médiathèque"

    @property
    def native_value(self) -> date | None:
        if self.coordinator.data:
            sub = self.coordinator.data.get("subscription", {})
            iso_date = sub.get("expiry_date")
            if iso_date:
                try:
                    return datetime.strptime(iso_date, "%Y-%m-%d").date()
                except ValueError:
                    pass
        return None

    @property
    def extra_state_attributes(self) -> dict:
        if not self.coordinator.data:
            return {}
        sub = self.coordinator.data.get("subscription", {})
        return {
            "expiry_date_display": sub.get("expiry_date_display"),
            "days_left": sub.get("days_left"),
            "subscriptions": sub.get("subscriptions", []),
        }


class MediathequeDerniereMaj(CoordinatorEntity, SensorEntity):
    """Last successful data fetch timestamp."""

    _attr_icon = "mdi:clock-check-outline"
    _attr_device_class = SensorDeviceClass.TIMESTAMP

    def __init__(self, coordinator: DataUpdateCoordinator, entry: ConfigEntry, state: dict) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{DOMAIN}_{entry.data[CONF_USERNAME]}_last_update"
        self._attr_name = "Dernière MAJ Médiathèque"
        self._state = state

    @property
    def native_value(self) -> datetime | None:
        ts = self._state.get("last_success")
        if ts:
            try:
                return datetime.fromisoformat(ts)
            except (ValueError, TypeError):
                pass
        return None
