"""Scraper for Médiathèque de Veauche (Joomla + MicroBib)."""
from __future__ import annotations

import logging
import re
from datetime import date, datetime

import requests
from bs4 import BeautifulSoup

from .const import (
    BASE_URL, BOOK_URL, BORROWINGS_URL, INFOS_USER_URL, LOGIN_URL, PROFILE_EDIT_URL,
)

_LOGGER = logging.getLogger(__name__)

CSRF_PATTERN = re.compile(r'^[a-f0-9]{32}$')
# Une requête par livre, en série : un timeout trop long fait déborder le cycle
# de poll entier quand le site rame.
BOOK_TIMEOUT = 10
DEFAULT_ACCOUNT_NAME = "Compte principal"
DEFAULT_MEMBER_NAME = "Emprunteur inconnu"
MONTHS_FR = [
    "", "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre",
]


class AuthenticationError(Exception):
    """Échec d'authentification, cause indéterminée.

    Couvre notamment les cas structurels — page de connexion qui a changé,
    portail en maintenance, session expirée — qui ressemblent à un échec
    d'identifiants sans en être un. Ils doivent être réessayés, pas remontés à
    l'utilisateur comme « mot de passe invalide ».
    """


class InvalidCredentialsError(AuthenticationError):
    """Les identifiants ont été refusés par le site.

    Seul cas qui justifie de solliciter l'utilisateur : réessayer n'y changera
    rien tant qu'il n'aura pas saisi de nouveaux identifiants.
    """


class MediathequeVeaucheClient:
    """Client to scrape borrowings from the Médiathèque de Veauche."""

    def __init__(self, username: str, password: str) -> None:
        self._username = username
        self._password = password
        self._session: requests.Session | None = None
        self._lastname: str = ""
        self._borrowings_html: str = ""
        # Les détails d'un livre (couverture, ISBN) ne changent jamais : on les
        # mémorise pour ne pas refaire une requête HTTP par livre à chaque cycle.
        self._book_details_cache: dict[str, dict] = {}

    def login(self) -> None:
        """Authenticate against the Joomla site."""
        self._session = requests.Session()
        self._session.headers.update({
            "User-Agent": "HomeAssistant/MediathequeVeauche/1.0",
        })

        # GET the login page to find the CSRF token
        _LOGGER.info("Connexion à la médiathèque pour %s…", self._username)
        resp = self._session.get(LOGIN_URL, timeout=15)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")

        # Find CSRF token: hidden input with 32-char hex name and value "1"
        token_name = None
        for inp in soup.find_all("input", {"type": "hidden"}):
            name = inp.get("name", "")
            value = inp.get("value", "")
            if CSRF_PATTERN.match(name) and value == "1":
                token_name = name
                break

        if not token_name:
            raise AuthenticationError("Could not find CSRF token on login page")

        # POST login
        login_data = {
            "username": self._username,
            "password": self._password,
            "option": "com_users",
            "task": "user.login",
            "return": "",
            token_name: "1",
        }

        resp = self._session.post(LOGIN_URL, data=login_data, timeout=15)
        resp.raise_for_status()

        # Verify login succeeded by checking we can access borrowings
        resp = self._session.get(BORROWINGS_URL, timeout=15)
        resp.raise_for_status()

        if "com_users" in resp.url and "login" in resp.url.lower():
            # Renvoyé vers la page de connexion APRÈS avoir posté les
            # identifiants : ils sont refusés, pas le site indisponible.
            raise InvalidCredentialsError(
                "Identifiants refusés : redirection vers la page de connexion"
            )

        self._borrowings_html = resp.text
        _LOGGER.info("Connexion réussie, page des emprunts récupérée")

        # Fetch lastname from profile edit page
        self._fetch_lastname()

    def _fetch_lastname(self) -> None:
        """Fetch the account holder's last name from the profile edit page."""
        try:
            resp = self._session.get(PROFILE_EDIT_URL, timeout=15)
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "html.parser")
            input_el = soup.find(id="inputLastname")
            if input_el:
                self._lastname = input_el.get("value", "").strip()
                _LOGGER.debug("Fetched lastname: %s", self._lastname)
        except Exception as exc:
            _LOGGER.warning("Impossible de récupérer le nom depuis le profil: %s", exc)

    def _extract_firstname(self, full_name: str) -> str:
        """Extract first name by removing the known lastname.

        Examples (with lastname='DUPONT'):
            'DUPONT Jean' -> 'Jean'
            'DUPONT Marie-Claire' -> 'Marie-Claire'
        """
        name = full_name.strip()
        if not name:
            return name
        if self._lastname:
            # Remove lastname (case-insensitive) and return the rest
            cleaned = re.sub(
                re.escape(self._lastname), "", name, count=1, flags=re.IGNORECASE
            ).strip()
            if cleaned:
                return cleaned
        # Fallback: return last word
        parts = name.split()
        return parts[-1].strip() if parts else name

    def _get_book_details(self, book_id: str) -> dict:
        """Fetch the cover image URL and ISBN for a book."""
        cached = self._book_details_cache.get(book_id)
        if cached is not None:
            return dict(cached)
        result = {"cover_url": None, "isbn": None}
        if not self._session:
            return result
        try:
            resp = self._session.get(f"{BOOK_URL}{book_id}", timeout=BOOK_TIMEOUT)
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "html.parser")
            img = soup.find("img", src=re.compile(r"/images/covers/"))
            if img:
                src = img["src"]
                result["cover_url"] = f"{BASE_URL}{src}" if src.startswith("/") else src
            # ISBN from hidden input
            isbn_input = soup.find("input", id="BW_id_isbn")
            if isbn_input and isbn_input.get("value"):
                result["isbn"] = isbn_input["value"].strip()
            # Mémorisé seulement si on a effectivement trouvé quelque chose.
            # Un HTTP 200 ne prouve rien : page de maintenance, redirection vers
            # le login rendue en 200, couverture pas encore indexée… mémoriser
            # ces réponses figerait un livre sans couverture pour toute la vie
            # du process.
            if result["cover_url"] or result["isbn"]:
                self._book_details_cache[book_id] = dict(result)
        except Exception as exc:
            _LOGGER.warning("Impossible de récupérer les détails du livre %s: %s", book_id, exc)
        return result

    @staticmethod
    def _parse_date(date_str: str) -> str:
        """Parse 'DD-MM-YYYY' to 'YYYY-MM-DD' ISO format."""
        try:
            dt = datetime.strptime(date_str.strip(), "%d-%m-%Y")
            return dt.strftime("%Y-%m-%d")
        except ValueError:
            return date_str

    @staticmethod
    def _format_date_display(iso_date: str) -> str:
        """Format 'YYYY-MM-DD' to 'DD mois YYYY' in French."""
        try:
            dt = datetime.strptime(iso_date, "%Y-%m-%d")
            return f"{dt.day} {MONTHS_FR[dt.month]} {dt.year}"
        except (ValueError, IndexError):
            return iso_date

    @staticmethod
    def _days_until(iso_date: str) -> int | None:
        """Calculate days until the given ISO date. Negative if overdue.

        Renvoie None si la date est illisible : 0 signifierait « à rendre
        aujourd'hui », c'est-à-dire une information fausse affichée en rouge.
        """
        try:
            due = datetime.strptime(iso_date, "%Y-%m-%d").date()
            return (due - date.today()).days
        except ValueError:
            _LOGGER.warning("Date d'échéance illisible: %r", iso_date)
            return None

    def _parse_loan_row(
        self, row, has_emprunteur: bool, default_emprunteur: str
    ) -> dict | None:
        """Parse a single table row into a loan dict."""
        cells = row.find_all("td")
        if not cells:
            return None

        if has_emprunteur and len(cells) < 5:
            return None
        if not has_emprunteur and len(cells) < 4:
            return None

        idx = 0

        # Title + book link
        title_cell = cells[idx]
        idx += 1
        link = title_cell.find("a")
        titre = link.get_text(strip=True) if link else title_cell.get_text(strip=True)
        book_id = None
        if link and "id=" in link.get("href", ""):
            book_id = link["href"].split("id=")[-1].split("&")[0]

        # Site (skip)
        idx += 1

        # Emprunteur (family table only)
        if has_emprunteur:
            emp_cell = cells[idx]
            idx += 1
            emprunteur = self._extract_firstname(emp_cell.get_text(strip=True))
            if not emprunteur:
                # Surtout pas de repli sur le titulaire : le prêt lui serait
                # attribué silencieusement et fausserait son décompte.
                _LOGGER.warning("Emprunteur illisible pour %r", titre)
                emprunteur = DEFAULT_MEMBER_NAME
        else:
            emprunteur = default_emprunteur

        # Due date
        date_cell = cells[idx]
        idx += 1
        badge = date_cell.find("span", class_="badge")
        date_str = badge.get_text(strip=True) if badge else date_cell.get_text(strip=True)
        due_date = self._parse_date(date_str)
        days_left = self._days_until(due_date)

        # Extend
        extend_cell = cells[idx] if idx < len(cells) else None
        can_extend = False
        extended = False
        extend_disabled = False
        extend_url = None
        if extend_cell:
            extend_link = extend_cell.find("a")
            if extend_link:
                classes = extend_link.get("class", [])
                link_text = extend_link.get_text(strip=True).lower()
                if "disabled" in classes or link_text == "atteinte":
                    extended = True
                elif "btn-warning" in classes or link_text == "désactivé":
                    extend_disabled = True
                else:
                    href = extend_link.get("href", "").strip()
                    # Un <a> sans href donnerait une URL bidon (BASE_URL + '/')
                    # sur laquelle le bouton « Prolonger » appellerait le service.
                    if not href:
                        _LOGGER.warning(
                            "Lien de prolongation sans href pour %r, ignoré", titre
                        )
                    else:
                        can_extend = True
                        if href.startswith("http"):
                            extend_url = href
                        elif href.startswith("/"):
                            extend_url = f"{BASE_URL}{href}"
                        else:
                            extend_url = f"{BASE_URL}/{href}"

        # Cover + ISBN
        details = self._get_book_details(book_id) if book_id else {}

        return {
            "titre": titre,
            "book_id": book_id,
            "due_date": due_date,
            "due_date_display": self._format_date_display(due_date),
            "days_left": days_left,
            "can_extend": can_extend,
            "extended": extended,
            "extend_disabled": extend_disabled,
            "extend_url": extend_url,
            "cover_url": details.get("cover_url"),
            "isbn": details.get("isbn"),
            "emprunteur": emprunteur,
        }

    def fetch_borrowings(self) -> dict:
        """Parse the borrowings page and return structured data."""
        soup = BeautifulSoup(self._borrowings_html, "html.parser")

        # Extract account holder name
        profile_section = soup.find(id="profile_borrowed")
        compte = ""
        if profile_section:
            h2 = profile_section.find("h2")
            if h2:
                compte = self._extract_firstname(h2.get_text(strip=True))
        if not compte:
            _LOGGER.warning(
                "Nom du titulaire introuvable sur la page profil, repli sur %r",
                DEFAULT_ACCOUNT_NAME,
            )
            compte = DEFAULT_ACCOUNT_NAME

        membres: dict[str, list[dict]] = {}

        # User's own borrowings
        user_section = soup.find(id="user_borrow")
        if user_section:
            table = user_section.find("table")
            if table:
                rows = table.find("tbody")
                if rows:
                    for row in rows.find_all("tr"):
                        loan = self._parse_loan_row(
                            row, has_emprunteur=False, default_emprunteur=compte
                        )
                        if loan:
                            membres.setdefault(compte, []).append(loan)

        # Family borrowings
        family_section = soup.find(id="family_borrow")
        if family_section:
            table = family_section.find("table")
            if table:
                rows = table.find("tbody")
                if rows:
                    for row in rows.find_all("tr"):
                        loan = self._parse_loan_row(
                            row, has_emprunteur=True, default_emprunteur=compte
                        )
                        if loan:
                            membres.setdefault(loan["emprunteur"], []).append(loan)

        total = sum(len(loans) for loans in membres.values())

        return {
            "compte": compte,
            "membres": membres,
            "total": total,
        }

    def _fetch_subscription_expiry(self) -> dict:
        """Fetch subscription expiry dates from infos-user page."""
        result = {
            "expiry_date": None,
            "expiry_date_display": None,
            "days_left": None,
            "subscriptions": [],
        }
        try:
            resp = self._session.get(INFOS_USER_URL, timeout=15)
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "html.parser")

            profile_status = soup.find(id="profile_status")
            if not profile_status:
                return result

            # Parse "Jusqu'au DD-MM-YYYY" from table cells
            date_pattern = re.compile(r"Jusqu'au\s+(\d{2}-\d{2}-\d{4})")
            latest_date = None

            for td in profile_status.find_all("td"):
                text = td.get_text(strip=True)
                match = date_pattern.search(text)
                if match:
                    _LOGGER.debug("Found subscription date: %s", text)
                    # Get the label from the previous sibling td
                    prev_td = td.find_previous_sibling("td")
                    label = prev_td.get_text(strip=True) if prev_td else ""
                    iso_date = self._parse_date(match.group(1))
                    result["subscriptions"].append({
                        "type": label,
                        "expiry_date": iso_date,
                        "expiry_date_display": self._format_date_display(iso_date),
                    })
                    # Track the earliest expiry date
                    if latest_date is None or iso_date < latest_date:
                        latest_date = iso_date

            if latest_date:
                result["expiry_date"] = latest_date
                result["expiry_date_display"] = self._format_date_display(latest_date)
                result["days_left"] = self._days_until(latest_date)

        except Exception as exc:
            _LOGGER.warning("Impossible de récupérer la date de cotisation: %s", exc)

        return result

    def extend_loan(self, extend_url: str) -> None:
        """Extend a loan by calling the extend URL."""
        if not self._session:
            self.login()
        _LOGGER.info("Prolongation du prêt: %s", extend_url)
        resp = self._session.get(extend_url, timeout=15)
        resp.raise_for_status()
        # La session date du dernier fetch : expirée, le site renvoie la page de
        # login en HTTP 200. Sans ce contrôle on loggue « prolongation
        # effectuée » et la carte bascule en « prolongé » sans que rien ne le
        # soit — exactement le genre d'échec silencieux qu'on traque.
        if "com_users" in resp.url and "login" in resp.url.lower():
            # Session invalidée pour que la prochaine tentative relogue au lieu
            # de rejouer l'échec à l'identique.
            self._session = None
            raise AuthenticationError(
                "Session expirée : la prolongation a été redirigée vers la page de connexion"
            )
        _LOGGER.info("Prolongation effectuée (status %d)", resp.status_code)

    def fetch_all(self) -> dict:
        """Login and fetch all borrowings and subscription info."""
        self.login()
        data = self.fetch_borrowings()

        # Compute due_this_week and overdue counts
        all_loans = [
            loan for loans in data["membres"].values() for loan in loans
        ]
        data["due_this_week"] = sum(
            1
            for loan in all_loans
            if loan.get("days_left") is not None and 0 <= loan["days_left"] <= 7
        )
        data["overdue"] = sum(
            1
            for loan in all_loans
            if loan.get("days_left") is not None and loan["days_left"] < 0
        )

        # Fetch subscription info
        data["subscription"] = self._fetch_subscription_expiry()

        return data
