"""Tests pour __init__.py de l'intégration Médiathèque de Veauche."""
from __future__ import annotations

import custom_components.mediatheque_veauche as integration
import pytest
from homeassistant.exceptions import HomeAssistantError, ServiceValidationError

from custom_components.mediatheque_veauche import (
    _async_extend_loan,
    _loan_entries,
    _mark_loan_extended,
    _owns_loan,
    _select_entry,
)


def test_declares_config_entry_only_schema():
    """hassfest n'émet qu'un avertissement, qui ne fait pas échouer la CI.

    Sans CONFIG_SCHEMA, un « mediatheque_veauche: » dans configuration.yaml est
    accepté en silence au lieu d'être signalé à l'utilisateur.
    """
    assert hasattr(integration, "CONFIG_SCHEMA")


def _loan(url: str | None = None, **overrides):
    loan = {"titre": "Livre", "extend_url": url, "can_extend": True, "extended": False}
    loan.update(overrides)
    return loan


class TestMarkLoanExtended:
    """_mark_loan_extended renvoie une COPIE marquée, sans muter l'entrée.

    La mutation en place laissait l'ancien State de Home Assistant référencer
    les mêmes dicts : la comparaison d'attributs les voyait déjà modifiés,
    aucun state_changed n'était émis, et la prolongation n'apparaissait sur la
    carte qu'au cycle de poll suivant.
    """

    def test_marks_matching_loan(self):
        data = {
            "membres": {
                "Jean": [
                    _loan("http://example.com/extend/1", titre="Livre A"),
                    _loan("http://example.com/extend/2", titre="Livre B"),
                ]
            }
        }

        updated = _mark_loan_extended(data, "http://example.com/extend/1")

        assert updated is not None
        loan_a = updated["membres"]["Jean"][0]
        assert loan_a["can_extend"] is False
        assert loan_a["extended"] is True
        assert loan_a["extend_url"] is None

        # Livre B doit rester inchangé dans la copie
        loan_b = updated["membres"]["Jean"][1]
        assert loan_b["can_extend"] is True
        assert loan_b["extended"] is False
        assert loan_b["extend_url"] == "http://example.com/extend/2"

    def test_source_is_not_mutated(self):
        """Le cœur du contrat : l'objet reçu doit rester intact."""
        data = {"membres": {"Jean": [_loan("http://example.com/extend/1")]}}
        original = data["membres"]["Jean"][0]

        updated = _mark_loan_extended(data, "http://example.com/extend/1")

        assert original["can_extend"] is True
        assert original["extended"] is False
        assert original["extend_url"] == "http://example.com/extend/1"
        # …et la copie ne partage aucun dict de prêt avec la source
        assert updated["membres"]["Jean"][0] is not original

    def test_no_match_returns_none(self):
        data = {"membres": {"Jean": [_loan("http://example.com/extend/99")]}}

        assert _mark_loan_extended(data, "http://example.com/extend/1") is None
        assert data["membres"]["Jean"][0]["can_extend"] is True
        assert data["membres"]["Jean"][0]["extend_url"] == "http://example.com/extend/99"

    def test_empty_membres(self):
        assert _mark_loan_extended({"membres": {}}, "http://example.com/extend/1") is None

    def test_no_membres_key(self):
        assert _mark_loan_extended({}, "http://example.com/extend/1") is None

    def test_none_membres(self):
        data = {"membres": None}
        assert _mark_loan_extended(data, "http://example.com/extend/1") is None
        assert data["membres"] is None

    def test_multiple_members(self):
        data = {
            "membres": {
                "Jean": [_loan("http://example.com/extend/1")],
                "Lucas": [_loan("http://example.com/extend/2")],
            }
        }

        updated = _mark_loan_extended(data, "http://example.com/extend/2")

        assert updated is not None
        assert updated["membres"]["Jean"][0]["can_extend"] is True
        assert updated["membres"]["Lucas"][0]["can_extend"] is False
        assert updated["membres"]["Lucas"][0]["extended"] is True

    def test_loan_without_extend_url_key(self):
        """La clé est absente, pas à None : c'est le seul test du .get()."""
        data = {"membres": {"Jean": [{"titre": "Livre", "can_extend": False}]}}
        assert "extend_url" not in data["membres"]["Jean"][0]
        assert _mark_loan_extended(data, "http://example.com/extend/1") is None

    def test_loan_with_extend_url_none(self):
        data = {"membres": {"Jean": [_loan(None, can_extend=False)]}}
        assert _mark_loan_extended(data, "http://example.com/extend/1") is None

    def test_only_first_match_is_modified(self):
        data = {
            "membres": {
                "Jean": [_loan("http://example.com/extend/1")],
                "Lucas": [_loan("http://example.com/extend/1")],
            }
        }

        updated = _mark_loan_extended(data, "http://example.com/extend/1")

        assert updated is not None
        assert updated["membres"]["Jean"][0]["extended"] is True
        assert updated["membres"]["Lucas"][0]["extended"] is False

    def test_preserves_unrelated_keys(self):
        """La copie doit rester un payload complet, pas seulement « membres »."""
        data = {
            "membres": {"Jean": [_loan("http://example.com/extend/1")]},
            "compte": "Jean",
            "total": 1,
            "subscription": {"expiry_date": "2026-12-31"},
        }

        updated = _mark_loan_extended(data, "http://example.com/extend/1")

        assert updated["compte"] == "Jean"
        assert updated["total"] == 1
        assert updated["subscription"] == {"expiry_date": "2026-12-31"}
        # copy.copy() passerait l'égalité ci-dessus tout en partageant les
        # sous-dicts — exactement le partage de références qu'on interdit.
        assert updated["subscription"] is not data["subscription"]


class _Coordinator:
    def __init__(self, data):
        self.data = data


def _account(*urls, coordinator=True):
    """Entrée de configuration factice détenant les prêts donnés."""
    data = {
        "membres": {"Jean": [{"titre": f"Livre {u}", "extend_url": u} for u in urls]}
    }
    entry = {"client": object(), "username": "u"}
    if coordinator:
        entry["coordinator"] = _Coordinator(data)
    return entry


class TestOwnsLoan:
    def test_finds_the_loan(self):
        assert _owns_loan(_account("u1", "u2"), "u2")

    def test_absent_loan(self):
        assert not _owns_loan(_account("u1"), "u2")

    def test_no_coordinator_yet(self):
        """Démarrage à froid : le coordinator n'a pas encore de données."""
        assert not _owns_loan(_account("u1", coordinator=False), "u1")

    def test_membres_not_a_dict(self):
        assert not _owns_loan({"coordinator": _Coordinator({"membres": None})}, "u1")

    def test_loan_not_a_dict(self):
        coordinator = _Coordinator({"membres": {"Jean": ["pas un dict"]}})
        assert not _owns_loan({"coordinator": coordinator}, "u1")

    @pytest.mark.parametrize("membres", [None, "pasundict", 42, []])
    def test_malformed_membres_does_not_raise(self, membres):
        """Une exception ici interromprait la boucle de _select_entry.

        Un seul compte aux données corrompues empêcherait alors tous les autres
        de prolonger.
        """
        coordinator = _Coordinator({"membres": membres})
        assert not _owns_loan({"coordinator": coordinator}, "u1")

    def test_loans_not_a_list(self):
        coordinator = _Coordinator({"membres": {"Jean": None}})
        assert not _owns_loan({"coordinator": coordinator}, "u1")


class TestSelectEntry:
    """Se tromper de compte est silencieux et coûteux.

    La session du mauvais compte ne possède pas le prêt : le portail répond une
    page d'erreur ou une redirection, et rien ne le signale. Mieux vaut ne rien
    faire que deviner.
    """

    def test_routes_to_the_owning_account(self):
        entries = [("a", _account("u1")), ("b", _account("u2"))]
        assert _select_entry(entries, "u2")[0] == "b"

    def test_does_not_guess_between_several_accounts(self):
        entries = [("a", _account("u1")), ("b", _account("u2"))]
        assert _select_entry(entries, "inconnue") is None

    def test_single_account_without_the_loan_is_not_a_fallback(self):
        """Pas de repli sur « le seul compte configuré ».

        Avec deux comptes dont un en échec de configuration, il ne reste qu'une
        entrée : un repli enverrait l'URL du compte absent sur la session de
        l'autre — le bug corrigé ici, redevenu silencieux.
        """
        entries = [("a", _account("u1", coordinator=False))]
        assert _select_entry(entries, "u1") is None

    def test_same_url_in_two_accounts_takes_the_first(self):
        """Cas réel : deux conjoints voient les mêmes prêts de famille.

        L'une ou l'autre session prolonge correctement, donc pas de casse. Mais
        seul le coordinator sélectionné est marqué : la carte de l'autre compte
        affichera « Prolonger » jusqu'au prochain cycle.
        """
        entries = [("a", _account("commune")), ("b", _account("commune"))]
        assert _select_entry(entries, "commune")[0] == "a"

    def test_no_account_at_all(self):
        assert _select_entry([], "u1") is None

    def test_ownership_wins_over_insertion_order(self):
        """Le bug d'origine prenait la première entrée quoi qu'il arrive."""
        entries = [("premier", _account("autre")), ("second", _account("cible"))]
        assert _select_entry(entries, "cible")[0] == "second"


class TestLoanEntries:
    def test_ignores_non_entry_keys(self):
        """hass.data[DOMAIN] ne contient pas que des entrées de configuration."""

        class _Hass:
            data = {
                "mediatheque_veauche": {
                    "abc": {"client": object(), "username": "u"},
                    "sans_client": {"username": "u"},
                    "pas_un_dict": "valeur",
                }
            }

        assert [entry_id for entry_id, _ in _loan_entries(_Hass())] == ["abc"]

    def test_missing_domain_key(self):
        class _Hass:
            data: dict = {}

        assert _loan_entries(_Hass()) == []


class _Client:
    """Client factice qui enregistre les prolongations demandées."""

    def __init__(self, name, fails=False):
        self.name = name
        self.calls: list[str] = []
        self.fails = fails

    def extend_loan(self, url):
        self.calls.append(url)
        if self.fails:
            raise RuntimeError("500 Server Error for url: https://…/extend/1")


class _RecordingCoordinator(_Coordinator):
    def __init__(self, data):
        super().__init__(data)
        self.updates: list[dict] = []

    def async_set_updated_data(self, data):
        self.updates.append(data)


class _Hass:
    def __init__(self, entries):
        self.data = {"mediatheque_veauche": dict(entries)}

    async def async_add_executor_job(self, func, *args):
        return func(*args)


def _wired_account(name, *urls, fails=False):
    """Entrée complète : client ET coordinator, comme async_setup_entry la pose."""
    return {
        "client": _Client(name, fails=fails),
        "username": name,
        "options": {},
        "coordinator": _RecordingCoordinator(
            {"membres": {name: [{"titre": "Livre", "extend_url": u} for u in urls]}}
        ),
    }


class TestExtendLoanWiring:
    """Le câblage, pas seulement le choix.

    Tester la seule fonction de sélection laissait passer une régression qui
    aurait rebranché l'appel sur la première entrée : les tests seraient restés
    verts alors que le bug d'origine serait revenu.
    """

    @staticmethod
    def _run(coro):
        import asyncio

        return asyncio.new_event_loop().run_until_complete(coro)

    def test_calls_the_owning_client(self):
        a = _wired_account("a", "u1")
        b = _wired_account("b", "u2")
        hass = _Hass({"ea": a, "eb": b})

        self._run(_async_extend_loan(hass, "u2"))

        assert a["client"].calls == []
        assert b["client"].calls == ["u2"]

    def test_marks_the_owning_coordinator_only(self):
        a = _wired_account("a", "u1")
        b = _wired_account("b", "u2")
        hass = _Hass({"ea": a, "eb": b})

        self._run(_async_extend_loan(hass, "u2"))

        assert a["coordinator"].updates == []
        assert len(b["coordinator"].updates) == 1
        marked = b["coordinator"].updates[0]["membres"]["b"][0]
        assert marked["extended"] is True
        assert marked["extend_url"] is None

    def test_no_account_configured(self):
        with pytest.raises(ServiceValidationError):
            self._run(_async_extend_loan(_Hass({}), "u1"))

    def test_loan_not_found_anywhere(self):
        hass = _Hass({"ea": _wired_account("a", "u1")})
        with pytest.raises(ServiceValidationError):
            self._run(_async_extend_loan(hass, "inconnue"))

    def test_portal_failure_is_wrapped(self):
        """L'erreur brute de requests contient l'URL de prolongation."""
        hass = _Hass({"ea": _wired_account("a", "u1", fails=True)})
        with pytest.raises(HomeAssistantError) as excinfo:
            self._run(_async_extend_loan(hass, "u1"))
        assert "La prolongation a échoué" in str(excinfo.value)
