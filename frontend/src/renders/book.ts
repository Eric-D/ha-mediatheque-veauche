/** Rendu d'un prêt : tuile du mode couvertures, ligne du mode liste. */
import { html, nothing, type TemplateResult } from 'lit';

import { getDaysChip } from '../helpers/days-chip.js';
import type { Loan } from '../types.js';
import { PLACEHOLDER_SVG, onCoverError } from './shared.js';

export interface BookOptions {
  loan: Loan;
  onClick: () => void;
  onToggleRead: () => void;
}

/** Libellé du badge « lu », et son inverse pour l'action.
 *
 * Un prêt sans `read_key` — livre sans lien au catalogue *et* sans titre
 * lisible — n'est pas marquable : le service n'aurait aucune clé à écrire. On
 * masque le contrôle plutôt que d'offrir un bouton qui échoue.
 */
export function readLabel(loan: Loan): string {
  return loan.read ? 'Marquer non lu' : 'Marquer comme lu';
}

export function canMarkRead(loan: Loan): boolean {
  return Boolean(loan.read_key);
}

/** Empêche le clic sur la pastille d'ouvrir aussi la fiche détaillée.
 *
 * La pastille est posée sur la tuile, qui est elle-même cliquable : sans
 * stopPropagation, marquer un livre lu ouvrirait la modale dans la foulée.
 */
function onPillClick(onToggleRead: () => void) {
  return (e: Event): void => {
    e.stopPropagation();
    onToggleRead();
  };
}

/** Pastille de bascule, en bas à gauche de la tuile.
 *
 * `<span role="button">` et non `<button>` : la tuile entière est déjà un
 * <button>, et imbriquer deux boutons est du HTML invalide que les navigateurs
 * réparent en les mettant côte à côte — la pastille sortirait de la tuile.
 */
function renderReadPill(loan: Loan, onToggleRead: () => void): TemplateResult {
  return html`<span
    class="book-tile-read ${loan.read ? 'is-read' : ''}"
    role="button"
    tabindex="0"
    aria-pressed=${loan.read ? 'true' : 'false'}
    title=${readLabel(loan)}
    @click=${onPillClick(onToggleRead)}
    >${loan.read ? '✓' : '+'}</span
  >`;
}

export function renderTile({ loan, onClick, onToggleRead }: BookOptions): TemplateResult {
  const chip = getDaysChip(loan.days_left);
  const coverSrc = loan.cover_url || PLACEHOLDER_SVG;
  const days = loan.days_left;
  const tileLabel =
    days === null || days === undefined
      ? '?'
      : days < 0
        ? `${Math.abs(days)}j`
        : days === 0
          ? '!'
          : `${days}j`;

  return html`
    <button
      class="book-tile ${loan.read ? 'is-read' : ''}"
      title="${loan.titre}${loan.emprunteur ? ` — ${loan.emprunteur}` : ''}"
      @click=${onClick}
    >
      <img
        class="book-tile-cover"
        src=${coverSrc}
        alt=""
        loading="lazy"
        @error=${onCoverError}
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
            style=${loan.extend_disabled ? 'background:#b71c1c' : 'background:#6a1b9a'}
            title=${loan.extend_disabled ? 'Désactivé' : 'Non prolongeable'}
            >✗</span
          >`
        : nothing}
      ${canMarkRead(loan) ? renderReadPill(loan, onToggleRead) : nothing}
    </button>
  `;
}

export function renderBookRow({ loan, onClick, onToggleRead }: BookOptions): TemplateResult {
  const chip = getDaysChip(loan.days_left);
  const coverSrc = loan.cover_url || PLACEHOLDER_SVG;

  return html`
    <div class="book-row">
      <div class="book-cover-wrapper" @click=${onClick}>
        <img
          class="book-cover"
          src=${coverSrc}
          alt=""
          loading="lazy"
          @error=${onCoverError}
        />
      </div>
      <div class="book-info">
        <div class="book-title" title=${loan.titre}>${loan.titre}</div>
        <div class="book-date">Retour : ${loan.due_date_display}</div>
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
          ${loan.read
            ? html`<span class="badge-days badge-read" style="color:#1b5e20;background:#c8e6c9"
                >✓ Lu</span
              >`
            : nothing}
        </div>
      </div>
      ${canMarkRead(loan)
        ? html`<button
            class="book-row-read ${loan.read ? 'is-read' : ''}"
            aria-pressed=${loan.read ? 'true' : 'false'}
            title=${readLabel(loan)}
            @click=${onPillClick(onToggleRead)}
          >
            ${loan.read ? '✓' : '+'}
          </button>`
        : nothing}
    </div>
  `;
}
