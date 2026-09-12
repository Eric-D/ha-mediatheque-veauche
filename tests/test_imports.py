"""Garde sur la couche d'import simulée.

Le conftest fabrique un module pour n'importe quel `homeassistant.*`. C'est ce
qui rend la suite exécutable sans installer Home Assistant, mais ça fait aussi
réussir un import erroné — faute de frappe, ou helper retiré de la version
ciblée. Ce test rend visible tout changement de la surface d'import.

Il ne remplace pas une validation réelle : seul le job « import-check » de la
CI, qui installe Home Assistant, peut dire qu'un module existe vraiment.
"""
from __future__ import annotations

import pytest

# Import au niveau module, et non dans un pytest_configure : une erreur
# d'import réelle doit rester une erreur de collecte lisible, pas un
# INTERNALERROR de pytest sans aucun test exécuté. C'est aussi ce qui rend
# l'ensemble des modules simulés indépendant de l'ordre de collecte, ce
# fichier étant collecté avant test_init et test_scraper.
#
# sensor.py et config_flow.py sont absents volontairement : ils dérivent de
# classes Home Assistant, qu'un MagicMock ne peut pas servir de base. Leur
# chargement est vérifié par le job « import-check » de la CI.
import custom_components.mediatheque_veauche  # noqa: F401,E402
import custom_components.mediatheque_veauche.scraper  # noqa: F401,E402

# Surface d'import attendue de l'intégration. À mettre à jour sciemment quand
# un import est ajouté — et à vérifier contre la documentation de Home
# Assistant, pas seulement contre ce que le mock accepte.
EXPECTED = {
    "homeassistant",
    "homeassistant.components",
    "homeassistant.components.frontend",
    "homeassistant.components.http",
    "homeassistant.config_entries",
    "homeassistant.const",
    "homeassistant.core",
    "homeassistant.helpers",
    "homeassistant.helpers.config_validation",
    "homeassistant.helpers.start",
    "voluptuous",
}


def test_no_unexpected_mocked_imports(mocked_ha_modules, mocked_roots):
    if not mocked_roots:
        pytest.skip("paquets réels installés : rien n'est simulé")
    unexpected = mocked_ha_modules - EXPECTED
    assert not unexpected, (
        "Nouveaux modules Home Assistant importés : "
        f"{sorted(unexpected)}. Vérifiez qu'ils existent réellement dans la "
        "version ciblée, puis ajoutez-les à EXPECTED."
    )


def test_expected_surface_is_actually_used(mocked_ha_modules, mocked_roots):
    """Un import retiré du code doit sortir de la liste, pas y traîner.

    Restreint aux racines réellement simulées : avec voluptuous installé mais
    pas Home Assistant — cas banal — seule la partie simulée est vérifiable.
    """
    if not mocked_roots:
        pytest.skip("paquets réels installés : rien n'est simulé")
    expected = {m for m in EXPECTED if m.split(".")[0] in mocked_roots}
    stale = {m for m in expected if m not in mocked_ha_modules}
    assert not stale, f"Modules listés mais plus importés : {sorted(stale)}"
