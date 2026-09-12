"""Cohérence entre le flux de configuration et ses traductions.

Une étape ou une clé d'erreur sans traduction ne casse rien : Home Assistant
affiche la clé brute à l'utilisateur. Ça ne se voit donc qu'en parcourant
réellement le flux, et jamais en CI — sauf par ce test, qui croise deux
fichiers indépendants plutôt que d'en relire un.

config_flow.py n'est pas importable sous les mocks du conftest (il dérive de
ConfigFlow et OptionsFlow, qu'un MagicMock ne peut pas servir de base), d'où
l'analyse de la source.
"""
from __future__ import annotations

import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
COMPONENT = ROOT / "custom_components/mediatheque_veauche"
SOURCE = (COMPONENT / "config_flow.py").read_text("utf-8")
STRINGS = json.loads((COMPONENT / "strings.json").read_text("utf-8"))
TRANSLATIONS = {
    p.stem: json.loads(p.read_text("utf-8"))
    for p in (COMPONENT / "translations").glob("*.json")
}

# Les deux flux ont leurs traductions dans des sections distinctes :
# config.step pour le flux de configuration, options.step pour celui des
# options. Les confondre rendrait le test faux dans les deux sens.
_OPTIONS_CLASS = "class MediathequeVeaucheOptionsFlow"
_CONFIG_SOURCE, _, _OPTIONS_SOURCE = SOURCE.partition(_OPTIONS_CLASS)

CONFIG_STEPS = set(re.findall(r'step_id="([^"]+)"', _CONFIG_SOURCE))
OPTIONS_STEPS = set(re.findall(r'step_id="([^"]+)"', _OPTIONS_SOURCE))
DECLARED_ERRORS = set(re.findall(r'errors\["base"\] = "([^"]+)"', SOURCE)) | set(
    re.findall(r'return "([a-z_]+)"', SOURCE)
)


def _flat(d: dict, prefix: str = "") -> set[str]:
    out = set()
    for key, value in d.items():
        out.add(prefix + key)
        if isinstance(value, dict):
            out |= _flat(value, prefix + key + ".")
    return out


class TestConfigFlowStrings:
    def test_every_config_step_is_translated(self):
        missing = CONFIG_STEPS - set(STRINGS["config"]["step"])
        assert not missing, f"étapes sans traduction : {sorted(missing)}"

    def test_every_options_step_is_translated(self):
        missing = OPTIONS_STEPS - set(STRINGS["options"]["step"])
        assert not missing, f"étapes d'options sans traduction : {sorted(missing)}"

    def test_no_orphan_step_translation(self):
        orphans = set(STRINGS["config"]["step"]) - CONFIG_STEPS
        assert not orphans, f"traductions d'étapes inexistantes : {sorted(orphans)}"

    def test_every_error_key_is_translated(self):
        declared = set(STRINGS["config"]["error"])
        missing = {e for e in DECLARED_ERRORS if e in {"invalid_auth", "cannot_connect"}}
        assert missing <= declared, f"erreurs sans traduction : {sorted(missing - declared)}"

    def test_reauth_abort_reason_is_translated(self):
        """async_update_reload_and_abort déduit « reauth_successful » de la source
        du flux : sans traduction, l'utilisateur voit la clé brute."""
        assert "reauth_successful" in STRINGS["config"]["abort"]

    def test_reauth_description_uses_its_placeholder(self):
        """La description reçoit description_placeholders={"username": …}."""
        description = STRINGS["config"]["step"]["reauth_confirm"]["description"]
        assert "{username}" in description


class TestTranslationFilesMatch:
    def test_same_keys_as_strings(self):
        reference = _flat(STRINGS)
        for language, content in TRANSLATIONS.items():
            assert _flat(content) == reference, (
                f"translations/{language}.json diverge de strings.json"
            )
