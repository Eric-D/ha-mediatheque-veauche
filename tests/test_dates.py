"""Calcul des délais à partir d'une date injectée.

Ces tests ne simulent plus `date.today` — ils n'ont plus rien à simuler, la
date du jour étant devenue un paramètre. C'est le bénéfice principal du
déplacement : le patch de `scraper.date` qu'ils utilisaient auparavant
masquait précisément le défaut qu'on corrige ici, puisqu'il donnait au scraper
une date du jour que la production tirait, elle, du fuseau de l'hôte.
"""
from __future__ import annotations

from datetime import date

from custom_components.mediatheque_veauche.dates import days_until, with_days_left

TODAY = date(2024, 3, 10)


class TestDaysUntil:
    def test_future(self):
        assert days_until("2024-03-15", TODAY) == 5

    def test_today_is_zero(self):
        assert days_until("2024-03-10", TODAY) == 0

    def test_overdue_is_negative(self):
        assert days_until("2024-03-07", TODAY) == -3

    def test_across_months(self):
        assert days_until("2024-04-10", TODAY) == 31

    def test_invalid_date_returns_none(self):
        """0 signifierait « à rendre aujourd'hui » : une information fausse,
        affichée en rouge. Une date illisible doit rester inconnue."""
        assert days_until("invalid", TODAY) is None

    def test_empty_string_returns_none(self):
        assert days_until("", TODAY) is None

    def test_missing_date_returns_none(self):
        """Le scraper omet la clé quand la cellule est absente."""
        assert days_until(None, TODAY) is None

    def test_timezone_of_the_caller_decides(self):
        """Le défaut d'origine : à la même seconde, deux fuseaux, deux jours.

        Un conteneur en UTC à 23 h 30 le 9 mars est déjà le 10 à Paris. Le
        livre à rendre le 10 est « aujourd'hui » pour l'utilisateur et
        « demain » pour le système hôte — c'est ce décalage que l'injection de
        la date supprime.
        """
        assert days_until("2024-03-10", date(2024, 3, 9)) == 1
        assert days_until("2024-03-10", date(2024, 3, 10)) == 0


def _data(*due_dates, subscription=None):
    return {
        "membres": {"Jean": [{"titre": f"L{i}", "due_date": d}
                             for i, d in enumerate(due_dates)]},
        "total": len(due_dates),
        **({"subscription": subscription} if subscription is not None else {}),
    }


class TestWithDaysLeft:
    def test_adds_days_left_to_every_loan(self):
        result = with_days_left(_data("2024-03-15", "2024-03-07"), TODAY)
        assert [loan["days_left"] for loan in result["membres"]["Jean"]] == [5, -3]

    def test_counters_are_derived(self):
        result = with_days_left(
            _data("2024-03-07", "2024-03-15", "2024-04-30"), TODAY
        )
        assert result["overdue"] == 1
        assert result["due_this_week"] == 1

    def test_counters_ignore_unreadable_dates(self):
        """Sans la garde « is not None », `0 <= None` lève un TypeError et
        emporte tout le cycle de poll."""
        result = with_days_left(_data("2024-03-07", "2024-03-15", "jamais"), TODAY)
        assert result["overdue"] == 1
        assert result["due_this_week"] == 1
        days = sorted(
            (loan["days_left"] for loan in result["membres"]["Jean"]),
            key=lambda d: (d is None, d),
        )
        assert days == [-3, 5, None]

    def test_due_today_counts_as_due_this_week_and_not_as_overdue(self):
        result = with_days_left(_data("2024-03-10"), TODAY)
        assert result["due_this_week"] == 1
        # La borne basse d'overdue : « à rendre aujourd'hui » n'est pas un
        # retard. Le capteur « Emprunts en retard » afficherait 1 pour un livre
        # encore dans les temps.
        assert result["overdue"] == 0

    def test_seventh_day_is_inside_the_week_and_eighth_is_not(self):
        result = with_days_left(_data("2024-03-17", "2024-03-18"), TODAY)
        assert result["due_this_week"] == 1

    def test_subscription_days_left(self):
        result = with_days_left(
            _data("2024-03-15", subscription={"expiry_date": "2024-06-30"}), TODAY
        )
        assert result["subscription"]["days_left"] == 112

    def test_subscription_without_expiry(self):
        result = with_days_left(
            _data(subscription={"expiry_date": None, "subscriptions": []}), TODAY
        )
        assert result["subscription"]["days_left"] is None
        assert result["subscription"]["subscriptions"] == []

    def test_other_keys_are_preserved(self):
        result = with_days_left(_data("2024-03-15"), TODAY)
        assert result["total"] == 1
        assert result["membres"]["Jean"][0]["titre"] == "L0"

    def test_source_is_never_mutated(self):
        """Muter en place supprimerait le state_changed du passage de minuit.

        L'ancien State de Home Assistant référencerait les mêmes dicts, la
        comparaison d'attributs les verrait déjà modifiés, et le nouveau délai
        n'apparaîtrait sur la carte qu'au cycle suivant.
        """
        source = _data("2024-03-15")
        loan = source["membres"]["Jean"][0]
        result = with_days_left(source, TODAY)

        assert "days_left" not in loan
        assert "due_this_week" not in source
        assert result["membres"]["Jean"][0] is not loan

    def test_subscription_is_never_mutated(self):
        """Sous-objet partagé avec le cache disque : le coordinator écrit la
        sortie brute du scraper sur disque puis la date. Muter ici referait
        persister la valeur dérivée, exactement ce qu'on cherche à éviter."""
        subscription = {"expiry_date": "2024-06-30", "subscriptions": []}
        source = _data("2024-03-15", subscription=subscription)

        result = with_days_left(source, TODAY)

        assert "days_left" not in subscription
        assert result["subscription"] is not subscription

    def test_recomputed_for_a_later_day(self):
        """Le cas que le calcul figé au scrape ne couvrait pas : un cache servi
        après minuit doit vieillir."""
        source = _data("2024-03-15")
        assert with_days_left(source, TODAY)["membres"]["Jean"][0]["days_left"] == 5
        later = with_days_left(source, date(2024, 3, 14))
        assert later["membres"]["Jean"][0]["days_left"] == 1

    def test_payload_without_membres_is_returned_as_is(self):
        """Un cache corrompu ne doit pas faire lever le coordinator."""
        assert with_days_left({"total": 0}, TODAY) == {"total": 0}
