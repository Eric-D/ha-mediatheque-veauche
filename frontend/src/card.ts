import { LitElement, html, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';

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
import {
  COVER_HEIGHT_DEFAULT,
  COVER_HEIGHT_MAX,
  COVER_HEIGHT_MIN,
  renderCarousel,
} from './renders/carousel.js';
import { cardSizeFor, gridOptionsFor, type GridOptions } from './helpers/grid.js';
import { RetryScheduler } from './helpers/retry.js';
import { renderBookRow, renderTile } from './renders/book.js';
import { renderHeader, renderLoader, renderStaleNotice } from './renders/chrome.js';
import {
  renderBarcodeModal,
  renderConfirmModal,
  renderDetailModal,
} from './renders/modals.js';
import { logBanner, mcLog } from './version.js';
import { cardStyles } from './styles/card.js';
import { modalStyles } from './styles/modal.js';

import './editor.js';

export class MediathequeCard extends LitElement {
  static override styles = [cardStyles, modalStyles];

  @property({ attribute: false }) public set hass(value: HassLike | undefined) {
    this._hass = value;
    // Lit enveloppe ce setter et appelle requestUpdate() lui-même après coup :
    // inutile (et trompeur) de le rappeler ici. Le filtrage des re-renders
    // inutiles se fait dans shouldUpdate(), pas ici — sinon on croit optimiser
    // alors que la carte re-render à chaque événement de l'instance HA.
    // Aucun early-return avant d'avoir renseigné les deux états : sinon
    // _totalEntityState reste vide au premier rendu (pas de card_id → pas de
    // bouton code-barres tant qu'un second tick n'est pas arrivé).
    this._syncEntityStates();
  }
  public get hass(): HassLike | undefined {
    return this._hass;
  }

  @state() private _config?: MediathequeConfig;
  @state() private _detailLoan: Loan | null = null;
  @state() private _confirmExtend: { loan: Loan } | null = null;
  @state() private _barcodeOpen = false;

  /** Sert uniquement à tracer le cycle de vie : le chemin nominal étant
   *  silencieux, « aucun log » ne permettait pas de distinguer « HA n'a jamais
   *  utilisé notre élément » de « tout s'est bien passé ». */
  private static _instances = 0;
  private readonly _id = ++MediathequeCard._instances;

  private _hass?: HassLike;
  private _entityState?: HassEntityState;
  private _totalEntityState?: HassEntityState;
  private _retry = new RetryScheduler('card', () => this.requestUpdate());
  private _hasRendered = false;
  private _renderedEntityState?: HassEntityState;
  private _renderedTotalState?: HassEntityState;

  public setConfig(config: MediathequeConfig): void {
    // Seul 'entity' est bloquant — tout le reste est tolérant pour ne jamais
    // casser un dashboard sur un champ optionnel mal renseigné. On log les
    // anomalies dans la console pour que l'utilisateur puisse diagnostiquer.
    if (!config || typeof config !== 'object') {
      // Seul cas réellement bloquant : sans objet, il n'y a rien à rendre.
      mcLog('error', 'card', 'setConfig rejeté, config non-objet : %o', config);
      throw new Error('Configuration manquante ou invalide');
    }
    // 'entity' absente, null ou vide = état transitoire légitime (stub du
    // sélecteur de cartes, éditeur ouvert avant sélection, YAML « entity: »
    // sans valeur qui parse en null). Lever ici substituerait la carte par
    // 'Erreur de configuration' de façon définitive et sans aucune trace
    // console. On tolère, on loggue, et _render() affiche un loader explicite.
    let entity = '';
    if (typeof config.entity === 'string') {
      entity = config.entity;
    } else if (config.entity !== undefined && config.entity !== null) {
      mcLog(
        'error',
        'card',
        "'entity' doit être une chaîne, reçu %o — carte en attente de configuration",
        config.entity
      );
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
        // Un filtre vide masquerait la totalité des emprunts, ce qui est
        // indiscernable de « aucun emprunt ». Vaut aussi pour « badges: [] »
        // écrit à la main, pas seulement pour une liste devenue vide après
        // validation.
        if (valid.length === 0) {
          mcLog('warn', 'card', 'Filtre de badges vide, filtre ignoré');
        } else {
          normalizedBadges = valid as BadgeType[];
        }
      }
    }

    // Tolérant et journalisé, comme les autres champs optionnels : une hauteur
    // aberrante ne doit pas rendre la carte irrécupérable depuis l'interface.
    let coverHeight: number | undefined;
    if (config.cover_height !== undefined) {
      const raw = config.cover_height;
      if (
        typeof raw !== 'number' ||
        !Number.isInteger(raw) ||
        raw < COVER_HEIGHT_MIN ||
        raw > COVER_HEIGHT_MAX
      ) {
        mcLog(
          'warn',
          'card',
          "'cover_height' doit être un entier entre %d et %d, ignoré (reçu : %o)",
          COVER_HEIGHT_MIN,
          COVER_HEIGHT_MAX,
          raw
        );
      } else {
        coverHeight = raw;
      }
    }

    let hideOkBadges: boolean | undefined;
    if (config.hide_ok_badges !== undefined) {
      if (typeof config.hide_ok_badges !== 'boolean') {
        mcLog(
          'warn',
          'card',
          "'hide_ok_badges' doit être un booléen, ignoré (reçu : %o)",
          config.hide_ok_badges
        );
      } else {
        hideOkBadges = config.hide_ok_badges;
      }
    }

    mcLog(
      'info',
      'card',
      '#%d setConfig accepté (entity=%s, mode=%s) à t=%dms',
      this._id,
      entity || '(vide)',
      normalizedMode ?? 'list',
      Math.round(performance.now())
    );

    const previous = this._config;
    this._config = {
      ...config,
      entity,
      mode: normalizedMode,
      badges: normalizedBadges,
      cover_height: coverHeight,
      hide_ok_badges: hideOkBadges,
    };

    // Changer d'entité invalide tout ce qui a été rendu jusqu'ici : sans ce
    // reset, _render() renverrait _lastTemplate (les emprunts de l'ancienne
    // entité) dès que la nouvelle est indisponible, indéfiniment.
    if (
      previous?.entity !== this._config.entity ||
      previous?.total_entity !== this._config.total_entity
    ) {
      this._hasRendered = false;
      this._lastTemplate = undefined;
      this._renderedEntityState = undefined;
      this._renderedTotalState = undefined;
      this._retry.reset();
    }
    // Les états sont résolus dans le setter hass ; sans ce rappel, une nouvelle
    // entité n'est prise en compte qu'au prochain push de hass.
    this._syncEntityStates();
  }

  /** Résout les états suivis à partir de la config et du hass courants. */
  private _syncEntityStates(): void {
    const states = this._hass?.states;
    if (!states || !this._config?.entity) {
      // Sans ça, vider l'entité laisse les états de la précédente en place.
      this._entityState = undefined;
      this._totalEntityState = undefined;
      return;
    }
    this._entityState = states[this._config.entity];
    this._totalEntityState = this._config.total_entity
      ? states[this._config.total_entity]
      : undefined;
  }

  public static getStubConfig(
    hass?: HassLike,
    entities?: string[],
    entitiesFallback?: string[]
  ): MediathequeConfig {
    // HA instancie un aperçu avec ce stub dès l'ouverture du sélecteur de cartes.
    // On pré-remplit avec un vrai sensor de l'intégration (reconnu à son attribut
    // 'membres'), à défaut n'importe quel sensor 'mediatheque'.
    const states = hass?.states ?? {};
    const pool = [
      ...(entities ?? []),
      ...(entitiesFallback ?? []),
      ...Object.keys(states),
    ].filter((id) => id.startsWith('sensor.'));
    const entity =
      pool.find((id) => (states[id]?.attributes as AllAttributes | undefined)?.membres) ??
      pool.find((id) => id.includes('mediatheque')) ??
      '';
    return { entity, mode: 'list' };
  }

  public static getConfigElement(): HTMLElement {
    return document.createElement('mediatheque-card-editor');
  }

  public getCardSize(): number {
    return cardSizeFor(this._config?.mode);
  }

  public getGridOptions(): GridOptions {
    return gridOptionsFor(this._config?.mode);
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    // Hors d'ici, le compteur n'est remis à zéro que par un rendu de données
    // réussi : un élément re-connecté (déplacement entre sections, re-render de
    // vue) repartirait donc avec un quota déjà épuisé.
    this._retry.reset();
    // Pas de performUpdate() synchrone ici. Il avait été ajouté (84a32e8) pour
    // fermer une course supposée : « HA checke le shadow root juste après
    // l'insertion, le voit vide et substitue une carte d'erreur ». Ce mécanisme
    // n'existe pas — HA vérifie que l'élément est défini et que setConfig ne
    // lève pas, rien d'autre. En échange, l'appel faisait rendre notre élément
    // de façon ré-entrante à l'intérieur du commit Lit de HA, ce qui est hors
    // contrat et peut perturber son cycle de mise à jour : l'erreur se produit
    // alors de leur côté, invisible depuis notre try/catch. Le symptôme que ce
    // correctif visait est d'ailleurs réapparu.

    // loadCardHelpers() est asynchrone : sur un cold load, ce premier rendu peut
    // sortir un <ha-card> pas encore upgradé (contenu non stylé). On force un
    // re-render dès que HA a défini l'élément.
    if (!customElements.get('ha-card')) {
      void customElements.whenDefined('ha-card').then(() => {
        mcLog('info', 'card', 'ha-card défini après le premier rendu, re-render');
        this.requestUpdate();
      });
    }
  }

  public override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._retry.cancel();
  }

  protected override updated(): void {
    if (!this._firstUpdateLogged) {
      this._firstUpdateLogged = true;
      mcLog(
        'info',
        'card',
        '#%d premier rendu effectué à t=%dms (données=%s)',
        this._id,
        Math.round(performance.now()),
        this._hasRendered ? 'oui' : 'non, loader'
      );
    }
    this._renderedEntityState = this._entityState;
    this._renderedTotalState = this._totalEntityState;
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
      changedProperties.has('_barcodeOpen') ||
      // ...ou la config (aperçu live de l'éditeur) : elle peut arriver dans le
      // même lot qu'un 'hass' dont les états n'ont pas bougé.
      changedProperties.has('_config')
    ) {
      return true;
    }
    // Tant que rien n'a été rendu pour de bon, on ne bloque jamais.
    if (!this._hasRendered) return true;
    // Une modale ouverte : on bloque les rafraîchissements venus de hass pour ne
    // pas casser l'interaction utilisateur.
    if (this._detailLoan || this._confirmExtend || this._barcodeOpen) return false;
    // HA réassigne 'hass' à chaque événement de l'instance, pas seulement pour nos
    // entités. On ne re-render que si nos états ont réellement changé. Un
    // requestUpdate() sans nom (retry, ha-card défini) passe toujours.
    if (changedProperties.has('hass')) {
      return (
        this._entityState !== this._renderedEntityState ||
        this._totalEntityState !== this._renderedTotalState
      );
    }
    return true;
  }

  protected override render(): TemplateResult {
    // Wrapper anti-throw : si _render() lève (donnée HA inattendue, sous-helper
    // qui crash, etc.), Lit's update() throw, le shadow root reste vide, HA
    // substitue par 'Erreur de configuration'. On garantit un <ha-card>
    // visible quoi qu'il arrive.
    try {
      return this._render();
    } catch (e) {
      mcLog('error', 'card', 'render() a throw, fallback loader : %o', e);
      // Sans ça, on reste sur l'erreur jusqu'au prochain hass utile.
      this._retry.schedule();
      return renderLoader({ title: 'Médiathèque', message: 'Erreur — voir console' });
    }
  }

  private _render(): TemplateResult {
    // Toujours rendre un <ha-card> visible — jamais d'empty html.
    // HA a besoin de voir un rendu pour ne pas afficher 'Erreur de configuration',
    // et l'utilisateur a un retour visuel (loader) pendant la phase d'init.
    const mode: CardMode = this._config?.mode ?? 'list';
    const title =
      this._config?.title ??
      (mode === 'covers' ? 'A rendre bientôt' : 'Médiathèque de Veauche');

    if (!this._config) {
      return renderLoader({ title, message: 'En attente de configuration…' });
    }
    if (!this._hass) {
      return renderLoader({ title, message: 'Connexion à Home Assistant…' });
    }

    const entityId = this._config.entity;
    if (!entityId) {
      return renderLoader({ title, message: 'Sélectionnez une entité' });
    }
    const states = this._hass.states;
    if (!states) {
      mcLog('warn', 'card', 'hass.states absent, rendu du loader');
      this._retry.schedule();
      // Même règle que la branche « entité indisponible » plus bas : au-delà du
      // quota de retries, afficher indéfiniment le dernier rendu ferait passer
      // des emprunts périmés pour à jour. Ce chemin l'ignorait.
      if (!this._retry.exhausted) {
        return this._lastTemplate ?? renderLoader({ title, message: 'En attente de Home Assistant…' });
      }
      return renderLoader({ title, message: 'Données Home Assistant indisponibles' });
    }
    const state = states[entityId];

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
      if (this._hasRendered && !this._retry.exhausted) {
        // Indisponibilité brève : garder le dernier rendu évite un
        // clignotement à chaque reload de l'intégration.
        return this._lastTemplate ?? renderLoader({ title });
      }
      if (this._hasRendered) {
        // Quota de retries épuisé : continuer d'afficher le dernier rendu
        // ferait passer des emprunts périmés pour à jour, sans le moindre
        // indice — précisément ce que le bandeau de péremption évite dans le
        // cas du repli sur cache, mais ce chemin-ci ne l'atteint jamais
        // puisque l'entité est indisponible.
        // Texte neutre : la carte ne connaît pas la cause de l'indisponibilité.
        // Home Assistant affiche lui-même une notification quand ce sont les
        // identifiants ; spéculer ici enverrait chercher au mauvais endroit,
        // par exemple après un simple redémarrage un peu lent.
        return renderLoader({ title, message: `${entityId} indisponible` });
      }
      // Une fois le quota de retries épuisé, plus rien ne relancera la carte de
      // lui-même : un spinner perpétuel ferait croire à un chargement en cours.
      this._lastTemplate = renderLoader({
        title,
        message: this._retry.exhausted
          ? `Données indisponibles pour ${entityId}`
          : 'En attente des données…',
      });
      return this._lastTemplate;
    }

    // Une entité qui ne porte ni 'membres' ni 'livres' n'est pas une entité de
    // cette intégration. Sans ce garde-fou, la carte affiche « Aucun emprunt en
    // cours » avec un badge à 0, ce qui ressemble à un état nominal.
    const attributes = state.attributes ?? {};
    if (!('membres' in attributes) && !('livres' in attributes)) {
      mcLog(
        'error',
        'card',
        '%s ne porte ni « membres » ni « livres » : ce n\'est pas un capteur de cette intégration',
        entityId
      );
      return renderLoader({ title, message: `${entityId} n'est pas un capteur Médiathèque` });
    }

    this._retry.reset();
    const enabledBadges = this._config.badges ?? [...ALL_BADGES];
    const hasFilter = !!this._config.badges;

    const tpl =
      mode === 'carousel'
        ? this._renderCarousel(state, enabledBadges, hasFilter)
        : mode === 'covers'
          ? this._renderCovers(state, enabledBadges, hasFilter, title)
          : this._renderList(state, enabledBadges, hasFilter, title);

    this._lastTemplate = tpl;
    this._hasRendered = true;
    return tpl;
  }

  private _lastTemplate?: TemplateResult;
  private _firstUpdateLogged = false;

  private _matchesBadgeFilter(loan: Loan, enabled: BadgeType[]): boolean {
    // 'not_extendable' n'est jamais renvoyé par getDaysChip() (qui ne classe
    // que par délai) : il se lit sur le prêt lui-même. Sans ce cas particulier,
    // filtrer sur ce badge ne remontait jamais rien.
    if (enabled.includes('not_extendable') && (loan.extended || loan.extend_disabled)) {
      return true;
    }
    return enabled.includes(getDaysChip(loan.days_left).type);
  }

  /** Bande de couvertures, sans en-tête.

      `title` n'est pas pris en paramètre : le mode n'a pas d'en-tête, et le
      recevoir pour l'ignorer inviterait à l'afficher « pour faire bien ».

      `cardId` est recalculé ici, avec la même chaîne de repli que les autres
      modes : c'est lui qui conditionne la tuile code-barres. Chaque mode de
      rendu doit le calculer — l'oublier fait disparaître le bouton sans autre
      symptôme. */
  private _renderCarousel(
    state: HassEntityState,
    enabledBadges: BadgeType[],
    hasFilter: boolean
  ): TemplateResult {
    const attrs = (state.attributes ?? {}) as DueAttributes & AllAttributes;
    // Les deux formes d'entité, comme le mode couvertures : 'livres' sur les
    // capteurs filtrés, 'membres' sur le capteur principal qu'on aplatit.
    const livres: Loan[] = attrs.livres ?? Object.values(attrs.membres ?? {}).flat();
    const filtered = hasFilter
      ? livres.filter((l) => this._matchesBadgeFilter(l, enabledBadges))
      : livres;

    const totalState = this._totalEntityState;
    // '||' et non '??' : un card_id vide doit continuer la chaîne de repli,
    // sinon la tuile code-barres disparaît au lieu de chercher plus loin.
    const cardId =
      attrs.card_id ||
      (totalState?.attributes as { card_id?: string } | undefined)?.card_id ||
      this._config?.card_id ||
      '';

    return html`
      <ha-card>
        ${renderStaleNotice(attrs)}
        ${renderCarousel({
          loans: filtered,
          cardId,
          coverHeight: this._config?.cover_height ?? COVER_HEIGHT_DEFAULT,
          hideOkBadges: this._config?.hide_ok_badges ?? false,
          onDetail: this._openDetail,
          onBarcode: this._openBarcode,
        })}
        ${this._renderModals(cardId)}
      </ha-card>
    `;
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

    const totalState = this._totalEntityState;
    // '||' et non '??' : un card_id vide doit continuer la chaîne de repli,
    // sinon le bouton code-barres disparaît au lieu de chercher plus loin.
    const cardId =
      attrs.card_id ||
      (totalState?.attributes as { card_id?: string } | undefined)?.card_id ||
      this._config?.card_id ||
      '';
    const badgeText = `${filtered.length}`;
    const highlight = filtered.length > 0;

    const sorted = [...filtered].sort((a, b) => (a.days_left ?? Number.MAX_SAFE_INTEGER) - (b.days_left ?? Number.MAX_SAFE_INTEGER));

    return html`
      <ha-card>
        ${renderHeader({
          title,
          badgeText,
          highlight,
          cardId,
          onBarcodeClick: this._openBarcode,
        })}
        ${renderStaleNotice(attrs)}
        ${sorted.length === 0
          ? html`<div class="empty-state">Aucun livre à rendre</div>`
          : html`<div class="book-grid">
              ${sorted.map((loan) =>
                renderTile({
                  loan,
                  onClick: () => this._openDetail(loan),
                  onToggleRead: () => this._toggleRead(loan),
                })
              )}
            </div>`}
        ${this._renderModals(cardId)}
      </ha-card>
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
        ${renderHeader({
          title,
          badgeText,
          highlight,
          cardId,
          onBarcodeClick: this._openBarcode,
        })}
        ${renderStaleNotice(attrs)}
        ${sortedMembers.length === 0
          ? html`<div class="empty-state">Aucun emprunt en cours</div>`
          : sortedMembers.map((member) => {
              const loans = filteredMembres[member];
              if (!loans) return nothing;
              const icon = member === compte ? '👤' : '👦';
              const sorted = [...loans].sort((a, b) => (a.days_left ?? Number.MAX_SAFE_INTEGER) - (b.days_left ?? Number.MAX_SAFE_INTEGER));
              return html`
                <div class="member-section">
                  <div class="member-header">
                    <span class="member-icon">${icon}</span>
                    <span class="member-name">${member}</span>
                    <span class="member-count">${loans.length}</span>
                  </div>
                  ${sorted.map((loan) =>
                    renderBookRow({
                      loan,
                      onClick: () => this._openDetail(loan),
                      onToggleRead: () => this._toggleRead(loan),
                    })
                  )}
                </div>
              `;
            })}
        ${this._renderModals(cardId)}
      </ha-card>
    `;
  }

  private _renderModals(cardId: string): TemplateResult {
    return html`
      ${this._detailLoan
        ? renderDetailModal({
            loan: this._detailLoan,
            onOverlayClick: this._onOverlayClick,
            onClose: this._closeDetail,
            onExtend: (): void => this._askExtend(this._detailLoan!),
            onToggleRead: (): void => this._toggleRead(this._detailLoan!),
          })
        : nothing}
      ${this._confirmExtend
        ? renderConfirmModal({
            loan: this._confirmExtend.loan,
            onOverlayClick: this._onConfirmOverlayClick,
            onCancel: this._closeConfirm,
            onConfirm: this._confirmExtendNow,
          })
        : nothing}
      ${this._barcodeOpen && cardId
        ? renderBarcodeModal({
            cardId,
            onOverlayClick: this._onBarcodeOverlayClick,
            onClose: this._closeBarcode,
          })
        : nothing}
    `;
  }


  private _openDetail = (loan: Loan): void => {
    this._detailLoan = loan;
  };
  private _closeDetail = (): void => {
    this._detailLoan = null;
  };
  private _toggleRead = (loan: Loan): void => {
    const key = loan.read_key;
    if (!key || !this._hass) return;
    const next = !loan.read;

    // Bascule optimiste de la fiche ouverte. `_detailLoan` est une capture du
    // prêt au moment du clic, pas une vue sur les données : la mise à jour que
    // pousse le coordinator remplace les prêts dans `hass`, mais laisse cette
    // capture telle quelle. Sans cette ligne, le bouton de la fiche garderait
    // son libellé d'avant jusqu'à la réouverture, alors que la tuile derrière
    // aurait déjà basculé.
    if (this._detailLoan && this._detailLoan.read_key === key) {
      this._detailLoan = { ...this._detailLoan, read: next };
    }

    // Même traitement que la prolongation : Home Assistant affiche déjà sa
    // notification d'erreur, et sans catch chaque échec laisse une promesse
    // rejetée non gérée dans la console.
    void this._hass
      .callService('mediatheque_veauche', 'set_read', { read_key: key, read: next })
      .catch((err: unknown) => {
        // eslint-disable-next-line no-console
        console.error('[mediatheque-card] set_read a échoué', err);
      });
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
      // Home Assistant relance après avoir affiché sa notification : sans
      // catch, chaque échec produit une promesse rejetée non gérée dans la
      // console. Le service échoue désormais explicitement quand le prêt
      // n'appartient à aucun compte, donc ce chemin est réellement atteignable.
      void this._hass
        .callService('mediatheque_veauche', 'extend_loan', { extend_url: url })
        .catch((e: unknown) => {
          mcLog('warn', 'card', 'la prolongation a échoué : %o', e);
        });
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
void window.loadCardHelpers?.().catch((e: unknown) => {
  mcLog('warn', 'card', 'loadCardHelpers() a échoué : %o', e);
});

const CARD_TAG = 'mediatheque-card';
const MAX_REREGISTRATIONS = 5;
let reregistrations = 0;

/**
 * Garantit que le tag est résolvable par le registre d'éléments personnalisés
 * *actuellement installé*.
 *
 * Home Assistant charge @webcomponents/scoped-custom-element-registry, qui
 * REMPLACE window.customElements par sa propre implémentation, avec sa propre
 * table. Si ce module s'enregistre avant l'installation du polyfill, la
 * définition atterrit dans le registre natif : le polyfill prend ensuite la
 * main et ne nous connaît pas. HA appelle customElements.get() → rien, et
 * affiche « Custom element doesn't exist ». Son rattrapage par whenDefined()
 * est mort-né pour la même raison, et réémettre 'll-rebuild' n'y change rien
 * puisque la reconstruction retombe sur un tag introuvable.
 *
 * Symptôme observé, impossible autrement : customElements.get(tag) renvoie
 * undefined alors que document.createElement(tag) produit un élément upgradé
 * avec son setConfig — document.createElement consulte, lui, le registre natif.
 *
 * D'où l'intermittence, et son inversion apparente : à 109 ms on écrit dans le
 * registre natif et ça casse, à 130 ms le polyfill est déjà là et ça marche.
 * C'est le chargement le plus rapide qui échoue.
 */
function ensureRegisteredInCurrentRegistry(): boolean {
  if (customElements.get(CARD_TAG)) return false;
  if (reregistrations >= MAX_REREGISTRATIONS) return false;
  reregistrations++;
  try {
    // Constructeur neuf obligatoire : une même classe ne peut pas être
    // enregistrée deux fois, y compris dans un registre différent.
    customElements.define(CARD_TAG, class extends MediathequeCard {});
    mcLog(
      'warn',
      'card',
      'ré-enregistré à t=%dms : le registre d\'éléments personnalisés avait été remplacé depuis le premier enregistrement',
      Math.round(performance.now())
    );
    return true;
  } catch (e) {
    mcLog('error', 'card', 'ré-enregistrement impossible : %o', e);
    return false;
  }
}

// Garde idempotente : sur WebView Android, le script peut être ré-évalué
// (sleep/wake, retour du background). Sans cette garde, customElements.define
// throw "already defined" → KO total.
if (!customElements.get(CARD_TAG)) {
  customElements.define(CARD_TAG, MediathequeCard);
  mcLog(
    'info',
    'card',
    'élément enregistré à t=%dms après le début du chargement de la page',
    Math.round(performance.now())
  );
} else {
  mcLog('info', 'card', 'module déjà enregistré, ce chargement est ignoré');
}

/**
 * Répare les cartes d'erreur laissées orphelines par le rattrapage de HA.
 *
 * Quand HA construit la vue avant que ce module ne soit évalué, il fabrique une
 * carte « Custom element doesn't exist: mediatheque-card. », puis arme
 * customElements.whenDefined(tag) pour émettre 'll-rebuild' et la reconstruire.
 * Mais whenDefined se résout dans une microtask : si notre définition arrive
 * juste après la création de la carte d'erreur, l'événement part avant que
 * hui-card n'ait attaché son écouteur, et se perd. Le setTimeout de 2 s de HA
 * révèle alors l'erreur définitivement.
 *
 * Paradoxe qui rendait le bug illisible : c'est le chargement le PLUS rapide
 * qui casse, parce que notre module gagne la course contre le rattrapage au
 * lieu de la perdre contre la construction de la vue.
 *
 * On réémet donc 'll-rebuild' nous-mêmes, plus tard, quand l'écouteur est en
 * place. Ciblé sur les seules cartes d'erreur qui nomment notre tag : une fois
 * reconstruites elles disparaissent, donc aucune boucle possible.
 */
function repairOrphanErrorCards(): number {
  let repaired = 0;
  const walk = (node: Element): void => {
    if (node.localName === 'hui-error-card') {
      const holder = node as unknown as {
        _config?: { message?: string };
        config?: { message?: string };
      };
      const message = (holder._config ?? holder.config)?.message ?? '';
      if (message.includes('mediatheque-card')) {
        node.dispatchEvent(new CustomEvent('ll-rebuild', { bubbles: true, composed: true }));
        repaired++;
      }
      return;
    }
    for (const child of [...(node.shadowRoot?.children ?? []), ...node.children]) {
      walk(child as Element);
    }
  };
  if (document.body) walk(document.body);
  return repaired;
}

// Plusieurs passes avant le seuil de 2 s à partir duquel HA rend l'erreur
// visible : la vue peut aussi se construire juste après notre définition.
for (const delay of [0, 50, 150, 400, 1000, 2000, 4000]) {
  window.setTimeout(() => {
    try {
      // D'abord le registre : réémettre 'll-rebuild' ne sert à rien tant que HA
      // ne sait pas résoudre le tag.
      ensureRegisteredInCurrentRegistry();
      const repaired = repairOrphanErrorCards();
      if (repaired > 0) {
        mcLog(
          'warn',
          'card',
          '%d carte(s) d\'erreur reconstruite(s) après %dms — la vue a été bâtie avant l\'enregistrement de l\'élément',
          repaired,
          delay
        );
      }
    } catch (e) {
      mcLog('error', 'card', 'réparation des cartes d\'erreur impossible : %o', e);
    }
  }, delay);
}

window.customCards = window.customCards ?? [];
if (!window.customCards.some((c) => c.type === 'mediatheque-card')) {
  window.customCards.push({
    type: 'mediatheque-card',
    name: 'Médiathèque de Veauche',
    description: 'Affiche les emprunts de la médiathèque de Veauche',
  });
}
