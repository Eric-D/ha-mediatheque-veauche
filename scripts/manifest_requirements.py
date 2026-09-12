#!/usr/bin/env python3
"""Écrit les dépendances runtime du manifeste dans un fichier pip.

Le manifeste est la seule source de vérité : recopier ses bornes à la main
dans requirements_test.txt les laissait diverger silencieusement au premier
bump, et la CI aurait alors validé contre un plancher périmé.

Usage : python scripts/manifest_requirements.py [fichier-de-sortie]
"""
from __future__ import annotations

import json
import pathlib
import sys

# Relatif au script et non au répertoire courant : l'appelant n'a pas à se
# trouver à la racine du dépôt.
MANIFEST = (
    pathlib.Path(__file__).resolve().parent.parent
    / "custom_components/mediatheque_veauche/manifest.json"
)


def main() -> int:
    out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "manifest-requirements.txt")
    requirements = json.loads(MANIFEST.read_text(encoding="utf-8"))["requirements"]
    out.write_text("\n".join(requirements) + "\n", encoding="utf-8")
    print(f"{out} :", ", ".join(requirements))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
