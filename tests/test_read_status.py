"""État « lu » : clé du livre, drapeaux dérivés, purge et persistance.

Tout est ici plutôt que dans `sensor.py` pour la raison habituelle du dépôt :
ce qui vit dans une classe d'entité n'est pas importable sous les mocks, donc
hors de portée des tests, et la suite resterait verte quoi qu'on y casse.
"""
from __future__ import annotations

import asyncio
from datetime import UTC, datetime, timedelta

import pytest

from custom_components.mediatheque_veauche.read_status import (
    PRUNE_AFTER,
    ReadStatus,
    loan_key,
    prune_entries,
    with_read_flags,
)

NOW = datetime(2026, 9, 13, 12, 0, 0, tzinfo=UTC)


def _run(coro):
    return asyncio.run(coro)


class _Store:
    """Le pan de Store qu'utilise ReadStatus, avec ses écritures observables."""

    def __init__(self, initial=None, fail_load=False):
        self.saved: list[dict] = []
        self._initial = initial
        self._fail_load = fail_load
        self.loads = 0

    async def async_load(self):
        self.loads += 1
        # Point de suspension réel : le vrai Store touche le disque. Sans lui,
        # `gather` mène la première tâche jusqu'au bout avant de lancer la
        # seconde, la course ne se produit jamais, et le test du verrou reste
        # vert même une fois le verrou retiré — vérifié par sabotage.
        await asyncio.sleep(0)
        if self._fail_load:
            raise OSError("disque en rade")
        return self._initial

    async def async_save(self, data):
        self.saved.append(data)


class TestLoanKey:
    def test_prefers_the_catalogue_id(self):
        assert loan_key({"book_id": "4212", "titre": "Astérix"}) == "id:4212"

    def test_falls_back_on_the_title(self):
        """Le scraper laisse book_id à None quand le titre n'est pas un lien."""
        assert loan_key({"book_id": None, "titre": "Astérix"}) == "titre:astérix"

    def test_title_fallback_ignores_case_and_spacing(self):
        """Le portail ne rend pas toujours les espaces à l'identique d'une page
        à l'autre : sans normalisation, le même livre aurait deux clés et le
        badge disparaîtrait au rechargement."""
        assert loan_key({"titre": "  Le   PETIT\tPrince "}) == loan_key(
            {"titre": "le petit prince"}
        )

    def test_the_two_namespaces_cannot_collide(self):
        """Un catalogue dont les identifiants sont des mots ferait entrer en
        collision un livre avec le titre d'un autre."""
        assert loan_key({"book_id": "prince"}) != loan_key({"titre": "prince"})

    @pytest.mark.parametrize(
        "loan",
        [
            {},
            {"book_id": "", "titre": ""},
            {"book_id": "   ", "titre": "  "},
            {"book_id": 42, "titre": None},
            "pas un dict",
            None,
        ],
    )
    def test_no_key_rather_than_a_bad_one(self, loan):
        """Une clé bidon serait écrite sur le disque et ne retrouverait jamais
        son livre ; la carte masque le contrôle quand la clé manque."""
        assert loan_key(loan) is None

    def test_an_integer_book_id_is_not_mistaken_for_a_key(self):
        """Le scraper renvoie toujours une chaîne ; un entier signale un format
        inattendu, sur lequel on préfère le repli au titre."""
        assert loan_key({"book_id": 4212, "titre": "Astérix"}) == "titre:astérix"


def _data(*loans):
    return {"compte": "DUPONT", "membres": {"Jean": list(loans)}}


class TestWithReadFlags:
    def test_marks_only_the_known_keys(self):
        data = _data({"titre": "A", "book_id": "1"}, {"titre": "B", "book_id": "2"})

        out = with_read_flags(data, {"id:1"})

        assert [loan["read"] for loan in out["membres"]["Jean"]] == [True, False]

    def test_exposes_the_key_for_the_card_to_send_back(self):
        """La carte renvoie `read_key` tel quel au service. Le recalculer en
        TypeScript dupliquerait la normalisation du titre dans un langage dont
        le toLowerCase ne fait pas le travail de casefold."""
        out = with_read_flags(_data({"titre": "A", "book_id": "1"}), set())

        assert out["membres"]["Jean"][0]["read_key"] == "id:1"

    def test_a_loan_without_key_is_never_read(self):
        out = with_read_flags(_data({"titre": "", "book_id": None}), {"id:1"})

        assert out["membres"]["Jean"][0] == {
            "titre": "", "book_id": None, "read_key": None, "read": False
        }

    def test_returns_a_copy_never_a_mutation(self):
        """Muter en place laisserait l'ancien State de HA référencer les mêmes
        dicts : la comparaison d'attributs les verrait déjà modifiés, aucun
        state_changed ne serait émis, et le badge n'apparaîtrait qu'au cycle de
        poll suivant — une heure après le clic, par défaut."""
        loan = {"titre": "A", "book_id": "1"}
        data = _data(loan)

        with_read_flags(data, {"id:1"})

        assert loan == {"titre": "A", "book_id": "1"}
        assert data["membres"]["Jean"][0] is loan

    def test_the_untouched_payload_survives(self):
        out = with_read_flags(_data({"titre": "A"}), set())

        assert out["compte"] == "DUPONT"

    @pytest.mark.parametrize("membres", [None, [], "nope", 42])
    def test_a_payload_without_members_passes_through(self, membres):
        data = {"membres": membres}

        assert with_read_flags(data, {"id:1"}) is data

    def test_a_corrupt_member_does_not_break_the_others(self):
        """Une exception ici priverait tous les membres de leurs drapeaux."""
        data = {"membres": {"Jean": [{"book_id": "1"}, "bancal", None], "Luc": "pas une liste"}}

        out = with_read_flags(data, {"id:1"})

        assert out["membres"]["Jean"][0]["read"] is True
        assert out["membres"]["Jean"][1:] == ["bancal", None]
        assert out["membres"]["Luc"] == "pas une liste"


class TestPruneEntries:
    def test_drops_what_is_older_than_the_budget(self):
        old = (NOW - PRUNE_AFTER - timedelta(days=1)).isoformat()

        assert prune_entries({"id:1": {"marked_at": old}}, NOW) == {}

    def test_keeps_what_is_within_the_budget(self):
        recent = (NOW - PRUNE_AFTER + timedelta(days=1)).isoformat()

        assert "id:1" in prune_entries({"id:1": {"marked_at": recent}}, NOW)

    def test_an_unreadable_date_is_kept_not_purged(self):
        """Plus probablement un format hérité qu'une corruption : perdre l'état
        de lecture d'un utilisateur pour une date illisible serait un remède
        pire que le mal."""
        entries = {"id:1": {"marked_at": "avant-hier"}, "id:2": {}}

        assert prune_entries(entries, NOW) == entries

    def test_drops_what_is_not_an_entry(self):
        assert prune_entries({"id:1": "pas un dict", 42: {}}, NOW) == {}

    def test_a_naive_date_does_not_crash_the_load(self):
        """`now` est conscient du fuseau ; soustraire un marked_at naïf — ce
        qu'écrirait une version antérieure — lève TypeError et non ValueError.
        Ne rattraper que la seconde ferait planter le chargement sur un fichier
        hérité, donc une intégration qui ne démarre plus."""
        entries = {"id:1": {"marked_at": "2026-09-13T12:00:00"}}

        assert prune_entries(entries, NOW) == entries


class TestReadStatus:
    def test_starts_empty_without_a_file(self):
        status = ReadStatus(_Store(None))

        _run(status.async_ensure_loaded(NOW))

        assert status.keys == set()

    def test_reads_the_stored_keys(self):
        store = _Store({"entries": {"id:1": {"marked_at": NOW.isoformat()}}})
        status = ReadStatus(store)

        _run(status.async_ensure_loaded(NOW))

        assert status.keys == {"id:1"}

    def test_an_unreadable_file_does_not_block_the_setup(self):
        """Un état de lecture illisible ne doit pas empêcher l'intégration de
        se charger : on repart à vide, ce qui se voit, plutôt que de laisser
        l'entrée en erreur pour une raison décorative."""
        status = ReadStatus(_Store(fail_load=True))

        _run(status.async_ensure_loaded(NOW))

        assert status.keys == set()

    @pytest.mark.parametrize("raw", ["pas un dict", 42, []])
    def test_a_corrupt_container_is_ignored(self, raw):
        status = ReadStatus(_Store(raw))

        _run(status.async_ensure_loaded(NOW))

        assert status.keys == set()

    def test_purges_on_load_and_writes_back(self):
        old = (NOW - PRUNE_AFTER - timedelta(days=1)).isoformat()
        store = _Store({"entries": {
            "id:1": {"marked_at": old},
            "id:2": {"marked_at": NOW.isoformat()},
        }})
        status = ReadStatus(store)

        _run(status.async_ensure_loaded(NOW))

        assert status.keys == {"id:2"}
        assert store.saved == [{"entries": {"id:2": {"marked_at": NOW.isoformat()}}}]

    def test_a_load_without_purge_writes_nothing(self):
        """Réécrire à chaque démarrage userait le disque pour rien, et
        toucherait le fichier même quand l'utilisateur n'a rien marqué."""
        store = _Store({"entries": {"id:1": {"marked_at": NOW.isoformat()}}})

        _run(ReadStatus(store).async_ensure_loaded(NOW))

        assert store.saved == []

    def test_concurrent_setups_read_the_disk_once(self):
        """Deux entrées de configuration font leur setup concurremment. Sans
        verrou, la seconde pourrait lire `keys` avant la fin du chargement de
        la première — donc servir un premier rendu sans aucun badge."""
        store = _Store({"entries": {"id:1": {"marked_at": NOW.isoformat()}}})
        status = ReadStatus(store)

        async def both():
            await asyncio.gather(
                status.async_ensure_loaded(NOW), status.async_ensure_loaded(NOW)
            )

        _run(both())

        assert store.loads == 1
        assert status.keys == {"id:1"}

    def test_marking_writes_and_reports_a_change(self):
        store = _Store(None)
        status = ReadStatus(store)
        _run(status.async_ensure_loaded(NOW))

        assert _run(status.async_set("id:1", True, NOW, "Astérix")) is True
        assert status.keys == {"id:1"}
        assert store.saved[-1] == {
            "entries": {"id:1": {"marked_at": NOW.isoformat(), "titre": "Astérix"}}
        }

    def test_unmarking_removes_the_entry(self):
        store = _Store({"entries": {"id:1": {"marked_at": NOW.isoformat()}}})
        status = ReadStatus(store)
        _run(status.async_ensure_loaded(NOW))

        assert _run(status.async_set("id:1", False, NOW)) is True
        assert status.keys == set()
        assert store.saved[-1] == {"entries": {}}

    @pytest.mark.parametrize("read", [True, False])
    def test_marking_what_is_already_in_that_state_writes_nothing(self, read):
        """Sans ce court-circuit, chaque rendu qui rebasculerait par erreur
        toucherait le disque."""
        initial = {"entries": {"id:1": {"marked_at": NOW.isoformat()}}} if read else None
        store = _Store(initial)
        status = ReadStatus(store)
        _run(status.async_ensure_loaded(NOW))
        store.saved.clear()

        assert _run(status.async_set("id:1", read, NOW)) is False
        assert store.saved == []

    def test_a_title_is_optional(self):
        """La carte n'envoie que la clé ; le titre n'est là que pour rendre le
        fichier de .storage lisible quand on diagnostique."""
        store = _Store(None)
        status = ReadStatus(store)
        _run(status.async_ensure_loaded(NOW))

        _run(status.async_set("id:1", True, NOW))

        assert store.saved[-1] == {"entries": {"id:1": {"marked_at": NOW.isoformat()}}}

    def test_keys_is_a_snapshot_not_the_live_set(self):
        """La source lit `keys` à chaque service : renvoyer l'ensemble interne
        laisserait un appelant le muter et désynchroniser le disque."""
        store = _Store(None)
        status = ReadStatus(store)
        _run(status.async_ensure_loaded(NOW))
        _run(status.async_set("id:1", True, NOW))

        status.keys.add("id:2")

        assert status.keys == {"id:1"}
