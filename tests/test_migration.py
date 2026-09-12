"""Migration des identifiants uniques d'entités.

Ces identifiants dérivaient du login. En changer — carte renouvelée, nouveau
numéro — créait cinq entités neuves et orphelinait les anciennes : carte du
tableau de bord cassée, historique perdu, automatisations muettes. La migration
est donc ce qui rend le changement d'identifiant utilisable, et elle ne
s'exécute qu'une fois chez chaque utilisateur : s'y tromper est sans retour.
"""
from __future__ import annotations

import pathlib
import re

import pytest

from custom_components.mediatheque_veauche.const import DOMAIN
from custom_components.mediatheque_veauche.migration import (
    ENTITY_SUFFIXES,
    build_unique_id,
    migrated_unique_id,
)

ENTRY_ID = "01JABCDEF0123456789"
OLD_USERNAME = "123456"


class TestMigratedUniqueId:
    @pytest.mark.parametrize("suffix", ENTITY_SUFFIXES)
    def test_every_historical_suffix_is_migrated(self, suffix):
        old = f"{DOMAIN}_{OLD_USERNAME}_{suffix}"
        assert migrated_unique_id(ENTRY_ID, old) == build_unique_id(ENTRY_ID, suffix)

    def test_last_update_is_not_confused_with_a_shorter_suffix(self):
        """Les suffixes sont essayés du plus long au plus court."""
        old = f"{DOMAIN}_{OLD_USERNAME}_last_update"
        assert migrated_unique_id(ENTRY_ID, old).endswith("_last_update")

    def test_already_migrated_is_left_alone(self):
        """Idempotence : la migration est rejouée à chaque démarrage."""
        already = build_unique_id(ENTRY_ID, "total")
        assert migrated_unique_id(ENTRY_ID, already) is None

    def test_migration_is_stable_when_replayed(self):
        old = f"{DOMAIN}_{OLD_USERNAME}_total"
        once = migrated_unique_id(ENTRY_ID, old)
        assert migrated_unique_id(ENTRY_ID, once) is None

    def test_foreign_unique_id_is_ignored(self):
        """Une entité d'une autre intégration ne doit jamais être touchée."""
        assert migrated_unique_id(ENTRY_ID, "autre_integration_123_total") is None

    def test_unknown_suffix_is_ignored(self):
        assert migrated_unique_id(ENTRY_ID, f"{DOMAIN}_{OLD_USERNAME}_inconnu") is None

    def test_username_containing_a_suffix(self):
        """Un identifiant qui contient lui-même un suffixe reste migré une fois."""
        old = f"{DOMAIN}_total42_overdue"
        assert migrated_unique_id(ENTRY_ID, old) == build_unique_id(ENTRY_ID, "overdue")

    def test_entry_id_prefix_wins_over_suffix_match(self):
        """Une entité déjà migrée se termine aussi par un suffixe connu."""
        assert migrated_unique_id(ENTRY_ID, f"{ENTRY_ID}_overdue") is None


class TestSuffixesMatchTheSensors:
    """sensor.py n'est pas importable sous les mocks : on lit la source.

    Un suffixe utilisé par un capteur mais absent d'ENTITY_SUFFIXES ne serait
    jamais migré, et l'entité correspondante serait silencieusement remplacée
    par une neuve au premier changement d'identifiant.
    """

    def test_no_sensor_suffix_is_missing(self):
        source = (
            pathlib.Path(__file__).resolve().parent.parent
            / "custom_components/mediatheque_veauche/sensor.py"
        ).read_text("utf-8")
        used = set(re.findall(r'build_unique_id\(entry\.entry_id, "([^"]+)"\)', source))
        assert used, "aucun appel à build_unique_id détecté : la regex ne matche plus"
        assert used <= set(ENTITY_SUFFIXES), (
            f"suffixes non migrables : {sorted(used - set(ENTITY_SUFFIXES))}"
        )
