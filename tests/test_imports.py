"""Garde sur la couche d'import simulée.

Le conftest fabrique un module pour n'importe quel `homeassistant.*`. C'est ce
qui rend la suite exécutable sans installer Home Assistant, mais ça fait aussi
réussir un import erroné — faute de frappe, ou helper retiré de la version
ciblée. Ce test rend visible tout changement de la surface d'import.

Il ne remplace pas une validation réelle : seul le job « import-check » de la
CI, qui installe Home Assistant, peut dire qu'un module existe vraiment.
"""
from __future__ import annotations

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


def test_no_unexpected_mocked_imports(mocked_ha_modules):
    unexpected = mocked_ha_modules - EXPECTED
    assert not unexpected, (
        "Nouveaux modules Home Assistant importés : "
        f"{sorted(unexpected)}. Vérifiez qu'ils existent réellement dans la "
        "version ciblée, puis ajoutez-les à EXPECTED."
    )


def test_expected_surface_is_actually_used(mocked_ha_modules):
    """Un import retiré du code doit sortir de la liste, pas y traîner."""
    stale = {m for m in EXPECTED if m not in mocked_ha_modules}
    assert not stale, f"Modules listés mais plus importés : {sorted(stale)}"
