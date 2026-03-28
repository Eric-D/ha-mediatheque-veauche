"""Tests pour __init__.py de l'intégration Médiathèque de Veauche."""
from __future__ import annotations

from custom_components.mediatheque_veauche import _mark_loan_extended


class TestMarkLoanExtended:
    def test_marks_matching_loan(self):
        data = {
            "membres": {
                "Jean": [
                    {
                        "titre": "Livre A",
                        "extend_url": "http://example.com/extend/1",
                        "can_extend": True,
                        "extended": False,
                    },
                    {
                        "titre": "Livre B",
                        "extend_url": "http://example.com/extend/2",
                        "can_extend": True,
                        "extended": False,
                    },
                ]
            }
        }
        _mark_loan_extended(data, "http://example.com/extend/1")

        loan_a = data["membres"]["Jean"][0]
        assert loan_a["can_extend"] is False
        assert loan_a["extended"] is True
        assert loan_a["extend_url"] is None

        # Livre B doit rester inchangé
        loan_b = data["membres"]["Jean"][1]
        assert loan_b["can_extend"] is True
        assert loan_b["extended"] is False
        assert loan_b["extend_url"] == "http://example.com/extend/2"

    def test_no_match_leaves_data_unchanged(self):
        data = {
            "membres": {
                "Jean": [
                    {
                        "extend_url": "http://example.com/extend/99",
                        "can_extend": True,
                        "extended": False,
                    }
                ]
            }
        }
        _mark_loan_extended(data, "http://example.com/extend/1")
        assert data["membres"]["Jean"][0]["can_extend"] is True
        assert data["membres"]["Jean"][0]["extend_url"] == "http://example.com/extend/99"

    def test_empty_membres(self):
        data = {"membres": {}}
        _mark_loan_extended(data, "http://example.com/extend/1")
        assert data["membres"] == {}

    def test_no_membres_key(self):
        data = {}
        _mark_loan_extended(data, "http://example.com/extend/1")
        assert data == {}

    def test_none_membres(self):
        data = {"membres": None}
        _mark_loan_extended(data, "http://example.com/extend/1")
        assert data["membres"] is None

    def test_multiple_members(self):
        data = {
            "membres": {
                "Jean": [
                    {"extend_url": "http://example.com/extend/1", "can_extend": True, "extended": False},
                ],
                "Lucas": [
                    {"extend_url": "http://example.com/extend/2", "can_extend": True, "extended": False},
                ],
            }
        }
        _mark_loan_extended(data, "http://example.com/extend/2")

        assert data["membres"]["Jean"][0]["can_extend"] is True
        assert data["membres"]["Lucas"][0]["can_extend"] is False
        assert data["membres"]["Lucas"][0]["extended"] is True

    def test_loan_without_extend_url(self):
        data = {
            "membres": {
                "Jean": [
                    {"can_extend": False, "extended": False},
                ]
            }
        }
        _mark_loan_extended(data, "http://example.com/extend/1")
        assert data["membres"]["Jean"][0]["can_extend"] is False

    def test_only_first_match_is_modified(self):
        data = {
            "membres": {
                "Jean": [
                    {"extend_url": "http://example.com/extend/1", "can_extend": True, "extended": False},
                ],
                "Lucas": [
                    {"extend_url": "http://example.com/extend/1", "can_extend": True, "extended": False},
                ],
            }
        }
        _mark_loan_extended(data, "http://example.com/extend/1")

        # Le premier trouvé (Jean) est modifié, Lucas reste intact
        assert data["membres"]["Jean"][0]["extended"] is True
        assert data["membres"]["Lucas"][0]["extended"] is False
