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

    def test_error_detection_is_not_broken(self):
        """Garde sur la garde.

        Les clés d'erreur sont repérées par analyse de la source. Si le code
        cesse de les écrire en littéraux — passage par une constante ou un
        dictionnaire —, l'ensemble deviendrait vide et toutes les assertions
        d'inclusion resteraient vertes en ne testant plus rien.
        """
        assert DECLARED_ERRORS, (
            "aucune clé d'erreur détectée dans config_flow.py : les expressions "
            "régulières ne correspondent plus au code"
        )

    def test_step_detection_is_not_broken(self):
        assert CONFIG_STEPS, "aucune étape de configuration détectée"
        assert OPTIONS_STEPS, "aucune étape d'options détectée"

    def test_every_error_key_is_translated(self):
        declared = set(STRINGS["config"]["error"])
        missing = DECLARED_ERRORS - declared
        assert not missing, f"erreurs sans traduction : {sorted(missing)}"

    def test_reauth_abort_reason_is_translated(self):
        """async_update_reload_and_abort déduit « reauth_successful » de la
        source du flux.

        Sur Home Assistant récent cette raison est résolue dans le domaine
        « homeassistant », et notre traduction est alors ignorée au profit de la
        chaîne générique. Elle reste nécessaire pour les versions qui la
        résolvent dans le domaine de l'intégration, où son absence afficherait
        la clé brute.
        """
        assert "reauth_successful" in STRINGS["config"]["abort"]

    def test_reauth_description_uses_its_placeholder(self):
        """La description reçoit description_placeholders={"username": …}."""
        description = STRINGS["config"]["step"]["reauth_confirm"]["description"]
        assert "{username}" in description


class TestReloadIsScheduledOnce:
    """Un seul endroit doit programmer le rechargement.

    Home Assistant déprécie async_update_reload_and_abort pour une intégration
    qui enregistre un listener de mise à jour — le listener est censé s'en
    charger — avec une casse annoncée en 2026.12. config_flow.py n'étant pas
    importable sous les mocks, on lit la source.
    """

    def test_no_deprecated_update_reload_and_abort(self):
        """Un appel, pas une mention : la docstring du remplaçant le nomme."""
        calls = re.findall(r"self\.async_update_reload_and_abort\(", SOURCE)
        assert not calls, (
            "async_update_reload_and_abort programme un rechargement alors "
            "qu'un listener est enregistré : déprécié, casse en 2026.12"
        )

    def test_no_direct_entry_update(self):
        """Le flux passe par update_entry_and_ensure_reload, jamais en direct.

        Le comportement lui-même est couvert par
        tests/test_init.py::TestUpdateEntryAndEnsureReload ; ici on vérifie
        seulement qu'aucun appel ne le contourne, ce qu'un test de
        comportement sur le helper ne verrait pas.
        """
        direct = re.findall(r"config_entries\.async_update_entry\(", SOURCE)
        assert not direct, (
            "async_update_entry appelé directement : le rechargement n'est "
            "plus garanti quand l'entrée ne change pas ou n'est pas chargée"
        )

    def test_abort_reasons_are_translated(self):
        """strings.json ne suffit pas : il n'est jamais lu à l'exécution.

        Pour une intégration personnalisée, Home Assistant ne lit que
        translations/<langue>.json. Une raison d'abandon présente dans le seul
        strings.json s'afficherait en clé brute à l'utilisateur.
        """
        reasons = set(re.findall(r'async_abort\(reason="([a-z_]+)"', SOURCE))
        assert reasons, "aucune raison d'abandon détectée"
        assert TRANSLATIONS, "aucun fichier de traduction"
        for language, content in {"strings": STRINGS, **TRANSLATIONS}.items():
            missing = reasons - set(content["config"]["abort"])
            assert not missing, (
                f"{language} : raisons d'abandon sans traduction : {sorted(missing)}"
            )


class TestTranslationFilesMatch:
    def test_fallback_language_is_present(self):
        """en est la langue de repli : son absence se voit chez les autres.

        Le reste de ce fichier boucle sur les fichiers trouvés — en supprimer
        un laisse donc tout au vert, y compris celui que lisent les
        utilisateurs non francophones.
        """
        missing = {"en", "fr"} - set(TRANSLATIONS)
        assert not missing, f"fichiers de traduction manquants : {sorted(missing)}"

    def test_same_keys_as_strings(self):
        reference = _flat(STRINGS)
        for language, content in TRANSLATIONS.items():
            assert _flat(content) == reference, (
                f"translations/{language}.json diverge de strings.json"
            )
