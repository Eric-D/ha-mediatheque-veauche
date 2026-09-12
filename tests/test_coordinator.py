"""Ce que voit l'utilisateur quand le portail est indisponible.

Ces chemins vivaient dans une closure de `sensor.async_setup_entry`, donc hors
de portée des tests : `sensor.py` n'est pas importable sous les mocks (conflit
de métaclasse entre `CoordinatorEntity` et `SensorEntity`). Supprimer le repli
sur cache, le marquage `fetch_ok` ou l'un des recalculs de délais laissait la
suite entièrement verte.
"""
from __future__ import annotations

import asyncio
from datetime import UTC, date, datetime

import pytest
from homeassistant.exceptions import ConfigEntryAuthFailed
from homeassistant.helpers.update_coordinator import UpdateFailed

import custom_components.mediatheque_veauche.coordinator as coordinator_module
from custom_components.mediatheque_veauche.coordinator import (
    MediathequeDataSource,
    async_load_cache,
    is_valid_payload,
)
from custom_components.mediatheque_veauche.scraper import InvalidCredentialsError

TODAY = date(2024, 3, 10)
NOW = datetime(2024, 3, 10, 8, 0, tzinfo=UTC)


def _run(coro):
    # asyncio.run ferme la boucle : new_event_loop() en fuirait une, donc un
    # descripteur epoll, à chaque test.
    return asyncio.run(coro)


@pytest.fixture(autouse=True)
def _frozen_clock(monkeypatch):
    """dt_util est un MagicMock sous les mocks : sa date n'est pas une date."""

    class _Clock:
        @staticmethod
        def now():
            # Naïve comme celle de HA quand aucun fuseau n'est configuré : seul
            # son .date() est lu, et c'est le fuseau de HA qui l'a produite.
            return datetime(2024, 3, 10, 9, 0)  # noqa: DTZ001

        @staticmethod
        def utcnow():
            return NOW

    monkeypatch.setattr(coordinator_module, "dt_util", _Clock)


class _Hass:
    async def async_add_executor_job(self, func, *args):
        return func(*args)


class _Store:
    """Store disque : on veut savoir ce qui y est écrit, pas seulement que ça l'est."""

    def __init__(self):
        self.saved: list[dict] = []

    async def async_save(self, data):
        self.saved.append(data)


class _Client:
    def __init__(self, payload=None, error=None):
        self._payload = payload
        self._error = error
        self.calls = 0

    def fetch_all(self):
        self.calls += 1
        if self._error:
            raise self._error
        return self._payload


def _payload(*due_dates):
    """Sortie du scraper : des due_date, jamais de days_left."""
    return {
        "compte": "DUPONT",
        "total": len(due_dates),
        "membres": {"Jean": [{"titre": f"L{i}", "due_date": d}
                             for i, d in enumerate(due_dates)]},
    }


def _source(client, cached=None, last_success=None):
    return MediathequeDataSource(
        _Hass(), client, _Store(), cached if cached is not None else {},
        {"last_success": last_success},
    )


class TestSuccessfulFetch:
    def test_serves_computed_days_left(self):
        source = _source(_Client(_payload("2024-03-15")))

        data = _run(source.async_update())

        assert data["membres"]["Jean"][0]["days_left"] == 5
        assert data["fetch_ok"] is True
        assert data["last_success"] == NOW.isoformat()

    def test_counters_are_served(self):
        source = _source(_Client(_payload("2024-03-07", "2024-03-15")))

        data = _run(source.async_update())

        assert data["overdue"] == 1
        assert data["due_this_week"] == 1

    def test_disk_cache_keeps_the_raw_payload(self):
        """Y écrire les délais les figerait à la date du scrape — le défaut
        même que le recalcul au service a corrigé."""
        source = _source(_Client(_payload("2024-03-15")))

        _run(source.async_update())

        written = source.store.saved[-1]["data"]
        assert "days_left" not in written["membres"]["Jean"][0]
        assert "due_this_week" not in written
        assert source.store.saved[-1]["last_success"] == NOW.isoformat()

    def test_freshness_markers_stay_out_of_the_cache(self):
        source = _source(_Client(_payload("2024-03-15")))

        _run(source.async_update())

        assert "fetch_ok" not in source.store.saved[-1]["data"]


class TestInvalidCredentials:
    def test_raises_config_entry_auth_failed(self):
        """C'est ce qui déclenche la notification « Reconfigurer » de HA."""
        source = _source(
            _Client(error=InvalidCredentialsError("refusé")),
            cached={"data": _payload("2024-03-15")},
        )

        with pytest.raises(ConfigEntryAuthFailed):
            _run(source.async_update())

    def test_does_not_fall_back_on_the_cache(self):
        """Servir des données périmées masquerait le vrai problème."""
        source = _source(
            _Client(error=InvalidCredentialsError("refusé")),
            cached={"data": _payload("2024-03-15")},
        )

        with pytest.raises(ConfigEntryAuthFailed):
            _run(source.async_update())
        assert source.store.saved == []


class TestFallbackOnCache:
    def test_serves_the_cache_marked_as_stale(self):
        source = _source(
            _Client(error=RuntimeError("portail indisponible")),
            cached={"data": _payload("2024-03-15")},
            last_success="2024-03-09T08:00:00+00:00",
        )

        data = _run(source.async_update())

        assert data["fetch_ok"] is False
        assert data["last_error_at"] == NOW.isoformat()
        # Inchangé : c'est la date du dernier succès, pas de cette tentative.
        assert data["last_success"] == "2024-03-09T08:00:00+00:00"

    def test_days_left_is_recomputed_not_frozen(self):
        """Le cache a été écrit un autre jour : les délais doivent avoir vieilli."""
        source = _source(
            _Client(error=RuntimeError("portail indisponible")),
            cached={"data": _payload("2024-03-15")},
        )

        data = _run(source.async_update())

        assert data["membres"]["Jean"][0]["days_left"] == 5
        assert data["due_this_week"] == 1

    def test_in_memory_data_wins_over_the_disk_cache(self):
        """coordinator.data porte les prolongations marquées depuis le fetch.

        Repartir de cached["data"] les perdrait : le livre prolongé
        réafficherait son bouton et sa date d'avant.
        """
        source = _source(
            _Client(error=RuntimeError("portail indisponible")),
            cached={"data": _payload("2024-03-15")},
        )
        extended = _payload("2024-03-29")
        extended["membres"]["Jean"][0]["extended"] = True
        source.coordinator = type("C", (), {"data": extended})()

        data = _run(source.async_update())

        loan = data["membres"]["Jean"][0]
        assert loan["extended"] is True
        assert loan["days_left"] == 19

    def test_falls_back_to_disk_when_nothing_is_in_memory(self):
        source = _source(
            _Client(error=RuntimeError("portail indisponible")),
            cached={"data": _payload("2024-03-15")},
        )
        source.coordinator = type("C", (), {"data": None})()

        data = _run(source.async_update())

        assert data["membres"]["Jean"][0]["days_left"] == 5

    def test_no_cache_means_update_failed(self):
        """Sans repli, le coordinator doit signaler l'échec, pas servir du vide."""
        source = _source(_Client(error=RuntimeError("portail indisponible")))

        with pytest.raises(UpdateFailed):
            _run(source.async_update())

    def test_empty_cache_is_not_a_fallback(self):
        source = _source(
            _Client(error=RuntimeError("boom")), cached={"data": None}
        )

        with pytest.raises(UpdateFailed):
            _run(source.async_update())


class TestIsValidPayload:
    def test_accepts_the_current_format(self):
        """Sans days_left : c'est la forme écrite depuis la 3.7."""
        assert is_valid_payload(_payload("2024-03-15"))

    def test_accepts_a_legacy_payload_with_days_left(self):
        data = _payload("2024-03-15")
        data["membres"]["Jean"][0]["days_left"] = 5
        assert is_valid_payload(data)

    def test_rejects_a_days_left_that_is_not_a_number(self):
        data = _payload("2024-03-15")
        data["membres"]["Jean"][0]["days_left"] = "5"
        assert not is_valid_payload(data)

    def test_rejects_a_bool(self):
        """bool est un int : sans la garde, True passerait pour un délai."""
        data = _payload("2024-03-15")
        data["membres"]["Jean"][0]["days_left"] = True
        assert not is_valid_payload(data)

    @pytest.mark.parametrize(
        "data",
        ["une chaîne", None, {}, {"membres": []}, {"membres": {"Jean": "pas une liste"}},
         {"membres": {"Jean": ["pas un dict"]}}],
    )
    def test_rejects_malformed_containers(self, data):
        assert not is_valid_payload(data)

    def test_subscription_must_be_a_dict_or_absent(self):
        data = _payload("2024-03-15")
        data["subscription"] = "bientôt"
        assert not is_valid_payload(data)


class _LoadableStore:
    def __init__(self, content):
        self._content = content
        self.removed = False

    async def async_load(self):
        return self._content

    async def async_remove(self):
        self.removed = True


class TestLoadCache:
    def test_returns_a_valid_cache_as_is(self):
        cache = {"data": _payload("2024-03-15"), "last_success": "hier"}

        result = _run(async_load_cache(_Hass(), _LoadableStore(cache), "jean"))

        assert result == cache

    def test_drops_a_payload_of_unexpected_format(self):
        """Un cache écrit par une version antérieure ferait lever les capteurs
        à chaque écriture d'état : mieux vaut repartir à vide."""
        cache = {"data": {"membres": {"Jean": ["pas un dict"]}}, "last_success": "hier"}

        result = _run(async_load_cache(_Hass(), _LoadableStore(cache), "jean"))

        assert "data" not in result
        assert "last_success" not in result

    def test_drops_a_corrupt_container(self):
        result = _run(async_load_cache(_Hass(), _LoadableStore("pas un dict"), "jean"))
        assert result == {}

    def test_falls_back_on_the_legacy_cache(self, monkeypatch):
        """Le cache était indexé sur le login avant d'être indexé sur l'entry_id."""
        legacy = {"data": _payload("2024-03-15"), "last_success": "hier"}

        async def _legacy(hass, username):
            assert username == "jean"
            return legacy

        monkeypatch.setattr(coordinator_module, "async_take_over_legacy_cache", _legacy)

        result = _run(async_load_cache(_Hass(), _LoadableStore(None), "jean"))

        assert result == legacy
