"""Tests pour le scraper de la Médiathèque de Veauche."""
from __future__ import annotations

from datetime import date
from unittest.mock import patch

import pytest
from bs4 import BeautifulSoup

from custom_components.mediatheque_veauche.scraper import (
    MediathequeVeaucheClient,
)


# ---------------------------------------------------------------------------
# Fixture : client sans session (pour tester les méthodes statiques / internes)
# ---------------------------------------------------------------------------

@pytest.fixture
def client():
    return MediathequeVeaucheClient("user", "pass")


@pytest.fixture
def client_with_lastname():
    c = MediathequeVeaucheClient("user", "pass")
    c._lastname = "DUPONT"
    return c


# ---------------------------------------------------------------------------
# _parse_date
# ---------------------------------------------------------------------------

class TestParseDate:
    def test_standard(self):
        assert MediathequeVeaucheClient._parse_date("15-03-2024") == "2024-03-15"

    def test_first_day(self):
        assert MediathequeVeaucheClient._parse_date("01-01-2025") == "2025-01-01"

    def test_last_day(self):
        assert MediathequeVeaucheClient._parse_date("31-12-2024") == "2024-12-31"

    def test_with_spaces(self):
        assert MediathequeVeaucheClient._parse_date("  15-03-2024  ") == "2024-03-15"

    def test_invalid_returns_original(self):
        assert MediathequeVeaucheClient._parse_date("invalid") == "invalid"

    def test_empty_string(self):
        assert MediathequeVeaucheClient._parse_date("") == ""

    def test_wrong_format(self):
        assert MediathequeVeaucheClient._parse_date("2024-03-15") == "2024-03-15"


# ---------------------------------------------------------------------------
# _format_date_display
# ---------------------------------------------------------------------------

class TestFormatDateDisplay:
    def test_march(self):
        assert MediathequeVeaucheClient._format_date_display("2024-03-15") == "15 mars 2024"

    def test_january(self):
        assert MediathequeVeaucheClient._format_date_display("2024-01-01") == "1 janvier 2024"

    def test_december(self):
        assert MediathequeVeaucheClient._format_date_display("2024-12-31") == "31 décembre 2024"

    def test_invalid_returns_original(self):
        assert MediathequeVeaucheClient._format_date_display("invalid") == "invalid"

    def test_empty_returns_empty(self):
        assert MediathequeVeaucheClient._format_date_display("") == ""


# ---------------------------------------------------------------------------
# _days_until (nécessite un mock de date.today)
# ---------------------------------------------------------------------------

class FakeDate(date):
    """date dont today() renvoie toujours 2024-03-10."""
    @classmethod
    def today(cls):
        return date(2024, 3, 10)


class TestDaysUntil:
    @patch("custom_components.mediatheque_veauche.scraper.date", FakeDate)
    def test_future_5_days(self):
        assert MediathequeVeaucheClient._days_until("2024-03-15") == 5

    @patch("custom_components.mediatheque_veauche.scraper.date", FakeDate)
    def test_today(self):
        assert MediathequeVeaucheClient._days_until("2024-03-10") == 0

    @patch("custom_components.mediatheque_veauche.scraper.date", FakeDate)
    def test_overdue(self):
        assert MediathequeVeaucheClient._days_until("2024-03-07") == -3

    @patch("custom_components.mediatheque_veauche.scraper.date", FakeDate)
    def test_far_future(self):
        assert MediathequeVeaucheClient._days_until("2024-04-10") == 31

    def test_invalid_date_returns_zero(self):
        assert MediathequeVeaucheClient._days_until("invalid") == 0

    def test_empty_string_returns_zero(self):
        assert MediathequeVeaucheClient._days_until("") == 0


# ---------------------------------------------------------------------------
# _extract_firstname
# ---------------------------------------------------------------------------

class TestExtractFirstname:
    def test_lastname_prefix(self, client_with_lastname):
        assert client_with_lastname._extract_firstname("DUPONT Jean") == "Jean"

    def test_lastname_case_insensitive(self, client_with_lastname):
        assert client_with_lastname._extract_firstname("dupont Marie") == "Marie"

    def test_compound_firstname(self, client_with_lastname):
        assert client_with_lastname._extract_firstname("DUPONT Marie-Claire") == "Marie-Claire"

    def test_no_lastname_fallback_last_word(self, client):
        assert client._extract_firstname("DUPONT Jean") == "Jean"

    def test_single_word(self, client):
        assert client._extract_firstname("Jean") == "Jean"

    def test_empty_string(self, client):
        assert client._extract_firstname("") == ""

    def test_whitespace_only(self, client):
        assert client._extract_firstname("   ") == ""

    def test_lastname_is_entire_string(self, client_with_lastname):
        # Si le nom complet est juste le nom de famille, fallback
        result = client_with_lastname._extract_firstname("DUPONT")
        assert result == "DUPONT"  # fallback: dernier mot


# ---------------------------------------------------------------------------
# _parse_loan_row
# ---------------------------------------------------------------------------

def _make_row(cells_html: str) -> BeautifulSoup:
    """Crée un élément <tr> parsé par BeautifulSoup."""
    html = f"<table><tbody><tr>{cells_html}</tr></tbody></table>"
    soup = BeautifulSoup(html, "html.parser")
    return soup.find("tr")


class TestParseLoanRow:
    @patch("custom_components.mediatheque_veauche.scraper.date", FakeDate)
    def test_basic_row_without_emprunteur(self, client):
        row = _make_row(
            '<td><a href="/index.php?view=Book&id=123">Le Petit Prince</a></td>'
            '<td>Veauche</td>'
            '<td><span class="badge">15-03-2024</span></td>'
            '<td><a href="/extend/123">Prolonger</a></td>'
        )
        loan = client._parse_loan_row(row, has_emprunteur=False, default_emprunteur="Jean")

        assert loan is not None
        assert loan["titre"] == "Le Petit Prince"
        assert loan["book_id"] == "123"
        assert loan["due_date"] == "2024-03-15"
        assert loan["days_left"] == 5
        assert loan["can_extend"] is True
        assert loan["extended"] is False
        assert loan["emprunteur"] == "Jean"
        assert loan["extend_url"].endswith("/extend/123")

    @patch("custom_components.mediatheque_veauche.scraper.date", FakeDate)
    def test_row_with_emprunteur(self, client_with_lastname):
        row = _make_row(
            '<td><a href="/index.php?view=Book&id=456">Harry Potter</a></td>'
            '<td>Veauche</td>'
            '<td>DUPONT Lucas</td>'
            '<td><span class="badge">07-03-2024</span></td>'
            '<td><a href="/extend/456" class="disabled">Prolonger</a></td>'
        )
        loan = client_with_lastname._parse_loan_row(
            row, has_emprunteur=True, default_emprunteur="Jean"
        )

        assert loan is not None
        assert loan["titre"] == "Harry Potter"
        assert loan["emprunteur"] == "Lucas"
        assert loan["days_left"] == -3
        assert loan["can_extend"] is False
        assert loan["extended"] is True

    def test_empty_row_returns_none(self, client):
        row = _make_row("")
        assert client._parse_loan_row(row, has_emprunteur=False, default_emprunteur="X") is None

    def test_insufficient_cells_returns_none(self, client):
        row = _make_row("<td>Seul</td><td>Deux</td>")
        assert client._parse_loan_row(row, has_emprunteur=False, default_emprunteur="X") is None

    @patch("custom_components.mediatheque_veauche.scraper.date", FakeDate)
    def test_no_extend_link(self, client):
        row = _make_row(
            '<td>Un livre</td>'
            '<td>Veauche</td>'
            '<td><span class="badge">20-03-2024</span></td>'
            '<td></td>'
        )
        loan = client._parse_loan_row(row, has_emprunteur=False, default_emprunteur="Test")
        assert loan is not None
        assert loan["can_extend"] is False
        assert loan["extend_url"] is None


# ---------------------------------------------------------------------------
# fetch_borrowings (parsing HTML complet)
# ---------------------------------------------------------------------------

SAMPLE_BORROWINGS_HTML = """
<html><body>
<div id="profile_borrowed">
  <h2>DUPONT Jean</h2>
</div>

<div id="user_borrow">
  <table>
    <tbody>
      <tr>
        <td><a href="/index.php?view=Book&id=100">Astérix le Gaulois</a></td>
        <td>Veauche</td>
        <td><span class="badge">20-03-2024</span></td>
        <td><a href="/extend/100">Prolonger</a></td>
      </tr>
      <tr>
        <td><a href="/index.php?view=Book&id=101">Tintin au Tibet</a></td>
        <td>Veauche</td>
        <td><span class="badge">25-03-2024</span></td>
        <td><a href="/extend/101" class="disabled">Prolonger</a></td>
      </tr>
    </tbody>
  </table>
</div>

<div id="family_borrow">
  <table>
    <tbody>
      <tr>
        <td><a href="/index.php?view=Book&id=200">Le Chat du Rabbin</a></td>
        <td>Veauche</td>
        <td>DUPONT Lucas</td>
        <td><span class="badge">12-03-2024</span></td>
        <td><a href="/extend/200">Prolonger</a></td>
      </tr>
    </tbody>
  </table>
</div>
</body></html>
"""


class TestFetchBorrowings:
    @patch("custom_components.mediatheque_veauche.scraper.date", FakeDate)
    def test_parses_all_members(self, client_with_lastname):
        client_with_lastname._borrowings_html = SAMPLE_BORROWINGS_HTML
        data = client_with_lastname.fetch_borrowings()

        assert data["compte"] == "Jean"
        assert data["total"] == 3
        assert "Jean" in data["membres"]
        assert "Lucas" in data["membres"]

    @patch("custom_components.mediatheque_veauche.scraper.date", FakeDate)
    def test_user_loans(self, client_with_lastname):
        client_with_lastname._borrowings_html = SAMPLE_BORROWINGS_HTML
        data = client_with_lastname.fetch_borrowings()

        jean_loans = data["membres"]["Jean"]
        assert len(jean_loans) == 2
        assert jean_loans[0]["titre"] == "Astérix le Gaulois"
        assert jean_loans[0]["can_extend"] is True
        assert jean_loans[1]["titre"] == "Tintin au Tibet"
        assert jean_loans[1]["extended"] is True

    @patch("custom_components.mediatheque_veauche.scraper.date", FakeDate)
    def test_family_loans(self, client_with_lastname):
        client_with_lastname._borrowings_html = SAMPLE_BORROWINGS_HTML
        data = client_with_lastname.fetch_borrowings()

        lucas_loans = data["membres"]["Lucas"]
        assert len(lucas_loans) == 1
        assert lucas_loans[0]["titre"] == "Le Chat du Rabbin"
        assert lucas_loans[0]["emprunteur"] == "Lucas"
        assert lucas_loans[0]["days_left"] == 2

    def test_empty_html(self, client):
        client._borrowings_html = "<html><body></body></html>"
        data = client.fetch_borrowings()

        assert data["compte"] == ""
        assert data["total"] == 0
        assert data["membres"] == {}

    @patch("custom_components.mediatheque_veauche.scraper.date", FakeDate)
    def test_due_dates_computed(self, client_with_lastname):
        client_with_lastname._borrowings_html = SAMPLE_BORROWINGS_HTML
        data = client_with_lastname.fetch_borrowings()

        asterix = data["membres"]["Jean"][0]
        assert asterix["due_date"] == "2024-03-20"
        assert asterix["due_date_display"] == "20 mars 2024"
        assert asterix["days_left"] == 10


# ---------------------------------------------------------------------------
# _fetch_subscription_expiry
# ---------------------------------------------------------------------------

SAMPLE_SUBSCRIPTION_HTML = """
<html><body>
<div id="profile_status">
  <table>
    <tr>
      <td>Inscription</td>
      <td>Jusqu'au 31-12-2024</td>
    </tr>
    <tr>
      <td>Accès Internet</td>
      <td>Jusqu'au 30-06-2024</td>
    </tr>
  </table>
</div>
</body></html>
"""


class TestFetchSubscriptionExpiry:
    @patch("custom_components.mediatheque_veauche.scraper.date", FakeDate)
    def test_finds_earliest_date(self, client):
        mock_resp = type("Response", (), {
            "text": SAMPLE_SUBSCRIPTION_HTML,
            "raise_for_status": lambda self: None,
        })()
        client._session = type("Session", (), {
            "get": lambda self, url, timeout=15: mock_resp,
        })()

        result = client._fetch_subscription_expiry()
        # 30-06-2024 < 31-12-2024, donc c'est la plus proche
        assert result["expiry_date"] == "2024-06-30"
        assert result["expiry_date_display"] == "30 juin 2024"
        assert len(result["subscriptions"]) == 2

    def test_no_profile_status(self, client):
        mock_resp = type("Response", (), {
            "text": "<html><body></body></html>",
            "raise_for_status": lambda self: None,
        })()
        client._session = type("Session", (), {
            "get": lambda self, url, timeout=15: mock_resp,
        })()

        result = client._fetch_subscription_expiry()
        assert result["expiry_date"] is None
        assert result["subscriptions"] == []


# ---------------------------------------------------------------------------
# _borrowings_html initialisation
# ---------------------------------------------------------------------------

class TestInitialization:
    def test_borrowings_html_initialized(self):
        client = MediathequeVeaucheClient("user", "pass")
        assert client._borrowings_html == ""

    def test_fetch_borrowings_on_empty_html(self):
        client = MediathequeVeaucheClient("user", "pass")
        data = client.fetch_borrowings()
        assert data["total"] == 0
        assert data["membres"] == {}
