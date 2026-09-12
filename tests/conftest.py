"""Fixtures et mocks pour les tests de l'intégration Médiathèque de Veauche.

Les tests doivent pouvoir tourner sans installer Home Assistant, qui est une
dépendance lourde et dont on ne teste rien ici : seules la logique de scraping
et les fonctions pures de l'intégration sont sous test.

On installe donc un chercheur de modules qui fabrique un MagicMock pour tout
import de `homeassistant.*` ou `voluptuous`. Une liste figée de modules à
mocker avait déjà cassé une fois : l'ajout d'un import
(`homeassistant.helpers.start`) rendait tout `test_init.py` non chargeable.

Le chercheur n'est installé que si le vrai paquet est absent, pour qu'un
environnement où Home Assistant est réellement installé continue de l'utiliser.
"""
from __future__ import annotations

import importlib.abc
import importlib.util
import sys
from unittest.mock import MagicMock

import pytest

_MOCK_ROOTS = ("homeassistant", "voluptuous")

# Tout module fabriqué est enregistré ici. Le finder fait réussir n'importe
# quel import sous ces racines, y compris une faute de frappe ou un helper
# retiré : sans trace, la CI resterait verte pendant que l'intégration ne se
# charge plus chez l'utilisateur. test_imports.py compare cet ensemble à une
# liste attendue, ce qui rend un nouvel import visible sans bloquer la suite.
MOCKED_MODULES: set[str] = set()


class _MockLoader(importlib.abc.Loader):
    """Fabrique un module factice qui accepte n'importe quel attribut."""

    def create_module(self, spec):
        MOCKED_MODULES.add(spec.name)
        module = MagicMock(name=spec.name)
        module.__name__ = spec.name
        module.__spec__ = spec
        module.__loader__ = self
        # __path__ fait du mock un paquet : sans lui, importer un sous-module
        # lève « X is not a package ».
        module.__path__ = []
        return module

    def exec_module(self, module):
        """Rien à exécuter : le module est déjà complet."""


class _MockFinder(importlib.abc.MetaPathFinder):
    def __init__(self, root: str) -> None:
        self._root = root

    def find_spec(self, fullname, path=None, target=None):
        if fullname == self._root or fullname.startswith(f"{self._root}."):
            return importlib.util.spec_from_loader(
                fullname, _MockLoader(), is_package=True
            )
        return None


for _root in _MOCK_ROOTS:
    try:
        __import__(_root)
    except ImportError:
        sys.meta_path.insert(0, _MockFinder(_root))


def pytest_configure() -> None:
    """Force le chargement des modules réellement importables sous mocks.

    Sans ça, l'ensemble MOCKED_MODULES dépendrait de l'ordre de collecte.
    sensor.py et config_flow.py sont absents volontairement : ils dérivent de
    classes Home Assistant, qu'un MagicMock ne peut pas servir de base. Leur
    chargement est vérifié par le job « import-check » de la CI, avec un vrai
    Home Assistant installé.
    """
    import custom_components.mediatheque_veauche  # noqa: F401
    import custom_components.mediatheque_veauche.scraper  # noqa: F401


@pytest.fixture
def mocked_ha_modules() -> set[str]:
    """Modules Home Assistant effectivement fabriqués par le finder."""
    return MOCKED_MODULES
