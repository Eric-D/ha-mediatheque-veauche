"""Cohérence entre les commandes documentées et celles de la CI.

Un contributeur qui suit CLAUDE.md doit obtenir le même verdict que la CI. Le
périmètre de `ruff` a déjà divergé une fois — élargi dans le workflow, laissé
étroit dans la documentation — et ça ne se découvre qu'en poussant.

Même intention que `test_manifest.py` pour les versions : empêcher une source de
vérité et sa copie de dériver en silence.

Les assertions portent sur le **bloc copiable** de la section « Exécuter les
tests », pas sur le fichier entier. Chercher dans tout le fichier rendait la
garde vacue : la prose de la section « Linters » mentionne les mêmes commandes,
donc supprimer une ligne du bloc laissait le test vert — de la fausse
assurance, plus coûteuse qu'une absence de garde.
"""
from __future__ import annotations

import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
WORKFLOW = (ROOT / ".github/workflows/validate.yml").read_text("utf-8")
CLAUDE = (ROOT / "CLAUDE.md").read_text("utf-8")


def _command_block() -> str:
    """Le bloc de commandes de la section « Exécuter les tests »."""
    section = CLAUDE.split("## Exécuter les tests", 1)
    assert len(section) == 2, "section « Exécuter les tests » introuvable"
    blocks = re.findall(r"```\n(.*?)```", section[1], re.DOTALL)
    assert blocks, "aucun bloc de commandes dans la section"
    return blocks[0]


BLOCK = _command_block()


class TestDocumentedCommands:
    def test_ruff_scope_matches_ci(self):
        ci = re.findall(r"ruff check ([^\s`]+)", WORKFLOW)
        documented = re.findall(r"ruff check ([^\s`]+)", CLAUDE)
        assert ci, "aucune commande ruff dans le workflow"
        assert documented, "aucune commande ruff dans CLAUDE.md"
        # Toutes les occurrences, prose comprise : deux périmètres différents
        # dans le même fichier est déjà une contradiction.
        divergent = sorted({scope for scope in documented if scope not in ci})
        assert not divergent, (
            f"la CI lint {ci}, la documentation dit {divergent} : un "
            "contributeur qui suit CLAUDE.md n'obtiendra pas le même verdict"
        )

    def test_ruff_is_in_the_copyable_block(self):
        assert "ruff check" in BLOCK

    def test_every_npm_script_of_the_ci_is_documented(self):
        """typecheck, lint et build — build est le plus souvent oublié."""
        ci_scripts = set(re.findall(r"npm run (\w+)", WORKFLOW))
        assert ci_scripts, "aucun script npm dans le workflow"
        missing = sorted(ci_scripts - set(re.findall(r"npm run (\w+)", BLOCK)))
        assert not missing, (
            f"scripts npm lancés par la CI et absents du bloc : {missing}"
        )

    def test_block_installs_frontend_dependencies(self):
        """Sans npm ci, le bloc n'est pas exécutable sur un clone frais."""
        assert "npm ci" in BLOCK

    def test_pytest_is_in_the_copyable_block(self):
        assert "pytest" in BLOCK

    def test_bundle_freshness_check_is_documented(self):
        """La CI échoue si le bundle commité diffère du build."""
        assert "mediatheque-card.js" in WORKFLOW
        assert "mediatheque-card.js" in BLOCK
