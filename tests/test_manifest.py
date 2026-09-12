"""Gardes sur ce que hassfest ne valide pas.

hassfest (job « hassfest » de validate.yml) valide réellement le manifeste :
existence des dépendances, absence de cycle, ordre des clés, vocabulaire de
integration_type, et la règle « composant importé mais non déclaré ». Dupliquer
ça ici avec des assertions écrites à la main ne donnerait que des tautologies
relisant le fichier qu'on vient d'écrire.

Restent deux choses que hassfest ignore et qui ne se voient autrement qu'à
l'installation ou après publication : le plancher de version annoncé à HACS, et
la cohérence des numéros de version entre les fichiers que le workflow de
release met à jour par substitution.
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


class TestHacsMinimumVersion:
    """hacs.json ne bloque que l'installation via HACS, rien d'autre.

    C'est un cliquet, pas une preuve : il empêche d'abaisser le plancher par
    inadvertance, mais il ne peut pas détecter qu'une API nouvellement utilisée
    exige plus récent. C'est arrivé avec getGridOptions, qui n'existe qu'à
    partir du frontend 20241106.0 (Home Assistant 2024.11) et qui était passé
    inaperçu.

    Le plancher n'est plus dérivé des seules API utilisées : c'est désormais
    une politique de support, décidée en septembre 2026 — seule la série 2026
    est prise en charge. Techniquement, la plus récente des API employées
    (`OptionsFlow.config_entry`) n'exige que 2024.12.
    """

    def test_is_parsable(self):
        assert re.match(r"^\d+\.\d+", HACS["homeassistant"]), (
            f"version illisible : {HACS['homeassistant']!r}"
        )

    def test_the_readme_announces_the_same_floor(self):
        """Le README est le seul endroit qu'un utilisateur lit avant
        d'installer. Il annonçait encore 2024.11 après un relèvement du
        plancher, et rien ne croisait les deux fichiers."""
        readme = (ROOT / "README.md").read_text("utf-8")
        major, minor = HACS["homeassistant"].split(".")[:2]
        assert f"**{major}.{minor}**" in readme, (
            f"README.md n'annonce pas le plancher {major}.{minor} de hacs.json"
        )

    def test_covers_the_apis_in_use(self):
        major, minor = (
            int(p) for p in re.match(r"^(\d+)\.(\d+)", HACS["homeassistant"]).groups()
        )
        assert (major, minor) >= (2026, 1), (
            f"plancher annoncé {HACS['homeassistant']} : trop bas. "
            "Politique de support : série 2026 uniquement. Les API employées "
            "exigent au minimum 2024.12 (OptionsFlow.config_entry), "
            "2024.11 (getGridOptions) et 2024.7 (async_register_static_paths)."
        )


class TestVersionsAreSynchronised:
    """Le workflow de release propage la version par substitution.

    Un sed qui ne matche plus échoue silencieusement et publie un paquet dont
    les versions divergent. Le cas le plus coûteux est CARD_VERSION, qui sert de
    cache-buster à la ressource Lovelace : désynchronisé, il fait resservir un
    module périmé derrière une URL fraîche.
    """

    def test_card_version_matches_manifest(self):
        from custom_components.mediatheque_veauche import CARD_VERSION

        assert MANIFEST["version"] == CARD_VERSION

    def test_frontend_constant_matches_manifest(self):
        source = (ROOT / "frontend/src/version.ts").read_text("utf-8")
        match = re.search(r"export const MEDIATHEQUE_CARD_VERSION = '([^']+)';", source)
        assert match, "constante de version introuvable dans version.ts"
        assert match.group(1) == MANIFEST["version"]

    def test_package_json_matches_manifest(self):
        package = json.loads((ROOT / "frontend/package.json").read_text("utf-8"))
        assert package["version"] == MANIFEST["version"]

    def test_package_lock_matches_manifest(self):
        """npm version l'écrit à deux endroits, et il est commité par la release."""
        lock = json.loads((ROOT / "frontend/package-lock.json").read_text("utf-8"))
        assert lock["version"] == MANIFEST["version"]
        assert lock["packages"][""]["version"] == MANIFEST["version"]

    def test_committed_bundle_embeds_manifest_version(self):
        """Le bundle est reconstruit puis commité par la release.

        Si le rebuild saute ou passe avant la substitution, la bannière du
        bundle annonce l'ancienne version tandis que l'URL porte la nouvelle :
        un module périmé servi derrière un cache-buster frais, exactement le
        symptôme que CARD_VERSION existe pour éviter.
        """
        bundle = (
            ROOT / "custom_components/mediatheque_veauche/www/mediatheque-card.js"
        ).read_text("utf-8")
        assert f'"{MANIFEST["version"]}"' in bundle
