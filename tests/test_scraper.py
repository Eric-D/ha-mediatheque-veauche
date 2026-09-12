"""Tests pour le scraper de la Médiathèque de Veauche."""
from __future__ import annotations

from datetime import date
from unittest.mock import patch

import pytest
import requests
from bs4 import BeautifulSoup

from custom_components.mediatheque_veauche.scraper import (
    DEFAULT_ACCOUNT_NAME,
    DEFAULT_MEMBER_NAME,
    AuthenticationError,
    InvalidCredentialsError,
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

    def test_invalid_date_returns_none(self):
        """0 signifierait « à rendre aujourd'hui » : une information fausse,
        affichée en rouge. Une date illisible doit rester inconnue."""
        assert MediathequeVeaucheClient._days_until("invalid") is None

    def test_empty_string_returns_none(self):
        assert MediathequeVeaucheClient._days_until("") is None


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

    @patch("custom_components.mediatheque_veauche.scraper.date", FakeDate)
    def test_empty_emprunteur_is_not_attributed_to_account_holder(self, client):
        """Une cellule emprunteur vide ne doit pas gonfler le compte du titulaire."""
        row = _make_row(
            "<td>Un livre</td>"
            "<td>Veauche</td>"
            "<td>   </td>"
            '<td><span class="badge">20-03-2024</span></td>'
            "<td></td>"
        )
        loan = client._parse_loan_row(row, has_emprunteur=True, default_emprunteur="Jean")
        assert loan is not None
        assert loan["emprunteur"] == DEFAULT_MEMBER_NAME

    @patch("custom_components.mediatheque_veauche.scraper.date", FakeDate)
    def test_extend_link_without_href_is_not_extendable(self, client):
        """Un <a> sans href produisait une URL bidon avec le bouton actif."""
        row = _make_row(
            "<td>Un livre</td>"
            "<td>Veauche</td>"
            '<td><span class="badge">20-03-2024</span></td>'
            "<td><a>Prolonger</a></td>"
        )
        loan = client._parse_loan_row(row, has_emprunteur=False, default_emprunteur="Test")
        assert loan is not None
        assert loan["can_extend"] is False
        assert loan["extend_url"] is None

    def test_unreadable_due_date_keeps_days_left_none(self, client):
        row = _make_row(
            "<td>Un livre</td>"
            "<td>Veauche</td>"
            '<td><span class="badge">pas une date</span></td>'
            "<td></td>"
        )
        loan = client._parse_loan_row(row, has_emprunteur=False, default_emprunteur="Test")
        assert loan is not None
        assert loan["days_left"] is None

    def test_empty_row_returns_none(self, client):
        row = _make_row("")
        assert client._parse_loan_row(row, has_emprunteur=False, default_emprunteur="X") is None

    def test_insufficient_cells_returns_none(self, client):
        row = _make_row("<td>Seul</td><td>Deux</td>")
        assert client._parse_loan_row(row, has_emprunteur=False, default_emprunteur="X") is None

    def test_insufficient_cells_with_emprunteur_returns_none(self, client):
        """La borne est à 5 cellules quand la colonne emprunteur est présente."""
        row = _make_row("<td>A</td><td>B</td><td>C</td><td>D</td>")
        assert client._parse_loan_row(row, has_emprunteur=True, default_emprunteur="X") is None

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

        assert data["compte"] == DEFAULT_ACCOUNT_NAME
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
# Discrimination des échecs d'authentification
# ---------------------------------------------------------------------------

class _FakeSession:
    """Session factice pilotée par une file de réponses.

    Volontairement stricte : une requête non prévue échoue explicitement au lieu
    de lever un IndexError opaque, et `requests` permet de vérifier que le
    parcours réellement emprunté est celui qu'on croit.
    """

    def __init__(self, *responses):
        self._queue = list(responses)
        self.requests: list[str] = []
        self.headers: dict[str, str] = {}

    def _next(self, url):
        self.requests.append(url)
        assert self._queue, f"requête non prévue vers {url}"
        return self._queue.pop(0)

    def get(self, url, timeout=15):
        return self._next(url)

    def post(self, url, data=None, timeout=15):
        return self._next(url)


def _response(text="", url="https://mediatheque.veauche.fr/index.php", status=200):
    """Réponse factice fidèle sur raise_for_status.

    Le stuber en no-op laissait un 403 traverser le code de production sans
    rien lever : le test du 403 passait alors sur une AssertionError de la
    session factice, et non par le chemin qu'il prétendait décrire.
    """

    def raise_for_status(self):
        if self.status_code >= 400:
            raise requests.HTTPError(f"{self.status_code} Error", response=self)

    return type("Response", (), {
        "text": text,
        "url": url,
        "status_code": status,
        "raise_for_status": raise_for_status,
    })()


LOGIN_PAGE = (
    "<html><body><form>"
    '<input type="hidden" name="0123456789abcdef0123456789abcdef" value="1">'
    '<input type="password" name="password">'
    "</form></body></html>"
)
BORROWINGS_PAGE = '<html><body><div id="profile_borrowed"><h2>DUPONT Jean</h2></div></body></html>'
LOGIN_URL_AFTER_REDIRECT = (
    "https://mediatheque.veauche.fr/index.php?option=com_users&view=login"
)


class TestAuthenticationErrors:
    """Seuls des identifiants refusés doivent solliciter l'utilisateur.

    Un échec structurel — page modifiée, portail en maintenance, session
    expirée — ressemble à un échec d'identifiants sans en être un. Le coût d'un
    faux positif est élevé : Home Assistant cesse de replanifier ses mises à
    jour tant que l'utilisateur n'a pas répondu, et on lui réclame un mot de
    passe qui fonctionne.
    """

    @staticmethod
    def _install(monkeypatch, session):
        monkeypatch.setattr(
            "custom_components.mediatheque_veauche.scraper.requests.Session",
            lambda: session,
        )

    def test_invalid_credentials_is_an_authentication_error(self):
        """Le code existant attrape AuthenticationError : la hiérarchie doit tenir."""
        assert issubclass(InvalidCredentialsError, AuthenticationError)

    def test_successful_login_keeps_the_borrowings_page(self, client, monkeypatch):
        session = _FakeSession(
            _response(LOGIN_PAGE),
            _response(),
            _response(BORROWINGS_PAGE),
            _response("<html><body></body></html>"),  # page profil, best effort
        )
        self._install(monkeypatch, session)
        client.login()
        assert client._borrowings_html == BORROWINGS_PAGE
        assert len(session.requests) == 4

    def test_login_redirect_means_invalid_credentials(self, client, monkeypatch):
        session = _FakeSession(
            _response(LOGIN_PAGE),
            _response(),
            _response(LOGIN_PAGE, url=LOGIN_URL_AFTER_REDIRECT),
        )
        self._install(monkeypatch, session)
        with pytest.raises(InvalidCredentialsError):
            client.login()
        # La page refusée ne doit pas être conservée comme si elle était valide
        assert client._borrowings_html == ""

    def test_http_401_on_login_means_invalid_credentials(self, client, monkeypatch):
        """401 est un défi d'authentification explicite."""
        session = _FakeSession(_response(LOGIN_PAGE), _response(status=401))
        self._install(monkeypatch, session)
        with pytest.raises(InvalidCredentialsError):
            client.login()

    @pytest.mark.parametrize("status", [403, 429])
    def test_blocking_status_codes_are_not_credentials_problems(
        self, client, monkeypatch, status
    ):
        """403 et 429 viennent d'un pare-feu ou d'une limitation de débit.

        Ce client s'annonce avec un User-Agent non navigateur tout en postant un
        formulaire contenant un mot de passe : exactement ce qui déclenche ces
        protections. Les traiter en refus d'identifiants arrêterait la
        synchronisation et ferait ressaisir en boucle un mot de passe correct.
        """
        session = _FakeSession(_response(LOGIN_PAGE), _response(status=status))
        self._install(monkeypatch, session)
        with pytest.raises(requests.HTTPError):
            client.login()
        # Deux requêtes seulement : le code s'arrête sur l'erreur HTTP et ne
        # poursuit pas vers la page des emprunts.
        assert len(session.requests) == 2

    def test_account_without_loans_is_authenticated(self, client, monkeypatch):
        """Hypothèse porteuse du contrôle, figée ici.

        #profile_borrowed est le bloc d'en-tête qui porte le nom du titulaire,
        pas une section d'emprunts : il est rendu même pour un compte à zéro
        emprunt. Si cette hypothèse tombait, _assert_authenticated rejetterait
        des sessions valides.
        """
        empty_account = (
            '<html><body><div id="profile_borrowed"><h2>DUPONT Jean</h2></div>'
            "</body></html>"
        )
        session = _FakeSession(
            _response(LOGIN_PAGE), _response(), _response(empty_account), _response()
        )
        self._install(monkeypatch, session)
        client.login()
        assert client._borrowings_html == empty_account

    def test_logout_link_alone_proves_authentication(self, client, monkeypatch):
        """Filet pour un gabarit qui embarquerait une modale de connexion partout.

        Sans lui, un compte sans emprunt servi par un tel gabarit passerait pour
        un refus d'identifiants alors que la session est valide.
        """
        page = (
            '<html><body><a href="/index.php?task=user.logout">Déconnexion</a>'
            '<form><input type="password" name="password"></form></body></html>'
        )
        session = _FakeSession(
            _response(LOGIN_PAGE), _response(), _response(page), _response()
        )
        self._install(monkeypatch, session)
        client.login()
        assert client._borrowings_html == page

    def test_login_form_without_redirect_means_invalid_credentials(
        self, client, monkeypatch
    ):
        """Le portail peut servir le formulaire à l'URL demandée, sans rediriger.

        Sans preuve positive d'authentification, ce cas passait pour un succès :
        aucune section trouvée, « 0 emprunt », et ce résultat vide écrasait le
        cache contenant les vrais emprunts.
        """
        session = _FakeSession(
            _response(LOGIN_PAGE),
            _response(),
            _response(LOGIN_PAGE),  # même URL, mais c'est le formulaire
        )
        self._install(monkeypatch, session)
        with pytest.raises(InvalidCredentialsError):
            client.login()

    def test_unrecognisable_page_is_not_a_credentials_problem(
        self, client, monkeypatch
    ):
        """Une refonte du site produit la même absence de sections.

        Réclamer un mot de passe serait ici doublement coûteux : inutile, et
        bloquant tant que l'utilisateur n'a pas répondu.
        """
        session = _FakeSession(
            _response(LOGIN_PAGE),
            _response(),
            _response("<html><body><p>Maintenance en cours</p></body></html>"),
        )
        self._install(monkeypatch, session)
        with pytest.raises(AuthenticationError) as excinfo:
            client.login()
        assert not isinstance(excinfo.value, InvalidCredentialsError)

    def test_missing_csrf_token_is_not_a_credentials_problem(self, client, monkeypatch):
        session = _FakeSession(_response("<html><body>Maintenance</body></html>"))
        self._install(monkeypatch, session)
        with pytest.raises(AuthenticationError) as excinfo:
            client.login()
        assert not isinstance(excinfo.value, InvalidCredentialsError)

    def test_expired_session_on_extend_is_not_a_credentials_problem(self, client):
        """Une session périmée se répare par une reconnexion, pas par l'utilisateur."""
        client._session = _FakeSession(_response(url=LOGIN_URL_AFTER_REDIRECT))
        with pytest.raises(AuthenticationError) as excinfo:
            client.extend_loan("https://mediatheque.veauche.fr/extend/1")
        assert not isinstance(excinfo.value, InvalidCredentialsError)


# ---------------------------------------------------------------------------
# fetch_all — consommateur du days_left à None
# ---------------------------------------------------------------------------

HTML_MIXED_DATES = """
<html><body>
<div id="profile_borrowed"><h2>DUPONT Jean</h2></div>
<div id="user_borrow"><table><tbody>
  <tr><td>En retard</td><td>Veauche</td>
      <td><span class="badge">07-03-2024</span></td><td></td></tr>
  <tr><td>Cette semaine</td><td>Veauche</td>
      <td><span class="badge">15-03-2024</span></td><td></td></tr>
  <tr><td>Date illisible</td><td>Veauche</td>
      <td><span class="badge">jamais</span></td><td></td></tr>
</tbody></table></div>
</body></html>
"""


class TestFetchAll:
    """Les compteurs doivent ignorer days_left=None sans lever.

    C'est ici que vit la conséquence directe du passage de _days_until à None :
    les gardes « is not None » dans due_this_week et overdue. Sans elles,
    `0 <= None` lève un TypeError et tout le cycle de poll tombe.
    """

    @patch("custom_components.mediatheque_veauche.scraper.date", FakeDate)
    def test_counts_ignore_unreadable_dates(self, client_with_lastname):
        c = client_with_lastname
        c._borrowings_html = HTML_MIXED_DATES
        with patch.object(c, "login"), patch.object(
            c, "_fetch_subscription_expiry", return_value={}
        ):
            data = c.fetch_all()

        assert data["total"] == 3
        assert data["overdue"] == 1
        assert data["due_this_week"] == 1
        days = sorted(
            (loan["days_left"] for loans in data["membres"].values() for loan in loans),
            key=lambda d: (d is None, d),
        )
        assert days == [-3, 5, None]


# ---------------------------------------------------------------------------
# extend_loan — détection de session expirée
# ---------------------------------------------------------------------------


class TestExtendLoan:
    @staticmethod
    def _session(url: str):
        resp = type("Response", (), {
            "url": url,
            "status_code": 200,
            "raise_for_status": lambda self: None,
        })()
        return type("Session", (), {"get": lambda self, u, timeout=15: resp})()

    def test_login_redirect_raises(self, client):
        """Un HTTP 200 renvoyant la page de connexion n'est pas un succès."""
        client._session = self._session(
            "https://mediatheque.veauche.fr/index.php?option=com_users&view=login"
        )
        with pytest.raises(AuthenticationError):
            client.extend_loan("https://mediatheque.veauche.fr/extend/1")

    def test_login_redirect_invalidates_session(self, client):
        """Sans invalidation, la tentative suivante rejoue l'échec à l'identique."""
        client._session = self._session(
            "https://mediatheque.veauche.fr/index.php?option=com_users&view=login"
        )
        with pytest.raises(AuthenticationError):
            client.extend_loan("https://mediatheque.veauche.fr/extend/1")
        assert client._session is None

    def test_normal_response_succeeds(self, client):
        client._session = self._session("https://mediatheque.veauche.fr/extend/1")
        client.extend_loan("https://mediatheque.veauche.fr/extend/1")
        assert client._session is not None

    def test_login_in_url_alone_is_not_a_redirect(self, client):
        """Le risque de ce garde-fou est la sur-détection : « login » seul dans
        l'URL ne suffit pas, il faut aussi com_users."""
        client._session = self._session(
            "https://mediatheque.veauche.fr/extend/1?return=login"
        )
        client.extend_loan("https://mediatheque.veauche.fr/extend/1")
        assert client._session is not None


# ---------------------------------------------------------------------------
# _get_book_details — mémorisation
# ---------------------------------------------------------------------------


class TestBookDetailsCache:
    @staticmethod
    def _counting_session(html: str):
        calls = []

        class _Session:
            def get(self, url, timeout=15):
                calls.append(url)
                return type("Response", (), {
                    "text": html,
                    "raise_for_status": lambda self: None,
                })()

        return _Session(), calls

    def test_successful_lookup_is_memoised(self, client):
        html = '<html><body><img src="/images/covers/42.jpg"></body></html>'
        client._session, calls = self._counting_session(html)

        first = client._get_book_details("42")
        second = client._get_book_details("42")

        assert first["cover_url"].endswith("/images/covers/42.jpg")
        assert second == first
        assert len(calls) == 1, "le second appel doit venir du cache"

    def test_empty_result_is_not_memoised(self, client):
        """Un HTTP 200 sans données ne prouve rien : page de maintenance,
        redirection rendue en 200, couverture pas encore indexée."""
        client._session, calls = self._counting_session("<html><body></body></html>")

        client._get_book_details("77")
        client._get_book_details("77")

        assert len(calls) == 2, "un résultat vide ne doit pas être figé"

    def test_cache_returns_a_copy(self, client):
        html = '<html><body><img src="/images/covers/9.jpg"></body></html>'
        client._session, _ = self._counting_session(html)

        first = client._get_book_details("9")
        first["cover_url"] = "muté par l'appelant"

        assert client._get_book_details("9")["cover_url"].endswith("/images/covers/9.jpg")


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
