# Constitution — ha-mediatheque-veauche

Principes directeurs et références techniques du projet. Tout changement doit
respecter ces invariants ; les écarts doivent être justifiés et documentés.

## Périmètre

Intégration Home Assistant + carte Lovelace pour la médiathèque de Veauche
(Joomla + MicroBib). Fournit :

- un sensor agrégeant les emprunts du compte et de la famille ;
- une carte Lovelace custom (`mediatheque-card`) servie par l'intégration ;
- une action (service) `extend_loan` pour prolonger un emprunt.

## Modèle d'inspiration

La carte est alignée sur les patterns de
[`thomasloven/lovelace-card-mod`](https://github.com/thomasloven/lovelace-card-mod) :
LitElement + TypeScript, helpers modulaires, build vers un artefact unique,
double registration safety, events custom pour coordination inter-cards.

## Principes

### P1 — Distribution HACS avec artefact buildé

- L'intégration reste installable via HACS (catégorie *Integration*).
- La carte est buildée vers `custom_components/mediatheque_veauche/www/mediatheque-card.js`
  (artefact unique, minifié, **commité** dans le repo). C'est ce fichier que
  HACS sert et que l'intégration enregistre comme ressource Lovelace.
- Les sources vivent dans `frontend/src/` (TypeScript), le build dans
  `frontend/` produit le bundle. `frontend/dist/` n'est *pas* commité — seul
  l'artefact final dans `custom_components/.../www/` l'est.
- Pas de dépendance runtime externe (CDN, fonts, etc.) — tout doit être
  inliné dans le bundle pour fonctionner offline / WebView Android.
- Le `package.json` du frontend ne déclare que des `devDependencies` (Lit,
  TypeScript, esbuild/Rollup, types HA).

### P2 — Carte Lovelace : LitElement + best practices HA

Référence : <https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card/>

La carte étend **`LitElement`** (pas `HTMLElement` brut) :

```ts
import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
```

Méthodes obligatoires sur l'élément :

- `setConfig(config)` — valide la config et **lève une exception** en cas de
  config invalide. C'est le seul moyen pour l'éditeur HA de signaler l'erreur.
- `set hass(hass)` — setter Lit avec déclenchement de re-render via
  `requestUpdate()` ou via `@property()` sur la propriété. Toujours inclure
  un *guard* d'égalité sur l'entité observée pour éviter le re-render à
  chaque tick global.
- `render()` — retourne un template `html\`\`` ; le rendu déclaratif Lit
  remplace la manipulation manuelle de `innerHTML`.
- `getCardSize()` — taille en unités de 50 px pour le layout *masonry*.
- `getGridOptions()` — `rows`, `columns`, `min_rows`, `min_columns` pour le
  layout *sections* (multiples de 3 conseillés sur 12 colonnes).

Méthodes optionnelles mais **requises** dans ce repo :

- `static getStubConfig()` — config par défaut pour le sélecteur de cartes.
- `static getConfigElement()` — retourne `<mediatheque-card-editor>`,
  l'éditeur visuel basé sur `ha-form`.

Enregistrement (pattern card-mod) :

- `customElements.define('mediatheque-card', MediathequeCard)`.
- `window.customCards.push({ type, name, description })`.
- **Double registration safety** : garde `if (!customElements.get(...))`
  *plus* re-tentative différée après chargement HA pour gérer les *scoped
  registries* et les rechargements WebView Android.

Cycle de vie :

- `connectedCallback` / `disconnectedCallback` (hérités de LitElement)
  doivent être idempotents et nettoyer tous les timers / abonnements
  (`_retryTimer`, listeners, `unsubscribe` de contextes).
- Aucun `setTimeout` long-running ne doit survivre à un détachement.

Conteneur racine :

- Toujours encapsuler le rendu dans `<ha-card>` pour hériter des thèmes HA.
- Variables CSS HA uniquement (`--primary-color`, `--secondary-text-color`,
  `--card-background-color`, `--divider-color`…). Pas de couleur en dur sauf
  pour les badges sémantiques (rouge retard, orange urgent, etc.).
- Styles déclarés via `static styles = css\`…\`` (Shadow DOM scoped) plutôt
  qu'inlinés dans le template.

### P3 — Récupération des données : contextes HA quand disponibles

Référence : <https://developers.home-assistant.io/docs/frontend/data/#available-contexts>

Avec le bundler en place (P1), les contextes HA deviennent utilisables via
`@lit/context` :

```ts
import { consume } from '@lit/context';
import { statesContext } from 'home-assistant-frontend/src/data/context';

@consume({ context: statesContext, subscribe: true })
@state() private _states?: HassEntities;
```

Règles :

- **Quand le contexte existe** (`states`, `entities`, `connection`, `config`,
  `localize`, `themes`…), le consommer plutôt que de dépendre du setter
  `set hass(hass)` global. Bénéfices : abonnement granulaire, pas de
  re-render sur chaque tick.
- **Quand le contexte n'existe pas** ou n'est pas exporté de manière stable
  par `home-assistant-frontend`, garder `set hass(hass)` avec guard
  d'égalité comme fallback.
- Ne jamais conserver de référence à `hass` au-delà du setter — toujours
  utiliser la valeur courante au moment de l'appel.
- Les `unsubscribe` retournés par les contextes doivent être stockés et
  appelés dans `disconnectedCallback`.
- Les appels d'action (`hass.callService`) restent sur l'objet `hass` capturé
  dans le setter (pas de contexte dédié pour les services).

### P4 — Code modulaire (pattern card-mod)

Imitation de `lovelace-card-mod/src/helpers/` :

```
frontend/src/
├── card.ts              # MediathequeCard (LitElement)
├── editor.ts            # MediathequeCardEditor
├── helpers/
│   ├── barcode.ts       # generateCode128Svg
│   ├── days-chip.ts     # getDaysChip
│   ├── escape.ts        # escapeHtml (fallback non-Lit)
│   ├── modal.ts         # bindings modal détail / confirm / barcode
│   └── retry.ts         # _scheduleRetry avec backoff
├── styles/
│   ├── card.ts          # css`…` static styles
│   └── modal.ts
└── types.ts             # types Loan, Member, Config…
```

- Aucun fichier `.ts` ne doit dépasser ~300 lignes ; au-delà, splitter.
- Les helpers sont *purs* (pas d'état module-level mutable).
- Les types métier (`Loan`, `Member`, `MediathequeConfig`) sont définis dans
  `types.ts` et réutilisés partout.

### P5 — Sécurité du rendu

- Avec LitElement, les expressions `${value}` dans `html\`\`` sont
  **automatiquement échappées** — plus besoin d'`escapeHtml` manuel sauf
  pour les rares cas où on construit du SVG en string (code-barres).
- **Interdit** : `unsafeHTML(...)` sur du contenu provenant du sensor.
- Pas d'attributs d'événement inline (`onclick="…"`). Utiliser `@click=${…}`.
- Les URL d'actions (`extend_url`) ne sont jamais transformées en lien
  cliquable direct : elles passent par `mediatheque_veauche.extend_loan`.

### P6 — Robustesse WebView Android

- La carte doit gérer un `state` `unavailable` / `unknown` sans flash : si
  un rendu précédent existe, le conserver et planifier un retry.
- `_scheduleRetry` : *backoff* 2 s × n, plafond 15 s, 10 tentatives max.
- Les modales ouvertes (détail livre, code-barres, confirm) bloquent le
  re-render pour ne pas casser une interaction utilisateur.
- Toute logique de re-render doit aussi survivre à un détachement /
  réattachement (cas du `<ha-card>` qui passe entre dashboards).
- **`render()` ne doit JAMAIS retourner `html\`\`` vide.** HA interprète un
  rendu vide comme une erreur de configuration et affiche le placeholder
  "Erreur de configuration" à la place de la carte. Toujours retourner un
  `<ha-card>` avec un loader / message d'attente quand `_config` ou `_hass`
  ne sont pas encore disponibles.
- Pas d'override `async` de `scheduleUpdate()` / `performUpdate()` Lit. Le
  cycle de vie Lit doit rester synchrone vis-à-vis de HA — un retard du 1er
  render au-delà du timeout interne de Lovelace fait afficher "Erreur de
  configuration".
- Définition de l'élément via `customElements.define` **gardée** par
  `if (!customElements.get(...))` — le décorateur `@customElement` lance une
  exception à la moindre ré-évaluation du script (cycle sleep/wake WebView).

### P7 — Events custom (coordination inter-cards)

Pattern card-mod (`card-mod-update`, `cm_update`) :

- La carte dispatche `mediatheque-card-update` après chaque rendu effectif
  (`bubbles: true, composed: true`) pour permettre à card-mod et autres
  plugins d'observer les changements.
- La carte écoute les events HA standards (`hass-more-info`, etc.) plutôt
  que d'ouvrir ses propres modales quand un équivalent natif existe.

### P8 — Versionning et release

- `MEDIATHEQUE_CARD_VERSION` (constante exportée du bundle) et
  `manifest.json:version` (intégration) **doivent être identiques**.
- Bump en commit dédié `chore: bump version to X.Y.Z`.
- Le commit de release inclut **systématiquement** :
  1. les sources `.ts` modifiées,
  2. l'artefact rebuildé `custom_components/.../www/mediatheque-card.js`,
  3. le bump de version dans les deux endroits.
- Vérifier le bundle avant commit : `cd frontend && npm run build && npm run typecheck`.

## Migration depuis l'état vanilla JS actuel

L'état actuel (un seul `mediatheque-card.js` vanilla) est non conforme à
P1/P2/P4. Plan de migration :

1. Initialiser `frontend/` (package.json, tsconfig, esbuild config).
2. Découper le fichier actuel en modules `src/helpers/*.ts`, `src/card.ts`,
   `src/editor.ts`.
3. Convertir `MediathequeCard extends HTMLElement` →
   `extends LitElement`, remplacer `innerHTML` par `render()`.
4. Activer `@lit/context` sur les données disponibles, garder `set hass`
   en fallback.
5. Mettre en place le script `npm run build` qui produit
   `custom_components/mediatheque_veauche/www/mediatheque-card.js`.
6. Bump `2.4.0` → `3.0.0` (changement majeur du build pipeline, pas de
   changement de comportement utilisateur).

## Références

- Custom card guide : <https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card/>
- Frontend data & contexts : <https://developers.home-assistant.io/docs/frontend/data/#available-contexts>
- card-mod source d'inspiration : <https://github.com/thomasloven/lovelace-card-mod>
- HACS plugin requirements : <https://hacs.xyz/docs/publish/plugin>
- Lit documentation : <https://lit.dev/docs/>
- `@lit/context` : <https://lit.dev/docs/data/context/>
