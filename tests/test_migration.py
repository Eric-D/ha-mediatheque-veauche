"""Migration des identifiants uniques d'entités.

Opération irréversible qui ne s'exécute qu'une fois chez chaque utilisateur :
s'y tromper perd son historique. Les tests couvrent donc la fonction pure ET le
câblage, le projet ayant déjà appris ailleurs que la première sans le second
laisse passer les régressions qui comptent.
"""
from __future__ import annotations

import pathlib
import re

import pytest

from custom_components.mediatheque_veauche import migration
from custom_components.mediatheque_veauche.const import DOMAIN
from custom_components.mediatheque_veauche.migration import (
    ENTITY_SUFFIXES,
    async_migrate_unique_ids,
    build_unique_id,
    migrated_unique_id,
)

ENTRY_ID = "01JABCDEF0123456789"
USERNAME = "123456"
OLD_USERNAME = "999999"

# Les cinq formats qui ont réellement existé, figés en dur. ENTITY_SUFFIXES ne
# doit jamais rétrécir : un utilisateur pas encore migré a encore des entités
# sous ces noms, et en retirer un les condamnerait.
HISTORICAL_SUFFIXES = {"total", "due_week", "overdue", "subscription", "last_update"}


class TestMigratedUniqueId:
    @pytest.mark.parametrize("suffix", sorted(HISTORICAL_SUFFIXES))
    def test_current_login_is_migrated(self, suffix):
        old = f"{DOMAIN}_{USERNAME}_{suffix}"
        assert migrated_unique_id(ENTRY_ID, USERNAME, old) == build_unique_id(
            ENTRY_ID, suffix
        )

    def test_entities_of_a_previous_login_are_left_alone(self):
        """Le cœur du contrat.

        Un utilisateur ayant déjà changé de login a deux jeux d'entités dans la
        même entrée. Migrer celles de l'ancien login leur ferait capter le
        nouvel identifiant — elles sont enregistrées en premier — au détriment
        de celles qui portent l'historique et l'entity_id du tableau de bord.
        """
        orphan = f"{DOMAIN}_{OLD_USERNAME}_total"
        assert migrated_unique_id(ENTRY_ID, USERNAME, orphan) is None

    def test_already_migrated_is_left_alone(self):
        already = build_unique_id(ENTRY_ID, "total")
        assert migrated_unique_id(ENTRY_ID, USERNAME, already) is None

    def test_migration_is_stable_when_replayed(self):
        old = f"{DOMAIN}_{USERNAME}_total"
        once = migrated_unique_id(ENTRY_ID, USERNAME, old)
        assert migrated_unique_id(ENTRY_ID, USERNAME, once) is None

    def test_foreign_unique_id_is_ignored(self):
        assert migrated_unique_id(ENTRY_ID, USERNAME, "autre_integration_x_total") is None

    def test_unknown_suffix_is_ignored(self):
        assert migrated_unique_id(ENTRY_ID, USERNAME, f"{DOMAIN}_{USERNAME}_x") is None

    def test_partial_match_is_not_enough(self):
        """La correspondance est exacte, pas un endswith."""
        assert migrated_unique_id(ENTRY_ID, USERNAME, f"prefixe_{DOMAIN}_{USERNAME}_total") is None

    def test_suffix_list_never_shrinks(self):
        assert set(ENTITY_SUFFIXES) >= HISTORICAL_SUFFIXES


class _RegistryEntry:
    def __init__(self, unique_id, entity_id, domain="sensor"):
        self.unique_id = unique_id
        self.entity_id = entity_id
        self.domain = domain
        self.platform = DOMAIN


class _FakeRegistry:
    """Reproduit le comportement réel de Home Assistant, refus de doublon compris."""

    def __init__(self, entries):
        self.entries = list(entries)

    def async_get_entity_id(self, domain, platform, unique_id):
        for entry in self.entries:
            if entry.domain == domain and entry.unique_id == unique_id:
                return entry.entity_id
        return None

    def apply(self, callback):
        """Équivalent d'async_migrate_entries, ValueError amont incluse."""
        for entry in list(self.entries):
            updates = callback(entry)
            if updates is None:
                continue
            new_unique_id = updates["new_unique_id"]
            conflict = self.async_get_entity_id(entry.domain, DOMAIN, new_unique_id)
            if conflict:
                raise ValueError(
                    f"Unique id '{new_unique_id}' is already in use by '{conflict}'"
                )
            entry.unique_id = new_unique_id


class _Entry:
    def __init__(self, entry_id, username):
        self.entry_id = entry_id
        self.data = {"username": username}


class TestMigrationWiring:
    @staticmethod
    def _run(hass, entry, registry, monkeypatch):
        monkeypatch.setattr(migration.er, "async_get", lambda _hass: registry)

        async def _migrate_entries(_hass, _entry_id, callback):
            registry.apply(callback)

        monkeypatch.setattr(migration.er, "async_migrate_entries", _migrate_entries)

        import asyncio

        asyncio.run(async_migrate_unique_ids(hass, entry))

    def test_migrates_the_current_login(self, monkeypatch):
        registry = _FakeRegistry(
            [_RegistryEntry(f"{DOMAIN}_{USERNAME}_total", "sensor.emprunts_mediatheque")]
        )
        self._run(None, _Entry(ENTRY_ID, USERNAME), registry, monkeypatch)
        assert registry.entries[0].unique_id == build_unique_id(ENTRY_ID, "total")

    def test_orphan_of_a_previous_login_does_not_steal_the_identifier(self, monkeypatch):
        """Le scénario qui coûte l'historique.

        L'orpheline est enregistrée en premier. Une correspondance par suffixe
        la migrerait d'abord, lui ferait capter le nouvel identifiant, puis
        lèverait une ValueError sur la vivante — laissant la plateforme morte.
        """
        orphan = _RegistryEntry(
            f"{DOMAIN}_{OLD_USERNAME}_total", "sensor.emprunts_mediatheque"
        )
        live = _RegistryEntry(
            f"{DOMAIN}_{USERNAME}_total", "sensor.emprunts_mediatheque_2"
        )
        registry = _FakeRegistry([orphan, live])

        self._run(None, _Entry(ENTRY_ID, USERNAME), registry, monkeypatch)

        assert orphan.unique_id == f"{DOMAIN}_{OLD_USERNAME}_total"
        assert live.unique_id == build_unique_id(ENTRY_ID, "total")

    def test_collision_is_survivable(self, monkeypatch):
        """Une migration qui échoue doit laisser ses capteurs à l'utilisateur.

        Home Assistant lève si l'identifiant est déjà pris, et
        async_migrate_entries n'attrape rien : sans garde, la plateforme sensor
        mourrait à chaque démarrage.
        """
        squatter = _RegistryEntry(build_unique_id(ENTRY_ID, "total"), "sensor.squatteur")
        live = _RegistryEntry(f"{DOMAIN}_{USERNAME}_total", "sensor.emprunts_mediatheque")
        registry = _FakeRegistry([squatter, live])

        self._run(None, _Entry(ENTRY_ID, USERNAME), registry, monkeypatch)

        assert live.unique_id == f"{DOMAIN}_{USERNAME}_total"

    def test_empty_registry(self, monkeypatch):
        registry = _FakeRegistry([])
        self._run(None, _Entry(ENTRY_ID, USERNAME), registry, monkeypatch)
        assert registry.entries == []


class TestReconfigureMigratesFirst:
    """config_flow.py n'est pas importable sous les mocks : on lit la source.

    Une entrée désactivée n'a jamais été configurée, donc jamais migrée. La
    reconfigurer avec un nouveau login ferait ensuite échouer la correspondance
    exacte — les entités portent l'ancien — et cinq entités neuves
    remplaceraient les siennes, silencieusement et définitivement. La migration
    doit donc avoir lieu pendant que l'entrée porte encore l'ancien login.
    """

    SOURCE = (
        pathlib.Path(__file__).resolve().parent.parent
        / "custom_components/mediatheque_veauche/config_flow.py"
    ).read_text("utf-8")

    def test_migration_is_called_in_reconfigure(self):
        assert "await async_migrate_unique_ids(self.hass, entry)" in self.SOURCE

    def test_migration_precedes_the_login_change(self):
        migration = self.SOURCE.index("await async_migrate_unique_ids(self.hass, entry)")
        update = self.SOURCE.index("unique_id=new_username")
        assert migration < update, (
            "la migration doit précéder l'écriture du nouveau login, sinon la "
            "correspondance exacte ne trouve plus rien"
        )


class TestEverySensorJoinsTheDevice:
    """sensor.py n'est pas importable sous les mocks : on lit la source.

    Un capteur qui oublierait device_info resterait orphelin, hors de l'appareil
    qui regroupe le compte, et rien en CI ne virerait au rouge — import-check
    prouve que le module se charge, pas que chaque entité est rattachée.
    """

    def test_all_five_sensors_declare_device_info(self):
        source = (
            pathlib.Path(__file__).resolve().parent.parent
            / "custom_components/mediatheque_veauche/sensor.py"
        ).read_text("utf-8")
        assignments = source.count("self._attr_device_info = _device_info(entry)")
        unique_ids = len(
            re.findall(r'build_unique_id\(entry\.entry_id, "[^"]+"\)', source)
        )
        assert assignments == unique_ids, (
            f"{assignments} capteurs rattachés à l'appareil pour {unique_ids} "
            "entités : un capteur a été ajouté sans device_info"
        )


class TestSuffixesMatchTheSensors:
    """sensor.py n'est pas importable sous les mocks : on lit la source."""

    def test_every_sensor_suffix_is_migrable(self):
        source = (
            pathlib.Path(__file__).resolve().parent.parent
            / "custom_components/mediatheque_veauche/sensor.py"
        ).read_text("utf-8")
        used = re.findall(r'build_unique_id\(entry\.entry_id, "([^"]+)"\)', source)
        assert len(used) == 5, (
            f"{len(used)} appels littéraux à build_unique_id au lieu de 5 : "
            "un capteur a été ajouté, retiré, ou son suffixe passé par une "
            "constante que cette analyse ne voit pas"
        )
        assert set(used) <= set(ENTITY_SUFFIXES)
