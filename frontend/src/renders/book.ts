/** Rendu d'un prêt : tuile du mode couvertures, ligne du mode liste. */
import { html, nothing, type TemplateResult } from 'lit';

import { getDaysChip } from '../helpers/days-chip.js';
import type { Loan } from '../types.js';
import { PLACEHOLDER_SVG, onCoverError } from './shared.js';

export function renderTile(loan: Loan, onClick: () => void): TemplateResult {
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
      class="book-tile"
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
    </button>
  `;
}

export function renderBookRow(loan: Loan, onClick: () => void): TemplateResult {
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
        </div>
      </div>
    </div>
  `;
}
