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

`frontend/src/card.ts` fait plus de 900 lignes, pour un objectif affiché de
300. Dette
connue, pas invariant respecté. Les candidats évidents à l'extraction sont le
rendu des modales et le bloc d'enregistrement de l'élément.

## Identifiants uniques des entités

Ils dérivent de `entry_id`, **jamais du login** (`migration.py`,
`build_unique_id`). Les faire dépendre du login — ce qui était le cas jusqu'en
septembre 2026 — signifie qu'en changer crée des entités neuves et orpheline les
anciennes : tableau de bord cassé, historique perdu, automatisations muettes.

`migration.py` réécrit les identifiants au format historique et tourne à chaque
démarrage, l'opération étant idempotente. **Ne pas la retirer** : elle ne
s'exécute qu'une fois chez chaque utilisateur, et un utilisateur qui n'aurait
pas encore démarré depuis la mise à jour perdrait son historique.

Les suffixes sont essayés du plus long au plus court — `last_update` avant
`update` — et `tests/test_migration.py` vérifie que tout suffixe utilisé par un
capteur figure bien dans `ENTITY_SUFFIXES`.

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

## Exécuter les tests

```
pip install -r requirements_test.txt
python scripts/manifest_requirements.py
pip install -r manifest-requirements.txt
pytest
```

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
