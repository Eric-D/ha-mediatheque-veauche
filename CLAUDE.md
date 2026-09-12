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
