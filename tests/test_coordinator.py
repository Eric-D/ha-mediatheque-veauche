"""Ce que voit l'utilisateur quand le portail est indisponible.

Ces chemins vivaient dans une closure de `sensor.async_setup_entry`, donc hors
de portée des tests : `sensor.py` n'est pas importable sous les mocks (conflit
de métaclasse entre `CoordinatorEntity` et `SensorEntity`). Supprimer le repli
sur cache, le marquage `fetch_ok` ou l'un des recalculs de délais laissait la
suite entièrement verte.
"""
from __future__ import annotations

import asyncio
import json
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

    def __init__(self, content=None):
        self.saved: list[dict] = []
        self._content = content
        self.removed = False

    async def async_load(self):
        return self._content

    async def async_save(self, data):
        # Aller-retour JSON, pour deux raisons. Le vrai Store sérialise, donc
        # ce qui n'est pas sérialisable lève en production et doit lever ici.
        # Et il écrit tout de suite : garder la référence vive laissait passer
        # une inversion de l'ordre des écritures, qui aurait persisté à chaque
        # cycle le payload du cycle précédent — un cache en retard permanent,
        # vide au premier démarrage.
        self.saved.append(json.loads(json.dumps(data)))

    async def async_remove(self):
        self.removed = True


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


class _ReadStatus:
    """Le pan de ReadStatus qu'utilise la source : les clés, relues à chaque
    service. Attribut et non valeur figée, pour qu'un test puisse marquer un
    livre entre deux cycles."""

    def __init__(self, keys=()):
        self.keys = set(keys)


def _source(client, cached=None, last_success=None, read_keys=()):
    return MediathequeDataSource(
        _Hass(), client, _Store(), cached if cached is not None else {},
        {"last_success": last_success}, _ReadStatus(read_keys),
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


class TestLoadCache:
    def test_returns_a_valid_cache_as_is(self):
        cache = {"data": _payload("2024-03-15"), "last_success": "hier"}

        result = _run(async_load_cache(_Hass(), _Store(cache), "jean"))

        assert result == cache

    def test_drops_a_payload_of_unexpected_format(self):
        """Un cache écrit par une version antérieure ferait lever les capteurs
        à chaque écriture d'état : mieux vaut repartir à vide."""
        cache = {"data": {"membres": {"Jean": ["pas un dict"]}}, "last_success": "hier"}

        result = _run(async_load_cache(_Hass(), _Store(cache), "jean"))

        assert "data" not in result
        assert "last_success" not in result

    def test_drops_a_corrupt_container(self):
        result = _run(async_load_cache(_Hass(), _Store("pas un dict"), "jean"))
        assert result == {}

    def test_write_order_is_observable(self):
        """Garde-fou du double lui-même : sans copie, ce test ne peut pas
        échouer, et une inversion des écritures passerait inaperçue."""
        source = _source(_Client(_payload("2024-03-15")))

        _run(source.async_update())

        assert source.store.saved[-1]["data"]["total"] == 1

    def test_falls_back_on_the_legacy_cache(self, monkeypatch):
        """Le cache était indexé sur le login avant d'être indexé sur l'entry_id."""
        legacy = {"data": _payload("2024-03-15"), "last_success": "hier"}

        async def _legacy(hass, username):
            assert username == "jean"
            return legacy

        monkeypatch.setattr(coordinator_module, "async_take_over_legacy_cache", _legacy)

        result = _run(async_load_cache(_Hass(), _Store(None), "jean"))

        assert result == legacy


class TestLegacyCacheTakeover:
    """Le cache était indexé sur le login avant de l'être sur l'entry_id.

    Ces tests manquaient : monkeypatcher la reprise dans les tests
    d'async_load_cache ne dit rien de la reprise elle-même. La remplacer par
    « return {} » laissait les 27 tests au vert.
    """

    @staticmethod
    def _patch_store(monkeypatch, store):
        seen = {}

        def _factory(hass, version, key):
            seen["key"] = key
            return store

        monkeypatch.setattr(coordinator_module, "Store", _factory)
        return seen

    def test_reads_the_login_indexed_file(self, monkeypatch):
        """Une faute de frappe sur ce nom rendrait la reprise silencieusement
        inopérante : l'utilisateur repartirait d'un cache vide."""
        store = _Store({"data": _payload("2024-03-15")})
        seen = self._patch_store(monkeypatch, store)

        result = _run(coordinator_module.async_take_over_legacy_cache(_Hass(), "jean"))

        assert seen["key"] == "mediatheque_veauche_jean_cache"
        assert result["data"]["total"] == 1

    def test_removes_the_legacy_file(self, monkeypatch):
        """Sans suppression, la reprise se rejouerait à chaque démarrage et
        écraserait le cache courant par un cache figé."""
        store = _Store({"data": _payload("2024-03-15")})
        self._patch_store(monkeypatch, store)

        _run(coordinator_module.async_take_over_legacy_cache(_Hass(), "jean"))

        assert store.removed is True

    def test_absent_legacy_file_is_not_removed(self, monkeypatch):
        store = _Store(None)
        self._patch_store(monkeypatch, store)

        result = _run(coordinator_module.async_take_over_legacy_cache(_Hass(), "jean"))

        assert result == {}
        assert store.removed is False

    def test_a_failing_store_is_not_fatal(self, monkeypatch):
        """Se tromper ici ne doit coûter qu'un cycle, jamais l'intégration."""

        class _Broken(_Store):
            async def async_load(self):
                raise OSError("disque illisible")

        self._patch_store(monkeypatch, _Broken())

        assert _run(coordinator_module.async_take_over_legacy_cache(_Hass(), "x")) == {}


class TestReadFlags:
    """Les drapeaux « lu » doivent suivre les mêmes chemins que days_left.

    Les trois chemins qui servent des données — fetch réussi, repli sur cache,
    pré-remplissage au démarrage — doivent appliquer les mêmes dérivations. Les
    deux premiers sont testables ici ; le troisième vit dans `sensor.py`, non
    importable sous les mocks, et n'est couvert que par `with_derived` étant le
    seul appel possible.
    """

    def test_a_successful_fetch_carries_the_flags(self):
        source = _source(_Client(_payload("2024-03-15")), read_keys={"titre:l0"})

        data = _run(source.async_update())

        assert data["membres"]["Jean"][0]["read"] is True
        assert data["membres"]["Jean"][0]["read_key"] == "titre:l0"

    def test_an_unmarked_book_is_served_as_unread(self):
        source = _source(_Client(_payload("2024-03-15")))

        data = _run(source.async_update())

        assert data["membres"]["Jean"][0]["read"] is False

    def test_the_disk_cache_keeps_no_read_flag(self):
        """Y figer `read` le rendrait faux dès le marquage suivant, et une
        journée d'indisponibilité du portail resservirait l'état de lecture de
        la veille sans le dire. Même raison que days_left."""
        store = _Store()
        source = MediathequeDataSource(
            _Hass(), _Client(_payload("2024-03-15")), store, {},
            {"last_success": None}, _ReadStatus({"titre:l0"}),
        )

        _run(source.async_update())

        written = store.saved[-1]["data"]["membres"]["Jean"][0]
        assert "read" not in written
        assert "read_key" not in written

    def test_the_cache_fallback_carries_the_flags(self):
        """Seul chemin où les données peuvent traverser un marquage sans
        nouveau scrape : le badge doit quand même apparaître."""
        cached = {"data": _payload("2024-03-15"), "last_success": "hier"}
        source = _source(_Client(error=RuntimeError("portail HS")), cached=cached,
                         read_keys={"titre:l0"})

        data = _run(source.async_update())

        assert data["fetch_ok"] is False
        assert data["membres"]["Jean"][0]["read"] is True

    def test_a_key_marked_between_two_cycles_is_picked_up(self):
        """La source relit `keys` à chaque service plutôt que de les capturer à
        la construction : sinon marquer un livre n'aurait d'effet qu'au
        redémarrage suivant."""
        status = _ReadStatus()
        source = MediathequeDataSource(
            _Hass(), _Client(_payload("2024-03-15")), _Store(), {},
            {"last_success": None}, status,
        )

        assert _run(source.async_update())["membres"]["Jean"][0]["read"] is False
        status.keys.add("titre:l0")
        assert _run(source.async_update())["membres"]["Jean"][0]["read"] is True
