"""Sensor platform for Médiathèque de Veauche."""
from __future__ import annotations

import logging
from datetime import date, datetime, timedelta

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryAuthFailed
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.storage import Store
from homeassistant.helpers.update_coordinator import (
    CoordinatorEntity,
    DataUpdateCoordinator,
    UpdateFailed,
)
from homeassistant.util import dt as dt_util

from .const import (
    BASE_URL,
    CONF_SCAN_INTERVAL,
    CONF_USERNAME,
    DEFAULT_SCAN_INTERVAL,
    DOMAIN,
)
from .migration import build_unique_id
from .scraper import InvalidCredentialsError

_LOGGER = logging.getLogger(__name__)

STORAGE_VERSION = 1


async def _async_take_over_legacy_cache(hass: HomeAssistant, username: str) -> dict:
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


def _is_number(value: object) -> bool:
    """Nombre exploitable pour une comparaison (None accepté, bool refusé)."""
    return value is None or (isinstance(value, (int, float)) and not isinstance(value, bool))


def _is_valid_payload(data: object) -> bool:
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
            # days_left est comparé numériquement à chaque écriture d'état :
            # une chaîne passerait le test « is not None » et lèverait un
            # TypeError à chaque cycle.
            if not _is_number(loan.get("days_left")):
                return False
    subscription = data.get("subscription")
    return subscription is None or isinstance(subscription, dict)


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

    # Indexé sur l'entry_id et non sur le login : sinon changer de login
    # repartait d'un cache vide, donc capteurs « unknown » jusqu'au premier
    # fetch réussi — et « unavailable » si celui-ci échouait.
    store = Store(hass, STORAGE_VERSION, f"{DOMAIN}_{entry.entry_id}_cache")
    cached = await store.async_load() or {}
    if not cached:
        cached = await _async_take_over_legacy_cache(hass, username)
    if not isinstance(cached, dict):
        _LOGGER.warning("Cache disque corrompu (conteneur %s), ignoré", type(cached).__name__)
        cached = {}
    if cached.get("data") is not None and not _is_valid_payload(cached["data"]):
        _LOGGER.warning(
            "Cache disque au format inattendu (écrit par une version antérieure ?), ignoré"
        )
        cached.pop("data", None)
        cached.pop("last_success", None)
    state = {"last_success": cached.get("last_success")}

    async def async_update_data() -> dict:
        """Fetch data from the library."""
        try:
            data = await hass.async_add_executor_job(client.fetch_all)
            state["last_success"] = dt_util.utcnow().isoformat()
            # Le cache disque reçoit la sortie brute du scraper : y écrire les
            # marqueurs de fraîcheur les figerait pour la prochaine relecture.
            cached["data"] = data
            cached["last_success"] = state["last_success"]
            await store.async_save(cached)
            _LOGGER.info(
                "Données récupérées: %d emprunts, %d à rendre cette semaine, %d en retard",
                data.get("total", 0),
                data.get("due_this_week", 0),
                data.get("overdue", 0),
            )
            return {**data, "last_success": state["last_success"], "fetch_ok": True}
        except InvalidCredentialsError as err:
            # Pas de repli sur le cache : réessayer ne servira à rien, et
            # continuer à servir des données périmées masquerait le vrai
            # problème. ConfigEntryAuthFailed déclenche la notification
            # « Reconfigurer » de Home Assistant.
            _LOGGER.warning("Identifiants refusés par la médiathèque: %s", err)
            raise ConfigEntryAuthFailed(str(err)) from err
        except Exception as err:
            _LOGGER.warning("Échec de la mise à jour des données: %s", err)
            if cached.get("data"):
                _LOGGER.info(
                    "Utilisation des données en cache (dernier fetch: %s)",
                    state["last_success"],
                )
                # Copie marquée : sans horodatage d'échec, le payload serait
                # identique au cycle précédent, HA dédoublonnerait l'écriture
                # d'état et la carte n'aurait aucun moyen de savoir que les
                # données affichées sont périmées.
                # coordinator.data plutôt que cached["data"] : il porte les
                # prolongations marquées en mémoire depuis le dernier fetch.
                base = coordinator.data if coordinator.data else cached["data"]
                return {
                    **base,
                    "last_success": state["last_success"],
                    "fetch_ok": False,
                    "last_error_at": dt_util.utcnow().isoformat(),
                }
            raise UpdateFailed(f"Error fetching library data: {err}") from err

    coordinator = DataUpdateCoordinator(
        hass,
        _LOGGER,
        # Explicite plutôt que déduit du ContextVar : sans entrée de
        # configuration, le coordinator n'appelle pas async_start_reauth et le
        # flux de ré-authentification ne démarrerait jamais, en silence.
        config_entry=entry,
        name=f"{DOMAIN}_{username}",
        update_method=async_update_data,
        update_interval=timedelta(minutes=scan_interval),
    )

    # Store coordinator reference for service access
    hass.data[DOMAIN][entry.entry_id]["coordinator"] = coordinator

    # Pre-fill coordinator with cached data so sensors have values immediately
    if cached.get("data"):
        # Pas de fetch_ok=False ici : aucun fetch n'a encore échoué. Le poser
        # ferait apparaître le bandeau « synchronisation en échec » à chaque
        # démarrage de HA dont le cache a plus de deux heures, pendant tout le
        # temps du premier refresh.
        coordinator.async_set_updated_data({
            **cached["data"],
            "last_success": state["last_success"],
        })

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


def _device_info(entry: ConfigEntry) -> DeviceInfo:
    """Appareil unique regroupant les cinq capteurs du compte.

    Identifié par l'entry_id et non par le login, pour la même raison que les
    identifiants uniques d'entités : changer de login ne doit pas créer un
    second appareil et orpheliner le premier.

    Sans has_entity_name : l'activer recomposerait les noms affichés à partir du
    nom de l'appareil, ce qui changerait ce que voit l'utilisateur sur un
    tableau de bord existant. Le regroupement s'obtient sans ça.
    """
    return DeviceInfo(
        identifiers={(DOMAIN, entry.entry_id)},
        name=f"Médiathèque ({entry.data[CONF_USERNAME]})",
        manufacturer="Médiathèque de Veauche",
        configuration_url=BASE_URL,
        entry_type=DeviceEntryType.SERVICE,
    )


class _MediathequeBase(CoordinatorEntity, SensorEntity):
    """Base commune : expose la fraîcheur des données à la carte."""

    _username: str

    def _freshness(self) -> dict:
        """Fraîcheur des données, exposée sur tous les sensors d'emprunts.

        Sans ça, la carte ne peut pas distinguer des données fraîches de
        données de cache vieilles de plusieurs jours (le coordinator considère
        un repli sur le cache comme un succès, donc les entités restent
        disponibles).
        """
        data = self.coordinator.data or {}
        return {
            "last_success": data.get("last_success"),
            "fetch_ok": data.get("fetch_ok", True),
            # card_id sur tous les sensors d'emprunts : la carte en a besoin pour
            # le code-barres, y compris quand elle pointe un sensor filtré.
            "card_id": self._username,
            # Indispensable : sans horodatage qui bouge, deux échecs consécutifs
            # produisent des attributs identiques, HA dédoublonne l'écriture
            # d'état, la carte ne re-render pas et son bandeau de péremption
            # n'apparaît jamais une fois le seuil franchi.
            "last_error_at": data.get("last_error_at"),
        }

    @staticmethod
    def _all_loans(data: dict) -> list[dict]:
        return [
            loan
            for loans in (data.get("membres") or {}).values()
            for loan in loans
            if isinstance(loan, dict)
        ]


class MediathequeEmpruntsTotal(_MediathequeBase):
    """Total borrowings."""

    _attr_icon = "mdi:book-open-variant"
    _attr_native_unit_of_measurement = "emprunts"

    def __init__(self, coordinator: DataUpdateCoordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator)
        self._attr_device_info = _device_info(entry)
        self._username = entry.data[CONF_USERNAME]
        self._attr_unique_id = build_unique_id(entry.entry_id, "total")
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
            "compte": self.coordinator.data.get("compte", ""),
            "membres": self.coordinator.data.get("membres", {}),
            "total": self.coordinator.data.get("total", 0),
            **self._freshness(),
        }


class MediathequeEmpruntsSemaine(_MediathequeBase):
    """Books due within the next 7 days."""

    _attr_icon = "mdi:calendar-clock"
    _attr_native_unit_of_measurement = "emprunts"

    def __init__(self, coordinator: DataUpdateCoordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator)
        self._attr_device_info = _device_info(entry)
        self._username = entry.data[CONF_USERNAME]
        self._attr_unique_id = build_unique_id(entry.entry_id, "due_week")
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
        all_loans = self._all_loans(self.coordinator.data)
        due_loans = [
            loan
            for loan in all_loans
            if loan.get("days_left") is not None and 0 <= loan["days_left"] <= 7
        ]
        due_loans.sort(key=lambda loan: loan["days_left"])
        return {"livres": due_loans, **self._freshness()}


class MediathequeEmpruntsRetard(_MediathequeBase):
    """Overdue books."""

    _attr_icon = "mdi:alert-circle"
    _attr_native_unit_of_measurement = "emprunts"

    def __init__(self, coordinator: DataUpdateCoordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator)
        self._attr_device_info = _device_info(entry)
        self._username = entry.data[CONF_USERNAME]
        self._attr_unique_id = build_unique_id(entry.entry_id, "overdue")
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
        all_loans = self._all_loans(self.coordinator.data)
        overdue_loans = [
            loan
            for loan in all_loans
            if loan.get("days_left") is not None and loan["days_left"] < 0
        ]
        overdue_loans.sort(key=lambda loan: loan["days_left"])
        return {"livres": overdue_loans, **self._freshness()}


class MediathequeFinCotisation(CoordinatorEntity, SensorEntity):
    """Library subscription expiration date."""

    _attr_icon = "mdi:card-account-details-outline"
    _attr_device_class = SensorDeviceClass.DATE

    def __init__(self, coordinator: DataUpdateCoordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator)
        self._attr_device_info = _device_info(entry)
        self._attr_unique_id = build_unique_id(entry.entry_id, "subscription")
        self._attr_name = "Fin cotisation Médiathèque"

    @property
    def native_value(self) -> date | None:
        if self.coordinator.data:
            sub = self.coordinator.data.get("subscription") or {}
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
        sub = self.coordinator.data.get("subscription") or {}
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
        self._attr_device_info = _device_info(entry)
        self._attr_unique_id = build_unique_id(entry.entry_id, "last_update")
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
