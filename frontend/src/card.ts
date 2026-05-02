import { LitElement, html, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { classMap } from 'lit/directives/class-map.js';

import {
  ALL_BADGES,
  ALL_MODES,
  MODE_ALIASES,
  type AllAttributes,
  type BadgeType,
  type CardMode,
  type DueAttributes,
  type HassEntityState,
  type HassLike,
  type Loan,
  type MediathequeConfig,
  type MembersMap,
} from './types.js';
import { getDaysChip } from './helpers/days-chip.js';
import { generateCode39Svg } from './helpers/barcode.js';
import { RetryScheduler } from './helpers/retry.js';
import { logBanner, mcLog } from './version.js';
import { cardStyles } from './styles/card.js';
import { modalStyles } from './styles/modal.js';

import './editor.js';

const PLACEHOLDER_SVG =
  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2252%22 height=%2276%22 viewBox=%220 0 52 76%22%3E%3Crect width=%2252%22 height=%2276%22 fill=%22%23e0e0e0%22 rx=%224%22/%3E%3Ctext x=%2226%22 y=%2242%22 text-anchor=%22middle%22 font-family=%22sans-serif%22 font-size=%2220%22 fill=%22%239e9e9e%22%3E%F0%9F%93%96%3C/text%3E%3C/svg%3E';

interface GridOptions {
  columns: number;
  min_columns: number;
  rows: number;
  min_rows: number;
}

export class MediathequeCard extends LitElement {
  static override styles = [cardStyles, modalStyles];

  @property({ attribute: false }) public set hass(value: HassLike | undefined) {
    this._hass = value;
    if (!value || !this._config?.entity) return;
    const next = value.states[this._config.entity];
    if (this._entityState === next) return;
    this._entityState = next;
    if (this._config.mode === 'covers' && this._config.total_entity) {
      this._totalEntityState = value.states[this._config.total_entity];
    }
    this.requestUpdate();
  }
  public get hass(): HassLike | undefined {
    return this._hass;
  }

  @state() private _config?: MediathequeConfig;
  @state() private _detailLoan: Loan | null = null;
  @state() private _confirmExtend: { loan: Loan } | null = null;
  @state() private _barcodeOpen = false;

  private _hass?: HassLike;
  private _entityState?: HassEntityState;
  private _totalEntityState?: HassEntityState;
  private _retry = new RetryScheduler('card', () => this.requestUpdate());
  private _hasRendered = false;

  public setConfig(config: MediathequeConfig): void {
    // Seul 'entity' est bloquant — tout le reste est tolérant pour ne jamais
    // casser un dashboard sur un champ optionnel mal renseigné. On log les
    // anomalies dans la console pour que l'utilisateur puisse diagnostiquer.
    if (!config || typeof config !== 'object') {
      throw new Error('Configuration manquante ou invalide');
    }
    if (!config.entity || typeof config.entity !== 'string') {
      throw new Error('Vous devez définir une entité (entity)');
    }

    let normalizedMode: CardMode | undefined;
    if (config.mode !== undefined) {
      const aliased = MODE_ALIASES[config.mode] ?? config.mode;
      if (ALL_MODES.includes(aliased as CardMode)) {
        normalizedMode = aliased as CardMode;
      } else {
        mcLog(
          'warn',
          'card',
          "Mode '%s' inconnu, fallback sur 'list'. Modes valides : %s",
          config.mode,
          ALL_MODES.join(', ')
        );
      }
    }

    let normalizedBadges: BadgeType[] | undefined;
    if (config.badges !== undefined) {
      if (!Array.isArray(config.badges)) {
        mcLog('warn', 'card', "'badges' doit être une liste, ignoré (reçu : %o)", config.badges);
      } else {
        const valid = config.badges.filter((b) => ALL_BADGES.includes(b as BadgeType));
        const invalid = config.badges.filter((b) => !ALL_BADGES.includes(b as BadgeType));
        if (invalid.length) {
          mcLog(
            'warn',
            'card',
            'Badges inconnus ignorés : %s. Valides : %s',
            invalid.join(', '),
            ALL_BADGES.join(', ')
          );
        }
        normalizedBadges = valid as BadgeType[];
      }
    }

    this._config = {
      ...config,
      mode: normalizedMode,
      badges: normalizedBadges,
    };
  }

  public static getStubConfig(): MediathequeConfig {
    return { entity: '', mode: 'list' };
  }

  public static getConfigElement(): HTMLElement {
    return document.createElement('mediatheque-card-editor');
  }

  public getCardSize(): number {
    return this._config?.mode === 'covers' ? 2 : 4;
  }

  public getGridOptions(): GridOptions {
    const isCovers = this._config?.mode === 'covers';
    return {
      columns: 12,
      min_columns: isCovers ? 4 : 6,
      rows: isCovers ? 2 : 4,
      min_rows: 2,
    };
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    // Force le premier render synchrone : HA peut checker la carte juste
    // après l'insertion dans le DOM, avant que la microtask Lit ne fire le
    // render. Si elle voit le shadow root vide, elle substitue par
    // 'Erreur de configuration' (substitution définitive pour la session).
    if (!this._hasRendered) {
      this.performUpdate();
    }
  }

  public override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._retry.cancel();
  }

  protected override updated(): void {
    if (this._hasRendered) {
      this.dispatchEvent(
        new CustomEvent('mediatheque-card-update', { bubbles: true, composed: true })
      );
    }
  }

  protected override shouldUpdate(changedProperties: PropertyValues): boolean {
    // Si l'état des modales a changé (ouverture/fermeture), toujours re-render —
    // sinon le modal ne s'afficherait jamais quand on clique pour l'ouvrir.
    if (
      changedProperties.has('_detailLoan') ||
      changedProperties.has('_confirmExtend') ||
      changedProperties.has('_barcodeOpen')
    ) {
      return true;
    }
    // Sinon : si une modale est déjà ouverte (et que le changement vient de hass
    // ou autre), on bloque pour ne pas casser l'interaction utilisateur.
    return !(this._detailLoan || this._confirmExtend || this._barcodeOpen) || !this._hasRendered;
  }

  protected override render(): TemplateResult {
    // Toujours rendre un <ha-card> visible — jamais d'empty html.
    // HA a besoin de voir un rendu pour ne pas afficher 'Erreur de configuration',
    // et l'utilisateur a un retour visuel (loader) pendant la phase d'init.
    const mode: CardMode = this._config?.mode ?? 'list';
    const title =
      this._config?.title ??
      (mode === 'covers' ? 'A rendre bientôt' : 'Médiathèque de Veauche');

    if (!this._config) {
      return this._renderLoader(title, 'En attente de configuration…');
    }
    if (!this._hass) {
      return this._renderLoader(title, 'Connexion à Home Assistant…');
    }

    const entityId = this._config.entity;
    const state = this._hass.states[entityId];

    if (!state || state.state === 'unavailable' || state.state === 'unknown') {
      const reason = !state ? 'entity not found' : `state=${state.state}`;
      mcLog(
        'warn',
        'card',
        '%s — %s %s',
        entityId,
        reason,
        this._hasRendered ? '(keeping last render)' : '(showing loader)'
      );
      this._retry.schedule();
      if (this._hasRendered) return this._lastTemplate ?? this._renderLoader(title);
      this._lastTemplate = this._renderLoader(title, 'En attente des données…');
      return this._lastTemplate;
    }

    this._retry.reset();
    const enabledBadges = this._config.badges ?? [...ALL_BADGES];
    const hasFilter = !!this._config.badges;

    const tpl =
      mode === 'covers'
        ? this._renderCovers(state, enabledBadges, hasFilter, title)
        : this._renderList(state, enabledBadges, hasFilter, title);

    this._lastTemplate = tpl;
    this._hasRendered = true;
    return tpl;
  }

  private _lastTemplate?: TemplateResult;

  private _renderLoader(title: string, message = 'Chargement…'): TemplateResult {
    return html`
      <ha-card>
        <div class="mediatheque-header">
          <span class="mediatheque-title">${title}</span>
        </div>
        <div style="padding:32px 16px;text-align:center">
          <div class="mediatheque-loader"></div>
          <div style="margin-top:12px;color:var(--secondary-text-color);font-size:0.9em">
            ${message}
          </div>
        </div>
      </ha-card>
    `;
  }

  private _matchesBadgeFilter(loan: Loan, enabled: BadgeType[]): boolean {
    return enabled.includes(getDaysChip(loan.days_left).type);
  }

  private _renderCovers(
    state: HassEntityState,
    enabledBadges: BadgeType[],
    hasFilter: boolean,
    title: string
  ): TemplateResult {
    const attrs = (state.attributes ?? {}) as DueAttributes & AllAttributes;
    // Accepter les deux formes d'entité : 'livres' (sensors filtrés due_week / overdue)
    // ou 'membres' (sensor principal) qu'on aplatit. La vue couvertures doit
    // marcher quel que soit le sensor pointé.
    const livres: Loan[] =
      attrs.livres ??
      Object.values(attrs.membres ?? {}).flat();
    const filtered = hasFilter
      ? livres.filter((l) => this._matchesBadgeFilter(l, enabledBadges))
      : livres;

    const totalState =
      this._totalEntityState ??
      (this._hass?.states[this._config!.entity.replace('_due_week', '_total')]);
    const cardId =
      (attrs.card_id ??
        (totalState?.attributes as { card_id?: string } | undefined)?.card_id ??
        this._config?.card_id ??
        '') || '';
    const badgeText = `${filtered.length}`;
    const highlight = filtered.length > 0;

    const sorted = [...filtered].sort((a, b) => (a.days_left ?? 0) - (b.days_left ?? 0));

    return html`
      <ha-card>
        ${this._renderHeader(title, badgeText, highlight, cardId)}
        ${sorted.length === 0
          ? html`<div class="empty-state">Aucun livre à rendre</div>`
          : html`<div class="book-grid">
              ${sorted.map((loan) => this._renderTile(loan))}
            </div>`}
        ${this._renderModals(cardId)}
      </ha-card>
    `;
  }

  private _renderTile(loan: Loan): TemplateResult {
    const chip = getDaysChip(loan.days_left);
    const coverSrc = loan.cover_url || PLACEHOLDER_SVG;
    const tileLabel =
      loan.days_left < 0
        ? `${Math.abs(loan.days_left)}j`
        : loan.days_left === 0
          ? '!'
          : `${loan.days_left}j`;

    return html`
      <button
        class="book-tile"
        title="${loan.titre}${loan.emprunteur ? ` — ${loan.emprunteur}` : ''}"
        @click=${(): void => this._openDetail(loan)}
      >
        <img
          class="book-tile-cover"
          src=${coverSrc}
          alt=""
          loading="lazy"
          @error=${(e: Event): void => {
            (e.target as HTMLImageElement).src = PLACEHOLDER_SVG;
          }}
        />
        <span
          class="book-tile-badge"
          style="color:${chip.color};background:${chip.bg}"
          aria-label=${chip.text}
          >${tileLabel}</span
        >
        ${loan.extend_disabled || loan.extended
          ? html`<span
              class="book-tile-corner"
              style=${loan.extend_disabled
                ? 'background:#b71c1c'
                : 'background:#6a1b9a'}
              title=${loan.extend_disabled ? 'Désactivé' : 'Non prolongeable'}
              >✗</span
            >`
          : nothing}
      </button>
    `;
  }

  private _renderList(
    state: HassEntityState,
    enabledBadges: BadgeType[],
    hasFilter: boolean,
    title: string
  ): TemplateResult {
    const attrs = (state.attributes ?? {}) as AllAttributes;
    const membres = attrs.membres ?? {};
    const compte = attrs.compte ?? '';
    const cardId = attrs.card_id ?? this._config?.card_id ?? '';

    const filteredMembres: MembersMap = {};
    let filteredTotal = 0;
    for (const [member, loans] of Object.entries(membres)) {
      const filtered = hasFilter
        ? loans.filter((l) => this._matchesBadgeFilter(l, enabledBadges))
        : loans;
      if (filtered.length > 0) {
        filteredMembres[member] = filtered;
        filteredTotal += filtered.length;
      }
    }

    const sortedMembers = Object.keys(filteredMembres).sort((a, b) => {
      if (a === compte) return -1;
      if (b === compte) return 1;
      return a.localeCompare(b);
    });

    const badgeText = `${filteredTotal} emprunt${filteredTotal > 1 ? 's' : ''}`;
    const highlight = hasFilter && filteredTotal > 0;

    return html`
      <ha-card>
        ${this._renderHeader(title, badgeText, highlight, cardId)}
        ${sortedMembers.length === 0
          ? html`<div class="empty-state">Aucun emprunt en cours</div>`
          : sortedMembers.map((member) => {
              const loans = filteredMembres[member];
              if (!loans) return nothing;
              const icon = member === compte ? '👤' : '👦';
              const sorted = [...loans].sort((a, b) => (a.days_left ?? 0) - (b.days_left ?? 0));
              return html`
                <div class="member-section">
                  <div class="member-header">
                    <span class="member-icon">${icon}</span>
                    <span class="member-name">${member}</span>
                    <span class="member-count">${loans.length}</span>
                  </div>
                  ${sorted.map((loan) => this._renderBookRow(loan, false))}
                </div>
              `;
            })}
        ${this._renderModals(cardId)}
      </ha-card>
    `;
  }

  private _renderHeader(
    title: string,
    badgeText: string,
    highlight: boolean,
    cardId: string
  ): TemplateResult {
    return html`
      <div class="mediatheque-header">
        <span class="mediatheque-title">${title}</span>
        <span class="header-right">
          <span class=${classMap({ 'mediatheque-total': true, highlight })}>${badgeText}</span>
          ${cardId
            ? html`<button
                class="mc-barcode-btn"
                title="Ma carte"
                @click=${this._openBarcode}
              >
                |||
              </button>`
            : nothing}
        </span>
      </div>
    `;
  }

  private _renderBookRow(loan: Loan, showEmprunteur: boolean): TemplateResult {
    const chip = getDaysChip(loan.days_left);
    const coverSrc = loan.cover_url || PLACEHOLDER_SVG;

    return html`
      <div class="book-row">
        <div class="book-cover-wrapper" @click=${(): void => this._openDetail(loan)}>
          <img
            class="book-cover"
            src=${coverSrc}
            alt=""
            loading="lazy"
            @error=${(e: Event): void => {
              (e.target as HTMLImageElement).src = PLACEHOLDER_SVG;
            }}
          />
        </div>
        <div class="book-info">
          <div class="book-title" title=${loan.titre}>${loan.titre}</div>
          <div class="book-date">Retour : ${loan.due_date_display}</div>
          ${showEmprunteur && loan.emprunteur
            ? html`<div class="book-emprunteur">Emprunteur : ${loan.emprunteur}</div>`
            : nothing}
          <div class="book-badges">
            <span class="badge-days" style="color:${chip.color};background:${chip.bg}">
              ${chip.text}
            </span>
            ${loan.extend_disabled
              ? html`<span class="badge-days" style="color:#b71c1c;background:#ffcdd2"
                  >✗ Désactivé</span
                >`
              : loan.extended
                ? html`<span class="badge-days" style="color:#6a1b9a;background:#e1bee7"
                    >✗ Non prolongeable</span
                  >`
                : nothing}
          </div>
        </div>
      </div>
    `;
  }

  private _renderModals(cardId: string): TemplateResult {
    return html`
      ${this._detailLoan ? this._renderDetailModal(this._detailLoan) : nothing}
      ${this._confirmExtend ? this._renderConfirmModal(this._confirmExtend.loan) : nothing}
      ${this._barcodeOpen && cardId ? this._renderBarcodeModal(cardId) : nothing}
    `;
  }

  private _renderDetailModal(loan: Loan): TemplateResult {
    const cover = loan.cover_url || PLACEHOLDER_SVG;
    return html`
      <div class="mc-modal-overlay active" @click=${this._onOverlayClick}>
        <div class="mc-modal">
          <div class="mc-modal-body mc-modal-body-top">
            <div class="mc-modal-title">${loan.titre}</div>
          </div>
          <img class="mc-modal-cover" src=${cover} alt="" />
          <div class="mc-modal-body">
            ${loan.isbn
              ? html`<div class="mc-modal-isbn">ISBN : ${loan.isbn}</div>`
              : nothing}
            <div class="mc-modal-actions">
              <button class="mc-modal-btn mc-modal-btn-close" @click=${this._closeDetail}>
                Fermer
              </button>
              ${loan.can_extend
                ? html`<button
                    class="mc-modal-btn mc-modal-btn-extend"
                    @click=${(): void => this._askExtend(loan)}
                  >
                    Prolonger
                  </button>`
                : nothing}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private _renderConfirmModal(loan: Loan): TemplateResult {
    return html`
      <div class="mc-confirm-overlay active" @click=${this._onConfirmOverlayClick}>
        <div class="mc-confirm-dialog">
          <div class="mc-confirm-icon">↻</div>
          <div class="mc-confirm-title">Prolonger cet emprunt ?</div>
          <div class="mc-confirm-text">${loan.titre}</div>
          <div class="mc-confirm-actions">
            <button class="mc-modal-btn-cancel" @click=${this._closeConfirm}>Annuler</button>
            <button class="mc-modal-btn-confirm" @click=${this._confirmExtendNow}>
              Confirmer
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private _renderBarcodeModal(cardId: string): TemplateResult {
    const svg = generateCode39Svg(cardId);
    return html`
      <div class="mc-barcode-overlay active" @click=${this._onBarcodeOverlayClick}>
        <div class="mc-barcode-dialog">
          <h3>Ma carte</h3>
          <div class="mc-barcode-id">${cardId}</div>
          <div class="mc-barcode-svg">${unsafeSVG(svg)}</div>
          <button class="mc-barcode-close" @click=${this._closeBarcode}>Fermer</button>
        </div>
      </div>
    `;
  }

  private _openDetail = (loan: Loan): void => {
    this._detailLoan = loan;
  };
  private _closeDetail = (): void => {
    this._detailLoan = null;
  };
  private _askExtend = (loan: Loan): void => {
    if (!loan.extend_url) return;
    this._confirmExtend = { loan };
  };
  private _closeConfirm = (): void => {
    this._confirmExtend = null;
  };
  private _confirmExtendNow = (): void => {
    const url = this._confirmExtend?.loan.extend_url;
    if (url && this._hass) {
      void this._hass.callService('mediatheque_veauche', 'extend_loan', { extend_url: url });
    }
    this._confirmExtend = null;
    this._detailLoan = null;
  };
  private _openBarcode = (): void => {
    this._barcodeOpen = true;
  };
  private _closeBarcode = (): void => {
    this._barcodeOpen = false;
  };
  private _onOverlayClick = (e: Event): void => {
    if (e.target === e.currentTarget) this._closeDetail();
  };
  private _onConfirmOverlayClick = (e: Event): void => {
    if (e.target === e.currentTarget) this._closeConfirm();
  };
  private _onBarcodeOverlayClick = (e: Event): void => {
    if (e.target === e.currentTarget) this._closeBarcode();
  };
}

declare global {
  interface Window {
    customCards?: Array<{ type: string; name: string; description?: string }>;
    loadCardHelpers?: () => Promise<unknown>;
  }
}

logBanner();

// Force HA à charger ses définitions de custom elements (ha-card, ha-form…).
// Sans cet appel, sur un cold load (cache vide), notre carte est enregistrée
// avant que HA ait défini ha-card / ha-form, ce qui produit un rendu cassé.
void window.loadCardHelpers?.();

// Garde idempotente : sur WebView Android, le script peut être ré-évalué
// (sleep/wake, retour du background). Sans cette garde, customElements.define
// throw "already defined" → KO total.
if (!customElements.get('mediatheque-card')) {
  customElements.define('mediatheque-card', MediathequeCard);
}

window.customCards = window.customCards ?? [];
if (!window.customCards.some((c) => c.type === 'mediatheque-card')) {
  window.customCards.push({
    type: 'mediatheque-card',
    name: 'Médiathèque de Veauche',
    description: 'Affiche les emprunts de la médiathèque de Veauche',
  });
}
