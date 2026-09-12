"""Identifiants uniques des entités : construction et migration.

Point unique où vit cette logique, appelée par `__init__` au démarrage et par
`config_flow` avant un changement de login. Elle est ici plutôt que dans
`sensor.py` pour rester testable : `sensor.py` n'est pas importable sous les
mocks du conftest, dérivant de classes Home Assistant qu'un MagicMock ne peut
pas servir de base.

Opération irréversible qui ne s'exécute qu'une fois chez chaque utilisateur :
s'y tromper perd son historique. Lire `CLAUDE.md` avant d'y toucher.
"""
from __future__ import annotations

import logging

import homeassistant.helpers.entity_registry as er
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback

from .const import CONF_USERNAME, DOMAIN

_LOGGER = logging.getLogger(__name__)

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


async def async_migrate_unique_ids(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Réécrit les identifiants uniques hérités du login vers l'entry_id.

    Ici et non dans la plateforme sensor : une exception y serait avalée par
    entity_platform, qui journaliserait et renverrait False. L'entrée
    resterait affichée « chargée » avec zéro capteur, à chaque redémarrage et
    sans réessai. Pour une opération irréversible, mieux vaut échouer
    bruyamment.
    """
    username = entry.data[CONF_USERNAME]
    registry = er.async_get(hass)

    @callback
    def _migrate(registry_entry: er.RegistryEntry) -> dict | None:
        new_unique_id = migrated_unique_id(
            entry.entry_id, username, registry_entry.unique_id
        )
        if new_unique_id is None:
            return None
        # Home Assistant lève une ValueError si l'identifiant est déjà pris, et
        # async_migrate_entries n'attrape rien : la migration s'arrêterait en
        # laissant l'utilisateur sans capteurs. Échouer proprement lui laisse
        # les siens et une ligne de journal.
        conflict = registry.async_get_entity_id(
            registry_entry.domain, registry_entry.platform, new_unique_id
        )
        if conflict:
            _LOGGER.warning(
                "Migration de %s abandonnée : %s est déjà utilisé par %s",
                registry_entry.unique_id,
                new_unique_id,
                conflict,
            )
            return None
        _LOGGER.info(
            "Migration de l'identifiant unique %s vers %s",
            registry_entry.unique_id,
            new_unique_id,
        )
        return {"new_unique_id": new_unique_id}

    await er.async_migrate_entries(hass, entry.entry_id, _migrate)
