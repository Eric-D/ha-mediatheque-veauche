"""Migration des identifiants uniques d'entités.

Module sans dépendance Home Assistant, pour rester testable : sensor.py, qui
l'utilise, ne l'est pas — il dérive de classes Home Assistant qu'un mock ne peut
pas servir de base.
"""
from __future__ import annotations

from .const import DOMAIN

# Suffixes historiques, dans l'ordre du plus long au plus court pour qu'un
# suffixe qui en contient un autre soit reconnu en premier.
ENTITY_SUFFIXES = (
    "last_update",
    "subscription",
    "due_week",
    "overdue",
    "total",
)


def build_unique_id(entry_id: str, suffix: str) -> str:
    """Identifiant unique d'une entité, indépendant du login.

    Les identifiants dérivaient du login. Le changer — carte renouvelée,
    nouveau numéro — créait donc cinq entités neuves et orphelinait les
    anciennes : carte du tableau de bord cassée, historique perdu,
    automatisations muettes. L'entry_id, lui, ne change jamais.
    """
    return f"{entry_id}_{suffix}"


def migrated_unique_id(entry_id: str, old_unique_id: str) -> str | None:
    """Nouvel identifiant pour une entité au format historique, sinon None.

    Idempotent : une entité déjà migrée renvoie None, ce qui permet de rejouer
    la migration à chaque démarrage sans état à conserver.
    """
    if old_unique_id.startswith(f"{entry_id}_"):
        return None
    if not old_unique_id.startswith(f"{DOMAIN}_"):
        return None
    for suffix in ENTITY_SUFFIXES:
        if old_unique_id.endswith(f"_{suffix}"):
            return build_unique_id(entry_id, suffix)
    return None
