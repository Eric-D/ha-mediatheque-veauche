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

_MOCK_ROOTS = ("homeassistant", "voluptuous")


class _MockLoader(importlib.abc.Loader):
    """Fabrique un module factice qui accepte n'importe quel attribut."""

    def create_module(self, spec):
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
