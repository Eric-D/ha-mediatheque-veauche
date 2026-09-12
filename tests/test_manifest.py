"""Garde sur les métadonnées de paquet.

Elles ne sont exercées qu'à l'installation chez l'utilisateur : une valeur
fausse passe toute la CI et ne se voit qu'au moment où l'intégration refuse de
démarrer. C'est ce qui est arrivé à la version minimale de Home Assistant,
annoncée à 2023.1.0 alors que le code utilise des API de 2024.7.
"""
from __future__ import annotations

import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
MANIFEST = json.loads(
    (ROOT / "custom_components/mediatheque_veauche/manifest.json").read_text("utf-8")
)
HACS = json.loads((ROOT / "hacs.json").read_text("utf-8"))

# Valeurs admises par hassfest (script/hassfest/manifest.py).
INTEGRATION_TYPES = {
    "device", "entity", "hardware", "helper", "hub", "service", "system",
}


class TestManifest:
    def test_required_keys(self):
        for key in (
            "domain", "name", "codeowners", "config_flow", "documentation",
            "iot_class", "issue_tracker", "requirements", "version",
        ):
            assert key in MANIFEST, f"clé « {key} » absente du manifeste"

    def test_integration_type_is_valid(self):
        assert MANIFEST.get("integration_type") in INTEGRATION_TYPES

    def test_declares_the_components_it_uses(self):
        """hass.http et frontend sont utilisés dès async_setup.

        Sans déclaration, rien ne garantit qu'ils soient configurés à ce
        moment-là : l'intégration dépendrait d'un ordre de démarrage non
        contractuel.
        """
        assert set(MANIFEST.get("dependencies", [])) >= {"http", "frontend"}

    def test_lovelace_is_only_an_after_dependency(self):
        """La collection de ressources est sondée défensivement et son absence
        est gérée : en faire une dépendance dure ferait échouer le setup sur une
        installation sans dashboards."""
        assert "lovelace" in MANIFEST.get("after_dependencies", [])
        assert "lovelace" not in MANIFEST.get("dependencies", [])

    def test_version_looks_like_a_release(self):
        assert re.fullmatch(r"\d+\.\d+\.\d+", MANIFEST["version"])


class TestHacsManifest:
    def test_minimum_home_assistant_version(self):
        """Doit couvrir async_register_static_paths / StaticPathConfig, absents
        de 2024.6.0 et présents en 2024.7.0."""
        major, minor, *_ = (int(p) for p in HACS["homeassistant"].split("."))
        assert (major, minor) >= (2024, 7), (
            f"version minimale annoncée {HACS['homeassistant']} : trop basse pour "
            "les API utilisées"
        )


class TestVersionsAreSynchronised:
    """Le workflow de release propage la version par sed dans quatre fichiers.

    Un sed qui ne matche plus échoue silencieusement et publie un paquet dont
    les versions divergent — notamment CARD_VERSION, qui sert de cache-buster
    pour la ressource Lovelace.
    """

    def test_card_version_matches_manifest(self):
        from custom_components.mediatheque_veauche import CARD_VERSION

        assert CARD_VERSION == MANIFEST["version"]

    def test_frontend_constant_matches_manifest(self):
        source = (ROOT / "frontend/src/version.ts").read_text("utf-8")
        match = re.search(
            r"export const MEDIATHEQUE_CARD_VERSION = '([^']+)';", source
        )
        assert match, "constante de version introuvable dans version.ts"
        assert match.group(1) == MANIFEST["version"]

    def test_package_json_matches_manifest(self):
        package = json.loads((ROOT / "frontend/package.json").read_text("utf-8"))
        assert package["version"] == MANIFEST["version"]
