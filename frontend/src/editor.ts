import { LitElement, html, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { ALL_BADGES, type MediathequeConfig, type HassLike } from './types.js';

const EDITOR_BADGE_LABELS: Record<string, string> = {
  overdue: 'En retard',
  today: "À rendre aujourd'hui",
  urgent: '1 à 3 jours restants',
  soon: '4 à 7 jours restants',
  ok: 'Plus de 7 jours',
  not_extendable: 'Déjà prolongé',
};

const EDITOR_LABELS: Record<string, string> = {
  entity: 'Entité (sensor)',
  title: 'Titre personnalisé',
  mode: 'Mode',
  badges: 'Filtres par badge',
  total_entity: 'Entité du total (mode "due")',
  card_id: 'Identifiant carte',
};

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

    const schema = [
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
              { value: 'all', label: 'Tous les emprunts (par membre)' },
              { value: 'due', label: 'À rendre cette semaine' },
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
    ];

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${schema}
        .computeLabel=${(s: { name: string }): string => EDITOR_LABELS[s.name] ?? s.name}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }

  private _valueChanged(ev: ValueChangedEvent): void {
    const next = { ...ev.detail.value } as Record<string, unknown>;
    for (const key of Object.keys(next)) {
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
