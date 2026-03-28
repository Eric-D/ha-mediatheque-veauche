"""Fixtures et mocks pour les tests de l'intégration Médiathèque de Veauche."""
from __future__ import annotations

import sys
from unittest.mock import MagicMock

# Mock tous les modules homeassistant et voluptuous avant l'import des modules
# de l'intégration, afin de pouvoir tester sans installer Home Assistant.
_HA_MODULES = [
    "homeassistant",
    "homeassistant.components",
    "homeassistant.components.frontend",
    "homeassistant.components.http",
    "homeassistant.components.sensor",
    "homeassistant.config_entries",
    "homeassistant.const",
    "homeassistant.core",
    "homeassistant.data_entry_flow",
    "homeassistant.helpers",
    "homeassistant.helpers.config_validation",
    "homeassistant.helpers.entity_platform",
    "homeassistant.helpers.storage",
    "homeassistant.helpers.update_coordinator",
    "homeassistant.util",
    "homeassistant.util.dt",
    "voluptuous",
]

for mod in _HA_MODULES:
    sys.modules.setdefault(mod, MagicMock())
