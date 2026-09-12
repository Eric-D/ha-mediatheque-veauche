# Notes pour les contributeurs (humains et agents)

## Comment la carte est chargée — ne pas revenir en arrière

**La carte est déclarée comme ressource Lovelace, et uniquement comme ça.**
`add_extra_js_url()` ne doit être appelé qu'en dernier recours, quand la
collection de ressources est indisponible (mode YAML).

Ce point a été rétabli en septembre 2026 après un diagnostic long. Une version
antérieure chargeait la carte via `add_extra_js_url()` seul, ce qui produisait
un « Erreur de configuration » intermittent, plus fréquent sur réseau lent, et
impossible à reproduire à la demande.

### Pourquoi

Home Assistant charge `@webcomponents/scoped-custom-element-registry`. Ce
polyfill **remplace** `window.customElements` :

```js
Object.defineProperty(window, 'customElements', {
  value: new CustomElementRegistry(), configurable: true, writable: true });
...
get(tagName) { return this._definitionsByTag.get(tagName)?.elementClass; }
```

Son `get()` ne consulte que sa propre table. `nativeGet` est capturé au
démarrage mais **jamais interrogé**. Toute définition faite avant son
installation lui est donc invisible, définitivement.

`add_extra_js_url()` injecte le script dans le document : il peut être évalué
*avant* le polyfill. La définition atterrit alors dans le registre natif, HA
appelle `customElements.get()` → rien → « Custom element doesn't exist », et
son rattrapage par `whenDefined()` est mort-né pour la même raison.

Les ressources Lovelace sont chargées par le panneau (`ha-panel-lovelace`),
donc toujours **après** le polyfill. C'est exactement pourquoi les cartes
distribuées en ressource (auto-entities, card-mod, mushroom…) ne rencontrent
jamais ce problème.

### Symptôme caractéristique

Sur un chargement en échec, dans la console :

```
customElements.get('mediatheque-card')               → undefined
document.createElement('mediatheque-card').setConfig  → "function"
```

Les deux ne peuvent diverger que s'il existe deux registres.

### Contre-intuitif

C'est le chargement le **plus rapide** qui échoue : le polyfill s'installe aux
alentours de 110–130 ms, et arriver avant lui est précisément ce qui casse.

### Ce que dit la documentation

La page officielle sur les cartes personnalisées ne décrit **que** le mécanisme
des ressources de tableau de bord, et ne mentionne ni `add_extra_js_url` ni
`extra_module_url` :
https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card/

`add_extra_js_url` est un helper interne du composant `frontend`, pas le chemin
prévu pour livrer une carte.

## Invariants de la carte

Repris de `.specify/memory/constitution.md`, supprimé en septembre 2026 : deux
de ses principes étaient factuellement faux et avaient produit un correctif
nuisible, plusieurs autres décrivaient un code qui n'existait plus. Ne sont
conservés ici que des invariants vérifiés contre le code, avec leur ancre.

### Écarts délibérés au contrat des cartes personnalisées

Ces trois-là ressemblent à des oublis. Ne pas les « corriger ».

- **`setConfig()` ne lève pas pour une entité absente ou vide**
  (`card.ts`, `setConfig`). La convention Home Assistant veut qu'elle lève ; ici ça
  rendait la carte irrécupérable depuis l'interface. `ha-form` émet
  `entity: undefined` quand on vide le champ ; l'éditeur la recoerce en `''`
  (`editor.ts`, `_valueChanged`) et `setConfig` tolère en second rempart. Les deux sont
  nécessaires : retirer l'un en croyant l'autre suffisant restaure la panne.
  Seule une configuration non-objet lève encore (même fonction, première garde).
- **Pas de garde d'égalité dans le setter `hass`** (`card.ts`, setter `hass`). Une telle
  garde n'est pas seulement inutile, elle est **nuisible** : un early-return
  sauterait `_syncEntityStates()` et laisserait `_totalEntityState` vide au
  premier rendu, donc pas de `card_id`, donc pas de bouton code-barres avant un
  second tick. Elle serait de surcroît sans effet, `requestUpdate()` filtrant
  déjà par `notEqual` sur l'ancienne valeur. Le filtrage des re-rendus vit dans
  `shouldUpdate()` (`card.ts`, `shouldUpdate`), qui doit conserver deux cas non
  évidents : une modale ouverte bloque les rafraîchissements venus de `hass`
  pour ne pas casser l'interaction, et `_config` doit toujours passer car il
  peut arriver dans le même lot qu'un `hass` dont les états n'ont pas bougé.
- **Pas de `performUpdate()` synchrone dans `connectedCallback`**
  (`card.ts`, `connectedCallback`). Il y en a eu un (`84a32e8`), ajouté contre une cause
  inventée — « HA interprète un rendu vide comme une erreur de configuration »,
  mécanisme qui n'existe pas. Il faisait rendre la carte de façon ré-entrante
  dans le commit Lit de Home Assistant. Son retrait a rendu les changements de
  page nettement plus rapides, d'après l'utilisateur ; aucune mesure n'est
  conservée dans le dépôt.

### Ce qui doit rester vrai

- **Aucune dépendance externe dans le bundle** (`frontend/package.json` : que
  des `devDependencies`). Pas de CDN, pas de police distante, tout est inliné —
  la carte doit fonctionner en WebView Android. À ne pas confondre avec « aucun
  accès réseau » : les couvertures sont chargées depuis le site de la
  médiathèque et retombent sur une data-URI en cas d'échec (`card.ts`, gestionnaire `@error` des `<img>`).
- **Jamais `unsafeHTML` sur du contenu venant du capteur.** Il n'y en a aucun.
  Le seul `unsafeSVG` (`card.ts`, `_renderBarcodeModal`) reçoit la sortie de `generateCode39Svg`,
  dont l'entrée vient pourtant bien du capteur : `cardId` est calculé dans les
  deux modes de rendu, `_renderList` — le mode par défaut — et `_renderCovers`. Ce qui rend
  l'ensemble sûr tient à **une seule ligne** : `helpers/barcode.ts` filtre, dans `generateCode39Svg`, par table
  blanche, et tout ce qui atteint la chaîne SVG ensuite est un entier calculé.
  C'est cette ligne qu'une refactorisation cassera sans s'en apercevoir.
- **`extend_url` n'est jamais un lien cliquable.** Elle passe par le service
  `mediatheque_veauche.extend_loan` (`card.ts`, `_confirmExtendNow`), qui vérifie à quel compte
  elle appartient (`__init__.py`, `_owns_loan` et `_select_entry`).
- **`render()` retourne toujours un `<ha-card>` visible**, loader compris. Pas
  parce que Home Assistant inspecterait le shadow root — il ne le fait pas —
  mais parce qu'un rendu vide ne donne à l'utilisateur aucune information.
- **Le dernier rendu n'est conservé que tant qu'il reste des retries**, sur
  **les deux** chemins d'indisponibilité (`card.ts`, `_render` : branche `!states` et branche entité indisponible).
  Au-delà, message explicite : afficher indéfiniment des emprunts périmés sans
  aucun indice est le comportement qu'on cherche à éviter. Le budget vaut
  environ 100 s d'indisponibilité continue (`helpers/retry.ts` : dix essais,
  `2000 × n` plafonné à 15 000), mais il est remis à zéro à chaque
  reconnexion de l'élément (`connectedCallback` appelle `_retry.reset()`) — changement de vue, déplacement
  entre sections.
- **`customElements.define` reste gardé** par `if (!customElements.get(...))`
  (fin de module de `card.ts`, deux fois, et de `editor.ts`) : sur WebView Android le script peut
  être ré-évalué au retour de veille.
- **`window.customCards.push`** (fin de module de `card.ts`) : nécessaire au sélecteur
  de cartes. Rien en CI ne détecterait sa suppression.
- **L'événement `mediatheque-card-update`** est émis après chaque rendu effectif
  (`card.ts`, `updated`). C'est un contrat public pour les plugins tiers — card-mod
  notamment — sans aucun consommateur dans ce dépôt : personne ne verra sa
  disparition.
- **Aucun timer lié à un élément ne survit à son détachement.**
  `disconnectedCallback` annule le retry en cours, `connectedCallback` remet le
  quota à zéro. La portée est volontairement étroite : la fin de module installe
  sept `setTimeout` pour la réparation des cartes d'erreur orphelines, qui ne
  dépendent d'aucun élément et ne sont annulés par rien — légitime, ils sont à
  usage unique et plafonnés à quatre secondes.

`frontend/src/card.ts` fait environ 790 lignes, pour un objectif affiché de 300.
Les rendus purement présentatifs vivent dans `renders/` : ils ne touchent pas à
l'état de la carte et reçoivent leurs gestionnaires en paramètres. Ce qui reste
est le cycle de vie Lit, la validation de configuration, le choix des données à
afficher, et le bloc d'enregistrement de l'élément.

**Ne pas extraire le bloc d'enregistrement** sans très bonne raison : c'est le
code le plus débogué du fichier, et aucun test frontend ne rattraperait une
erreur.

Les signatures à plusieurs paramètres de même type passent par un objet nommé
(`renderHeader({ title, badgeText, … })`). Deux chaînes adjacentes dans une
signature positionnelle s'inversent sans que le typage ni le linter ne disent
rien, et sans test frontend personne ne le verrait.

## Identifiants uniques des entités

Ils dérivent de `entry_id`, **jamais du login** (`migration.py`,
`build_unique_id`). Les faire dépendre du login — ce qui était le cas jusqu'en
septembre 2026 — signifie qu'en changer crée des entités neuves et orpheline les
anciennes : tableau de bord cassé, historique perdu, automatisations muettes.

`migration.py` réécrit les identifiants au format historique et tourne à chaque
démarrage, l'opération étant idempotente. **Ne pas la retirer**, et **ne jamais
retirer d'entrée d'`ENTITY_SUFFIXES`** : elle ne s'exécute qu'une fois chez
chaque utilisateur, et un utilisateur qui n'a pas encore démarré depuis la mise
à jour a encore des entités sous ces noms.

La correspondance est **exacte sur le login courant**, jamais heuristique sur le
suffixe. Un utilisateur ayant déjà changé de login a deux jeux d'entités dans la
même entrée : les orphelines de l'ancien login, enregistrées en premier, et
celles du login courant qui portent l'historique. Une correspondance par suffixe
migrerait l'orpheline d'abord, lui ferait capter le nouvel identifiant, puis
lèverait sur la vivante — laissant la plateforme sensor morte à chaque
démarrage. Une garde de collision couvre le cas résiduel : une migration qui
échoue proprement laisse ses capteurs à l'utilisateur.

La migration tourne dans `__init__.async_setup_entry`, **pas** dans la
plateforme : une exception y serait avalée par `entity_platform`, laissant
l'entrée affichée « chargée » avec zéro capteur et sans réessai. Elle est aussi
appelée par `config_flow` **avant** d'écrire un nouveau login, pendant que
l'entrée porte encore l'ancien — sans quoi une entrée désactivée, jamais
configurée donc jamais migrée, verrait la correspondance ne plus rien trouver.

### Un résidu assumé, à ne pas « corriger »

Les deux registres n'ont pas le même délai d'écriture : une seconde pour les
entrées de configuration, dix pour le registre d'entités. Un arrêt **brutal**
— coupure, OOM, `docker kill` — dans cette fenêtre, juste après une
reconfiguration qui change le login, laisse sur disque le nouveau login et les
anciens identifiants. La correspondance ne trouve alors plus rien. Un arrêt
propre n'a pas ce problème, Home Assistant écrivant les sauvegardes différées
sur `EVENT_HOMEASSISTANT_FINAL_WRITE`.

**Ne pas chercher à fermer ce trou en mémorisant le login précédent.** Ce
remède rouvre le défaut qu'on vient de corriger : un utilisateur ayant déjà
changé de login sous l'ancien code a deux jeux d'entités, la migration
reprendrait l'orpheline en premier, lui ferait capter l'identifiant, et
abandonnerait la vivante. Le remède est plus probable que le mal — il se
déclenche sans crash, la fenêtre ne s'ouvre qu'avec.

## Où vit la logique testable

`sensor.py` **n'est pas importable** sous les mocks de `tests/conftest.py` :
`class _MediathequeBase(CoordinatorEntity, SensorEntity)` lève un conflit de
métaclasse quand les deux bases sont des MagicMock. Tout ce qui y vit est donc
hors de portée des tests, et la suite reste verte quoi qu'on y casse.

C'est pourquoi la logique en est sortie :

- `coordinator.py` — obtention et mise en cache des données
  (`MediathequeDataSource.async_update`, `async_load_cache`,
  `is_valid_payload`). C'était une closure de `async_setup_entry`.
- `_async_extend_loan` dans `__init__.py`, sorti de sa closure pour la même
  raison.

`dates.py` est sorti pour un autre motif — le scraper n'a pas accès à `hass`,
cf. la section sur le fuseau horaire — mais bénéficie de la même propriété.

**Ne pas y remettre de logique**, et ne rien réintroduire dans une closure de
`async_setup_entry` : ce qui y entre devient invisible aux tests sans que rien
ne le signale. `sensor.py` ne doit garder que les classes d'entités et le
câblage. Même contrainte pour `config_flow.py`, non importable parce qu'il
dérive de `ConfigFlow`.

## Délais et fuseau horaire

`days_left`, `due_this_week` et `overdue` ne sont **pas** produits par le
scraper : ils sont dérivés de `due_date` par `dates.with_days_left`, appelé par
le coordinator au moment de **servir** les données, avec
`dt_util.now().date()`.

Le scraper n'a pas accès à `hass` et utilisait `date.today()`, donc le fuseau
du **système hôte** — souvent UTC en conteneur, alors que Home Assistant est
configuré sur Europe/Paris. Tous les délais étaient décalés d'un jour pendant
une partie de la journée : un livre à rendre aujourd'hui s'affichait
« 1j restants » au lieu de « ⚠ Aujourd'hui ». Pas seulement un libellé : le
`type` du chip pilote le filtre de la carte (`card.ts`, `_isEnabled`), donc une
carte configurée sur `today` ne montrait pas le livre du jour.

Deux conséquences à ne pas défaire :

- **Le cache disque garde la sortie brute du scraper**, sans `days_left`. Y
  écrire une valeur dérivée la figerait à la date du scrape, ce qui était le
  second défaut : une journée d'indisponibilité du portail servait des délais
  faux sans le dire. Les trois chemins qui servent des données — fetch réussi,
  repli sur cache, pré-remplissage au démarrage — passent tous par
  `with_days_left`.
- **`with_days_left` renvoie une copie.** Muter en place laisserait l'ancien
  `State` référencer les mêmes dicts, aucun `state_changed` ne serait émis au
  passage de minuit, et la carte afficherait le délai de la veille jusqu'au
  cycle suivant. Même raison que `_mark_loan_extended`.

La règle `DTZ` de ruff verrouille le tout. Ses exemptions sont marquées
`# noqa: DTZ007` et portent toutes sur des dates civiles — une échéance est un
jour, pas un instant.

## Données d'exécution

Le client, le login et le coordinator vivent dans `entry.runtime_data`
(`coordinator.MediathequeRuntimeData`), **pas** dans
`hass.data[DOMAIN][entry_id]`. C'est ce que Home Assistant prévoit depuis
2024.6, et ça supprime deux servitudes qu'on entretenait à la main :

- le déchargement n'a plus rien à vider — Home Assistant supprime
  `runtime_data` lui-même, mais **seulement si le déchargement réussit** ;
- une entrée jamais chargée n'apparaît plus dans `_loan_entries`, puisqu'elle
  n'a pas de `runtime_data`. Auparavant son client restait dans le
  dictionnaire global jusqu'au redémarrage, ce qui suffisait à empêcher le
  retrait du service `extend_loan` le jour où le dernier vrai compte était
  supprimé.

**`async_remove_entry` doit exclure l'entrée en cours de suppression**, et
c'est contre-intuitif : Home Assistant l'appelle **avant** de la retirer de sa
collection (`config_entries.py`, `async_remove` : `entry.async_remove()` puis
`del self._entries[...]`), et son `runtime_data` lui survit quand elle n'était
pas chargée, `async_unload` sortant avant pour tout état autre que `LOADED`.
Sans cette exclusion, supprimer le dernier compte laisse le service en place.
Couvert par `tests/test_init.py::TestRemoveEntry`.

Le plancher tient : `runtime_data` et `ConfigEntry[T]` existent en 2024.11.

## Rechargement de l'entrée de configuration

Un seul endroit recharge : le listener `async_update_options`
(`__init__.py`). Home Assistant déprécie `async_update_reload_and_abort` pour
une intégration qui enregistre un listener de mise à jour — c'est au listener
de s'en charger — avec une **casse annoncée en 2026.12**.

Les flux de reconfiguration et de ré-authentification passent donc par
`update_entry_and_ensure_reload` (`__init__.py`), qui appelle
`async_update_entry` puis programme le rechargement lui-même dans les deux cas
où **aucun listener n'est appelé** :

- l'entrée n'a pas changé — reconfiguration rouverte puis resoumise à
  l'identique — `async_update_entry` renvoyant alors `False` sans rien
  notifier ;
- aucun listener n'est enregistré : entrée désactivée, ou `async_setup_entry`
  interrompu avant `add_update_listener`. **Ce n'est pas le cas d'une
  ré-authentification** : le seul `ConfigEntryAuthFailed` du dépôt est levé
  dans le rafraîchissement du coordinator (`sensor.py`), lancé en tâche de
  fond après le setup, donc avec `raise_on_auth_failed=False` — Home Assistant
  appelle `async_start_reauth` sans changer l'état de l'entrée, qui reste
  `LOADED` avec son listener. La réauth passe donc par la première branche
  quand le mot de passe est ressaisi à l'identique, et par le listener sinon.

Sans ce rechargement explicite, l'entrée resterait en erreur alors que les
identifiants viennent d'être validés.

Le helper vit dans `__init__.py`, et non dans le flux : `config_flow.py`
n'est pas importable sous les mocks de `tests/conftest.py` — il dérive de
`ConfigFlow` — donc un helper qui y resterait ne serait couvert que par
analyse de source, ce qui avait déjà donné un test vert sur une garde
inversée. Voir `tests/test_init.py::TestUpdateEntryAndEnsureReload`.

Le listener a été conditionné aux options pendant un temps, pour éviter un
double rechargement. **Ne pas rétablir cette condition** : elle rendrait une
reconfiguration sans effet, puisqu'elle ne touche que les données.

## Traductions

`strings.json` n'est **jamais lu à l'exécution** pour une intégration
personnalisée : Home Assistant ne charge que `translations/<langue>.json`, avec
repli sur `en`. Une clé présente dans le seul `strings.json` s'affiche donc en
clé brute à l'utilisateur.

`en.json` n'est pas optionnel : `en` est la langue de **repli** de Home
Assistant, donc ce que voit tout utilisateur non francophone. Les raisons
d'abandon `reconfigure_successful` et `reauth_successful` sont produites par nos
propres `async_abort` et se résolvent donc dans notre domaine. Sur les versions
récentes, `async_update_reload_and_abort` les ferait résoudre par le cœur en
passant `translation_domain` — mais ni ce passage ni le paramètre lui-même
n'existent en 2024.11, le plancher déclaré : là-bas ces clés n'étaient pas
mieux traduites avant la bascule qu'après. `translation_domain` n'est donc pas
une alternative à ce fichier, sur aucune version supportée.

`tests/test_translations.py` croise le flux et **tous** les fichiers de
traduction ; ne pas le restreindre à `strings.json`.

## Méthode de diagnostic

Le chemin nominal de la carte est instrumenté à dessein (`setConfig accepté`,
`premier rendu effectué`, horodatages). **Ne pas retirer ces logs** : sans eux,
« aucun log » est ambigu entre « HA n'a jamais utilisé notre élément » et « tout
s'est bien passé », et c'est ce raisonnement faux qui a fait perdre le plus de
temps.

Pour extraire la configuration réelle d'une carte d'erreur, depuis la console :

```js
(function w(n){if(!n)return;if(String(n.localName).startsWith('hui-error'))console.log('>>>',JSON.stringify(n._config??n.config));[...(n.shadowRoot?.children??[]),...(n.children??[])].forEach(w)})(document.body)
```

## Build

Le bundle `custom_components/mediatheque_veauche/www/mediatheque-card.js` est
commité et la CI vérifie qu'il correspond aux sources. Après toute modification
de `frontend/src/`, lancer `cd frontend && npm run build` avant de commiter.

Les versions sont mises à jour automatiquement par le workflow de release à
partir du tag, dans **six** fichiers : `manifest.json`, `CARD_VERSION` de
`__init__.py`, `frontend/src/version.ts`, `frontend/package.json`,
`frontend/package-lock.json`, et le bundle reconstruit. Ne pas les bumper à la
main. `tests/test_manifest.py` vérifie qu'ils restent synchronisés — une
substitution qui ne matche plus échoue silencieusement, et sur `CARD_VERSION`
ça ferait resservir un bundle périmé derrière un cache-buster frais.

## Linters

`ruff check .` — configuré dans `pyproject.toml`,
exécuté en CI. Longueur de ligne à 100 et non aux 88 de Home Assistant core :
le code a été écrit sans linter, aucune ligne ne dépasse cette valeur, et
reformater une trentaine de lignes dans la PR qui introduit l'outil aurait noyé
les vraies corrections.

`npm test` côté carte — le runner intégré de Node, sans vitest ni jest. Les
fonctions de `renders/` sont rendues dans un vrai DOM (`happy-dom`) puis
interrogées, plutôt qu'inspectées via les `strings` et `values` du
`TemplateResult` : un `@click` ne se distingue d'un autre qu'en le déclenchant.
C'est ce qui permet de voir ce que ni `tsc` ni oxlint ne voient — deux
paramètres de même type inversés, un gestionnaire branché sur le mauvais
élément.

**Les helpers comptent au moins autant que les rendus.** Une erreur dans
`renders/` se voit à l'œil au premier chargement ; `barcode.ts`, `days-chip.ts`
et `retry.ts` échouent en silence — un code-barres que le scanner refuse à la
banque de prêt, un emprunt filtré hors de la liste parce qu'un seuil a bougé,
un budget de réessai épuisé trop tôt. Ce sont aussi les seuls à se tester sans
DOM.

Trois contraintes du harnais, dans `test/_setup.ts`, à ne pas défaire :

- le DOM est installé par `--import ./test/_setup.ts` et non par un import dans
  les fichiers de test : leurs imports statiques sont évalués avant leur corps,
  donc Lit se chargerait avant que `HTMLElement` existe ;
- `--conditions=browser` est nécessaire, sans quoi Node résout l'export
  « node » de Lit, qui suppose un rendu serveur et lève à l'import ;
- les globales de la famille `Event` viennent de happy-dom et **remplacent**
  celles de Node, qui refuse les siennes (« parameter 1 is not of type
  Event »). La règle porte sur toute la famille, pas sur une liste de noms.

Un crochet de résolution réécrit les imports `./x.js` des sources en `./x.ts`.
Le `.js` est une **convention du dépôt** — `moduleResolution` vaut `Bundler`,
qui n'impose rien, et esbuild comme tsc accepteraient l'import sans extension —
mais le dépouillement de types de Node, lui, ne sait pas la suivre. Le crochet
est limité aux fichiers du dépôt : ailleurs, un `.ts` voisin n'existe pas et la
résolution normale doit suivre son cours.

`card.ts` reste hors d'atteinte de ce runner : il utilise des décorateurs, que
le dépouillement de types de Node refuse. `--experimental-transform-types`, déjà
activé pour les propriétés de constructeur de `retry.ts`, ne suffit pas. Ne pas
y perdre de temps sans changer d'outillage.

`npm run lint` côté TypeScript — **oxlint**, pas ESLint. `typescript-eslint`
déclare une plage de pairs `>=4.8.4 <6.1.0` et ne supporte donc pas TypeScript 7,
adopté ici : l'installer demanderait `--force`, donc un outillage dont on ne
pourrait pas croire les résultats sur une syntaxe qu'il ne parse pas. oxlint a
son propre parser et aucune dépendance de pair sur TypeScript.

Il tourne sur son ruleset `correctness` par défaut, zéro constat. Ne pas élargir
à `suspicious` ou `pedantic` sans réfléchir : `no-underscore-dangle` y produit
une trentaine de faux positifs sur la convention `_private` des cartes Lovelace,
et `unicorn(no-array-sort)` en signale trois autres sur des tris qui portent
déjà sur des copies.

## Exécuter les tests

```
pip install -r requirements_test.txt
python scripts/manifest_requirements.py
pip install -r manifest-requirements.txt
pytest
ruff check .
(cd frontend && npm ci && npm run typecheck && npm run lint && npm test && npm run build)
git diff --exit-code --stat custom_components/mediatheque_veauche/www/mediatheque-card.js
```

Ce bloc reproduit les vérifications de la CI, et `tests/test_documentation.py`
compare les deux pour qu'ils ne divergent pas — découvrir l'écart en poussant
est le genre de friction que ce dépôt s'efforce de supprimer partout ailleurs.

Le sous-shell est volontaire : sans lui, un build en échec laisserait le shell
dans `frontend/`, et la ligne suivante échouerait à son tour sur un chemin
introuvable — en masquant le vrai problème.

Cette dernière ligne est celle qu'on oublie le plus souvent : le bundle commité
doit correspondre au build, et la CI échoue sinon. `--exit-code --stat` plutôt
que `--quiet`, qui sort en 1 sans rien afficher.

Les deux commandes du milieu sont nécessaires : les dépendances runtime
(`beautifulsoup4`, `requests`) ne sont pas recopiées dans
`requirements_test.txt`, elles viennent du manifeste, qui en est l'unique
source de vérité. Home Assistant n'est pas installé — `tests/conftest.py` le
simule. Le job `import-check` de la CI l'installe, lui, pour de vrai.

## Version minimale de Home Assistant

`2024.11.0`, déclarée dans `hacs.json`. Déterminée par les API réellement
utilisées, vérifiées contre les sources de Home Assistant :

- `async_register_static_paths` et `StaticPathConfig` → 2024.7 (absents de
  2024.6.0) ;
- `getGridOptions()` de la carte → frontend `20241106.0`, soit **2024.11**.

Avant d'utiliser une nouvelle API de Home Assistant ou de son frontend,
vérifier le tag qui l'introduit et relever ce plancher si besoin.
`tests/test_manifest.py` n'est qu'un cliquet : il empêche de l'abaisser, il ne
peut pas détecter qu'une API récente exige davantage.
