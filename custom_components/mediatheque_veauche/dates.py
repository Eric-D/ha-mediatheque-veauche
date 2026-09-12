"""Calcul des délais, dans le fuseau de Home Assistant.

Le scraper ne calcule plus `days_left` : il ne connaît que `due_date`, une date
ISO sans fuseau, et n'a pas accès à `hass`. `date.today()` y utilisait le
fuseau du **système hôte** — souvent UTC en conteneur, alors que Home Assistant
est configuré sur Europe/Paris — ce qui décalait tous les délais d'un jour
pendant une partie de la journée : un livre à rendre aujourd'hui s'affichait
« 1j restants » au lieu de « ⚠ Aujourd'hui ».

Le calcul vit donc ici, appelé par le coordinator au moment de **servir** les
données, avec `dt_util.now().date()`. Corollaire utile : les délais sont
recalculés à chaque cycle, y compris sur le repli en cache. Auparavant ils
étaient figés à l'instant du scrape, et une journée d'indisponibilité du
portail affichait des délais faux sans le dire.

Le cache disque garde donc la sortie brute du scraper, sans `days_left` : y
écrire une valeur dérivée la figerait à nouveau.
"""
from __future__ import annotations

import logging
from datetime import date, datetime

_LOGGER = logging.getLogger(__name__)


def days_until(iso_date: str | None, today: date) -> int | None:
    """Nombre de jours d'ici `iso_date`. Négatif si l'échéance est passée.

    Renvoie None si la date est illisible ou absente : 0 signifierait « à
    rendre aujourd'hui », c'est-à-dire une information fausse affichée en
    rouge.
    """
    if not isinstance(iso_date, str):
        return None
    try:
        # strptime naïf à dessein : une date d'échéance est un jour civil, pas
        # un instant. Le fuseau est porté par `today`, que l'appelant tire de
        # la configuration de Home Assistant.
        due = datetime.strptime(iso_date, "%Y-%m-%d").date()  # noqa: DTZ007
    except ValueError:
        _LOGGER.warning("Date d'échéance illisible: %r", iso_date)
        return None
    return (due - today).days


def with_days_left(data: dict, today: date) -> dict:
    """Copie de `data` dont les délais et les compteurs sont recalculés.

    Copie, jamais mutation : `coordinator.data` est comparé aux attributs des
    entités à chaque écriture d'état. Muter en place laisserait l'ancien State
    référencer les mêmes dicts, la comparaison les verrait déjà modifiés,
    aucun `state_changed` ne serait émis, et le passage de minuit
    n'apparaîtrait sur la carte qu'au cycle suivant.
    """
    membres = data.get("membres")
    if not isinstance(membres, dict):
        return data

    dated: dict[str, list[dict]] = {}
    for membre, loans in membres.items():
        if not isinstance(loans, list):
            dated[membre] = loans
            continue
        dated[membre] = [
            {**loan, "days_left": days_until(loan.get("due_date"), today)}
            if isinstance(loan, dict)
            else loan
            for loan in loans
        ]

    all_loans = [
        loan
        for loans in dated.values()
        if isinstance(loans, list)
        for loan in loans
        if isinstance(loan, dict)
    ]
    result = {
        **data,
        "membres": dated,
        "due_this_week": sum(
            1
            for loan in all_loans
            if loan["days_left"] is not None and 0 <= loan["days_left"] <= 7
        ),
        "overdue": sum(
            1 for loan in all_loans if loan["days_left"] is not None and loan["days_left"] < 0
        ),
    }

    subscription = data.get("subscription")
    if isinstance(subscription, dict):
        result["subscription"] = {
            **subscription,
            "days_left": days_until(subscription.get("expiry_date"), today),
        }
    return result
