import { LitElement, html, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { ALL_BADGES, type MediathequeConfig, type HassLike } from './types.js';

const EDITOR_BADGE_LABELS: Record<string, string> = {
  overdue: 'En retard',
  today: "À rendre aujourd'hui",
  urgent: '1 à 3 jours restants',
  soon: '4 à 7 jours restants',
  ok: 'Plus de 7 jours',
  not_extendable: 'Non prolongeable',
  unknown: 'Date illisible',
};

const EDITOR_LABELS: Record<string, string> = {
  entity: 'Entité (sensor)',
  title: 'Titre personnalisé',
  mode: 'Mode',
  badges: 'Filtres par badge',
  total_entity: 'Entité du total (mode "couvertures")',
  card_id: 'Identifiant carte',
  cover_height: 'Hauteur des couvertures (mode "carousel", 56–120 px)',
  hide_ok_badges: 'Masquer les badges au-delà de 7 jours (mode "carousel")',
};

// Constante de module : si l'identité du tableau change à chaque render,
// ha-form se reconstruit entièrement et le champ en cours de saisie perd le
// focus à chaque frappe.
const EDITOR_SCHEMA = [
  {
    name: 'entity',
    required: true,
    selector: { entity: { domain: 'sensor', integration: 'mediatheque_veauche' } },
  },
  { name: 'title', selector: { text: {} } },
  {
    name: 'mode',
    selector: {
      select: {
        mode: 'dropdown',
        options: [
          { value: 'list', label: 'Liste (groupée par membre)' },
          { value: 'covers', label: 'Couvertures (grille à rendre)' },
          { value: 'carousel', label: 'Carousel (bande basse, sans en-tête)' },
        ],
      },
    },
  },
  {
    name: 'badges',
    selector: {
      select: {
        multiple: true,
        options: ALL_BADGES.map((b) => ({
          value: b,
          label: EDITOR_BADGE_LABELS[b] ?? b,
        })),
      },
    },
  },
  {
    name: 'total_entity',
    selector: { entity: { domain: 'sensor', integration: 'mediatheque_veauche' } },
  },
  { name: 'card_id', selector: { text: {} } },
  {
    name: 'cover_height',
    selector: { number: { min: 56, max: 120, step: 1, mode: 'slider' } },
  },
  { name: 'hide_ok_badges', selector: { boolean: {} } },
] as const;

interface ValueChangedEvent extends CustomEvent {
  detail: { value: MediathequeConfig };
}

export class MediathequeCardEditor extends LitElement {
  @property({ attribute: false }) public hass?: HassLike;

  @state() private _config: MediathequeConfig = { entity: '' };

  public setConfig(config: MediathequeConfig): void {
    this._config = config ?? { entity: '' };
  }

  protected override createRenderRoot(): HTMLElement {
    // Light DOM : indispensable pour que ha-form trouve les selectors HA.
    return this;
  }

  protected override render(): TemplateResult {
    if (!this.hass) return html``;

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${EDITOR_SCHEMA}
        .computeLabel=${this._computeLabel}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }

  /** Champ de méthode et non fonction de module : il doit lire le mode
      courant, tout en gardant une identité stable d'un rendu à l'autre. Un
      schéma dynamique — masquer le titre plutôt que l'annoter — reconstruirait
      ha-form à chaque frappe et lui ferait perdre le focus. */
  private _computeLabel = (s: { name: string }): string => {
    const base = EDITOR_LABELS[s.name] ?? s.name;
    if (s.name === 'title' && this._config?.mode === 'carousel') {
      return `${base} (sans effet en mode carousel)`;
    }
    return base;
  };

  private _valueChanged(ev: ValueChangedEvent): void {
    const next = { ...ev.detail.value } as Record<string, unknown>;
    for (const key of Object.keys(next)) {
      // 'entity' n'est jamais supprimée : ha-form émet undefined quand on vide
      // le champ, et une config sans clé 'entity' cassait définitivement la
      // carte (setConfig levait, HA la remplaçait par sa carte d'erreur).
      if (key === 'entity') {
        if (typeof next[key] !== 'string') next[key] = '';
        continue;
      }
      const v = next[key];
      if (v === '' || v === undefined || v === null) delete next[key];
      if (Array.isArray(v) && v.length === 0) delete next[key];
    }
    this.dispatchEvent(
      new CustomEvent('config-changed', {
        detail: { config: next },
        bubbles: true,
        composed: true,
      })
    );
  }
}

if (!customElements.get('mediatheque-card-editor')) {
  customElements.define('mediatheque-card-editor', MediathequeCardEditor);
}
