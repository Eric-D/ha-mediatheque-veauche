"""Tests pour __init__.py de l'intégration Médiathèque de Veauche."""
from __future__ import annotations

import custom_components.mediatheque_veauche as integration
from custom_components.mediatheque_veauche import _mark_loan_extended


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
