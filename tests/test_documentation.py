"""Cohérence entre les commandes documentées et celles de la CI.

Un contributeur qui suit CLAUDE.md doit obtenir le même verdict que la CI. Le
périmètre de `ruff` a déjà divergé une fois — élargi dans le workflow, laissé
étroit dans la documentation — et ça ne se découvre qu'en poussant.

Même intention que `test_manifest.py` pour les versions : empêcher une source de
vérité et sa copie de dériver en silence.
"""
from __future__ import annotations

import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
WORKFLOW = (ROOT / ".github/workflows/validate.yml").read_text("utf-8")
CLAUDE = (ROOT / "CLAUDE.md").read_text("utf-8")


def _ruff_scopes(text: str) -> list[str]:
    """Tous les périmètres passés à ruff. Backtick fermant du markdown exclu.

    Toutes les occurrences, et non la première : la documentation cite la
    commande deux fois, en prose et dans un bloc copiable. C'est le second que
    les gens exécutent, et une garde sur le premier seul ne l'aurait pas vu
    diverger — vérifié.
    """
    return re.findall(r"ruff check ([^\s`]+)", text)


class TestDocumentedCommands:
    def test_ruff_scope_matches_ci(self):
        ci = _ruff_scopes(WORKFLOW)
        documented = _ruff_scopes(CLAUDE)
        assert len(ci) == 1, f"périmètres ruff en CI : {ci}"
        assert documented, "aucune commande ruff trouvée dans CLAUDE.md"
        divergent = [scope for scope in documented if scope != ci[0]]
        assert not divergent, (
            f"la CI lint « {ci[0]} », la documentation dit « {divergent} » : "
            "un contributeur qui suit CLAUDE.md n'obtiendra pas le même verdict"
        )

    def test_frontend_lint_is_documented(self):
        assert "npm run lint" in WORKFLOW
        assert "npm run lint" in CLAUDE, (
            "la CI lint le TypeScript, CLAUDE.md ne le mentionne pas"
        )

    def test_pytest_is_documented(self):
        assert "pytest -q" in WORKFLOW
        assert "pytest" in CLAUDE
