"""Migration des identifiants uniques d'entités.

Module sans dépendance Home Assistant, pour rester testable : sensor.py, qui
l'utilise, ne l'est pas — il dérive de classes Home Assistant qu'un mock ne peut
pas servir de base.
"""
from __future__ import annotations

from .const import DOMAIN

# Formats historiques, tous dérivés du login. Cette liste ne doit jamais
# rétrécir : un utilisateur qui n'a pas encore démarré depuis la mise à jour a
# encore des entités sous ces noms, et en retirer un les condamnerait.
ENTITY_SUFFIXES = (
    "total",
    "due_week",
    "overdue",
    "subscription",
    "last_update",
)


def build_unique_id(entry_id: str, suffix: str) -> str:
    """Identifiant unique d'une entité, indépendant du login.

    Les identifiants dérivaient du login. Le changer — carte renouvelée,
    nouveau numéro — créait donc cinq entités neuves et orphelinait les
    anciennes : carte du tableau de bord cassée, historique perdu,
    automatisations muettes. L'entry_id, lui, ne change jamais.
    """
    return f"{entry_id}_{suffix}"


def migrated_unique_id(
    entry_id: str, username: str, old_unique_id: str
) -> str | None:
    """Nouvel identifiant pour une entité du login courant, sinon None.

    La correspondance est exacte sur le login courant, et non heuristique sur
    le suffixe. Un utilisateur ayant déjà changé de login avant cette mise à
    jour a deux jeux d'entités rattachés à la même entrée : celles de l'ancien
    login, orphelines, et celles du login courant, qui portent l'historique et
    l'entity_id du tableau de bord. Une correspondance par suffixe migrerait
    les deux — l'orpheline d'abord, puisqu'elle est enregistrée en premier —
    et lui ferait perdre exactement ce que la migration prétend sauver.

    Idempotent : une entité déjà migrée ne correspond à aucun format
    historique, ce qui permet de rejouer la migration à chaque démarrage sans
    état à conserver.
    """
    for suffix in ENTITY_SUFFIXES:
        if old_unique_id == f"{DOMAIN}_{username}_{suffix}":
            return build_unique_id(entry_id, suffix)
    return None
