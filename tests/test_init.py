"""Tests pour __init__.py de l'intégration Médiathèque de Veauche."""
from __future__ import annotations

import pytest
from homeassistant.exceptions import HomeAssistantError, ServiceValidationError

import custom_components.mediatheque_veauche as integration
from custom_components.mediatheque_veauche import (
    _async_extend_loan,
    _loan_entries,
    _mark_loan_extended,
    _owns_loan,
    _select_entry,
)
from custom_components.mediatheque_veauche.coordinator import MediathequeRuntimeData


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


def _runtime(coordinator=None, client=None):
    """runtime_data tel que le pose async_setup_entry, puis sensor.py."""
    return MediathequeRuntimeData(
        client=client if client is not None else object(),
        username="u",
        coordinator=coordinator,
    )


def _account(*urls, coordinator=True):
    """Entrée de configuration factice détenant les prêts donnés."""
    data = {
        "membres": {"Jean": [{"titre": f"Livre {u}", "extend_url": u} for u in urls]}
    }
    return _runtime(_Coordinator(data) if coordinator else None)


class TestOwnsLoan:
    def test_finds_the_loan(self):
        assert _owns_loan(_account("u1", "u2"), "u2")

    def test_absent_loan(self):
        assert not _owns_loan(_account("u1"), "u2")

    def test_no_coordinator_yet(self):
        """Démarrage à froid : le coordinator n'a pas encore de données."""
        assert not _owns_loan(_account("u1", coordinator=False), "u1")

    def test_membres_not_a_dict(self):
        assert not _owns_loan(_runtime(_Coordinator({"membres": None})), "u1")

    def test_loan_not_a_dict(self):
        coordinator = _Coordinator({"membres": {"Jean": ["pas un dict"]}})
        assert not _owns_loan(_runtime(coordinator), "u1")

    @pytest.mark.parametrize("membres", [None, "pasundict", 42, []])
    def test_malformed_membres_does_not_raise(self, membres):
        """Une exception ici interromprait la boucle de _select_entry.

        Un seul compte aux données corrompues empêcherait alors tous les autres
        de prolonger.
        """
        coordinator = _Coordinator({"membres": membres})
        assert not _owns_loan(_runtime(coordinator), "u1")

    def test_loans_not_a_list(self):
        coordinator = _Coordinator({"membres": {"Jean": None}})
        assert not _owns_loan(_runtime(coordinator), "u1")


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


class _LoanEntry:
    """Entrée de configuration dont runtime_data n'existe que s'il a été posé.

    Fidèle sur le point qui compte : Home Assistant déclare `runtime_data` en
    annotation, sans valeur par défaut, donc y accéder avant async_setup_entry
    lève AttributeError — c'est ce qui distingue une entrée configurée d'une
    entrée désactivée, en échec ou déchargée.
    """

    def __init__(self, entry_id, runtime=None):
        self.entry_id = entry_id
        if runtime is not None:
            self.runtime_data = runtime


class _EntryRegistry:
    """Le pan de hass.config_entries qu'interroge _loan_entries."""

    def __init__(self, entries):
        self._entries = entries

    def async_entries(self, domain):
        assert domain == "mediatheque_veauche"
        return list(self._entries)


class _Hass:
    def __init__(self, entries):
        self.config_entries = _EntryRegistry(
            [_LoanEntry(entry_id, runtime) for entry_id, runtime in entries.items()]
        )

    async def async_add_executor_job(self, func, *args):
        return func(*args)


class TestLoanEntries:
    def test_ignores_entries_without_runtime_data(self):
        """Une entrée désactivée ou en échec n'a pas de runtime_data.

        C'est ce qui remplace l'ancien filtrage sur la présence de « client »
        dans hass.data : Home Assistant entretient l'information lui-même.
        """
        hass = _Hass({"abc": _account("u1"), "jamais_chargee": None})

        assert [entry_id for entry_id, _ in _loan_entries(hass)] == ["abc"]

    def test_no_entry_at_all(self):
        assert _loan_entries(_Hass({})) == []


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


def _wired_account(name, *urls, fails=False):
    """runtime_data complet, tel que le posent async_setup_entry puis sensor.py."""
    return MediathequeRuntimeData(
        client=_Client(name, fails=fails),
        username=name,
        coordinator=_RecordingCoordinator(
            {"membres": {name: [{"titre": "Livre", "extend_url": u} for u in urls]}}
        ),
    )


class TestExtendLoanWiring:
    """Le câblage, pas seulement le choix.

    Tester la seule fonction de sélection laissait passer une régression qui
    aurait rebranché l'appel sur la première entrée : les tests seraient restés
    verts alors que le bug d'origine serait revenu.
    """

    @staticmethod
    def _run(coro):
        import asyncio

        # asyncio.run ferme la boucle : new_event_loop() en fuyait une, donc un
        # descripteur epoll, à chaque test.
        return asyncio.run(coro)

    def test_calls_the_owning_client(self):
        a = _wired_account("a", "u1")
        b = _wired_account("b", "u2")
        hass = _Hass({"ea": a, "eb": b})

        self._run(_async_extend_loan(hass, "u2"))

        assert a.client.calls == []
        assert b.client.calls == ["u2"]

    def test_marks_the_owning_coordinator_only(self):
        a = _wired_account("a", "u1")
        b = _wired_account("b", "u2")
        hass = _Hass({"ea": a, "eb": b})

        self._run(_async_extend_loan(hass, "u2"))

        assert a.coordinator.updates == []
        assert len(b.coordinator.updates) == 1
        marked = b.coordinator.updates[0]["membres"]["b"][0]
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
        # Type exact : ServiceValidationError en hérite, et un échec du portail
        # n'est pas une erreur de saisie de l'utilisateur.
        assert type(excinfo.value) is HomeAssistantError
        assert "La prolongation a échoué" in str(excinfo.value)


class _ConfigEntries:
    """Double de hass.config_entries pour le chemin de rechargement.

    async_update_entry renvoie False quand rien ne change — c'est ce retour,
    et lui seul, qui distingue les deux cas que la garde doit couvrir.
    """

    def __init__(self, changed: bool = True):
        self._changed = changed
        self.updates: list[dict] = []
        self.scheduled: list[str] = []

    def async_update_entry(self, entry, **updates):
        self.updates.append(updates)
        if self._changed:
            entry.data = {**entry.data, **updates.get("data", {})}
        return self._changed

    def async_schedule_reload(self, entry_id):
        self.scheduled.append(entry_id)


class _Entry:
    def __init__(self, listeners: int = 1):
        self.entry_id = "e1"
        self.data = {"username": "u", "password": "p"}
        # update_listeners est vide tant que async_setup_entry n'a pas abouti.
        self.update_listeners = [object()] * listeners


class _HassWithEntries:
    def __init__(self, config_entries):
        self.config_entries = config_entries


class TestUpdateEntryAndEnsureReload:
    """Le rechargement doit avoir lieu dans les trois cas, une seule fois.

    C'est le point le plus délicat de la bascule vers le listener : le listener
    n'est appelé que si l'entrée change ET s'il est enregistré. Un test qui se
    contenterait de chercher « async_schedule_reload » dans la source passerait
    au vert sur une garde inversée.
    """

    def test_change_with_listener_leaves_the_reload_to_it(self):
        entries = _ConfigEntries(changed=True)
        entry = _Entry(listeners=1)

        integration.update_entry_and_ensure_reload(
            _HassWithEntries(entries), entry, data={"password": "neuf"}
        )

        assert entries.updates == [{"data": {"password": "neuf"}}]
        # Double rechargement sinon : le listener en programme déjà un.
        assert entries.scheduled == []

    def test_unchanged_entry_is_reloaded_explicitly(self):
        """Reconfiguration rouverte puis resoumise à l'identique.

        Aucun listener n'est notifié ; sans rechargement explicite l'entrée
        resterait en erreur alors que les identifiants viennent d'être validés.
        """
        entries = _ConfigEntries(changed=False)
        entry = _Entry(listeners=1)

        integration.update_entry_and_ensure_reload(
            _HassWithEntries(entries), entry, data={"password": "p"}
        )

        assert entries.scheduled == ["e1"]

    def test_change_without_listener_is_reloaded_explicitly(self):
        """Entrée jamais montée : add_update_listener n'a pas été atteint.

        Entrée désactivée, ou setup interrompu par une migration qui lève. Pas
        une réauthentification : celle-ci part d'un rafraîchissement de fond,
        donc d'une entrée déjà chargée, dont le listener est en place.
        """
        entries = _ConfigEntries(changed=True)
        entry = _Entry(listeners=0)

        integration.update_entry_and_ensure_reload(
            _HassWithEntries(entries), entry, data={"password": "neuf"}
        )

        assert entries.scheduled == ["e1"]


class _Services:
    """Le pan de hass.services qu'utilise async_remove_entry."""

    def __init__(self, registered=True):
        self.registered = registered
        self.removed: list[str] = []

    def has_service(self, domain, service):
        return self.registered

    def async_remove(self, domain, service):
        self.removed.append(service)


class TestRemoveEntry:
    """Le service extend_loan ne doit disparaître qu'avec le dernier compte.

    Et il doit disparaître : la carte propose « Prolonger » tant que le service
    existe, et un clic sur un service orphelin remonte une erreur opaque.
    """

    @staticmethod
    def _run(coro):
        import asyncio

        return asyncio.run(coro)

    def _remove(self, hass, entry_id):
        entry = _LoanEntry(entry_id)
        hass.services = _Services()
        self._run(integration.async_remove_entry(hass, entry))
        return hass.services.removed

    def test_keeps_the_service_while_another_account_remains(self):
        hass = _Hass({"ea": _account("u1"), "eb": _account("u2")})

        assert self._remove(hass, "ea") == []

    def test_removes_the_service_with_the_last_account(self):
        hass = _Hass({"ea": _account("u1")})

        assert self._remove(hass, "ea") == ["extend_loan"]

    def test_the_entry_being_removed_is_still_listed(self):
        """Home Assistant appelle async_remove_entry avant de retirer l'entrée
        de sa collection, et son runtime_data lui survit quand elle n'était pas
        chargée. Sans l'exclusion explicite, le service resterait en place
        jusqu'au redémarrage."""
        hass = _Hass({"ea": _account("u1")})
        assert [entry_id for entry_id, _ in _loan_entries(hass)] == ["ea"]

        assert self._remove(hass, "ea") == ["extend_loan"]

    def test_removing_an_entry_that_never_loaded(self):
        """Compte resté en erreur d'authentification : pas de runtime_data,
        donc absent de _loan_entries, mais le compte valide doit garder son
        service."""
        hass = _Hass({"ea": _account("u1"), "jamais_chargee": None})

        assert self._remove(hass, "jamais_chargee") == []

    def test_service_already_absent_is_not_removed_twice(self):
        hass = _Hass({"ea": _account("u1")})
        entry = _LoanEntry("ea")
        hass.services = _Services(registered=False)

        self._run(integration.async_remove_entry(hass, entry))

        assert hass.services.removed == []
