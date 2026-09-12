/** Modales : détail d'un prêt, confirmation de prolongation, code-barres. */
import { html, nothing, type TemplateResult } from 'lit';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';

import { generateCode39Svg } from '../helpers/barcode.js';
import type { Loan } from '../types.js';
import { PLACEHOLDER_SVG } from './shared.js';

export interface DetailModalOptions {
  loan: Loan;
  onOverlayClick: (e: Event) => void;
  onClose: () => void;
  onExtend: () => void;
}

export function renderDetailModal({
  loan,
  onOverlayClick,
  onClose,
  onExtend,
}: DetailModalOptions): TemplateResult {
  const cover = loan.cover_url || PLACEHOLDER_SVG;
  return html`
    <div class="mc-modal-overlay active" @click=${onOverlayClick}>
      <div class="mc-modal">
        <div class="mc-modal-body mc-modal-body-top">
          <div class="mc-modal-title">${loan.titre}</div>
        </div>
        <img class="mc-modal-cover" src=${cover} alt="" />
        <div class="mc-modal-body">
          ${loan.isbn ? html`<div class="mc-modal-isbn">ISBN : ${loan.isbn}</div>` : nothing}
          <div class="mc-modal-actions">
            <button class="mc-modal-btn mc-modal-btn-close" @click=${onClose}>Fermer</button>
            ${loan.can_extend
              ? html`<button class="mc-modal-btn mc-modal-btn-extend" @click=${onExtend}>
                  Prolonger
                </button>`
              : nothing}
          </div>
        </div>
      </div>
    </div>
  `;
}

export interface ConfirmModalOptions {
  loan: Loan;
  onOverlayClick: (e: Event) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export function renderConfirmModal({
  loan,
  onOverlayClick,
  onCancel,
  onConfirm,
}: ConfirmModalOptions): TemplateResult {
  return html`
    <div class="mc-confirm-overlay active" @click=${onOverlayClick}>
      <div class="mc-confirm-dialog">
        <div class="mc-confirm-icon">↻</div>
        <div class="mc-confirm-title">Prolonger cet emprunt ?</div>
        <div class="mc-confirm-text">${loan.titre}</div>
        <div class="mc-confirm-actions">
          <button class="mc-modal-btn-cancel" @click=${onCancel}>Annuler</button>
          <button class="mc-modal-btn-confirm" @click=${onConfirm}>Confirmer</button>
        </div>
      </div>
    </div>
  `;
}

export interface BarcodeModalOptions {
  cardId: string;
  onOverlayClick: (e: Event) => void;
  onClose: () => void;
}

export function renderBarcodeModal({
  cardId,
  onOverlayClick,
  onClose,
}: BarcodeModalOptions): TemplateResult {
  // unsafeSVG n'est sûr que parce que generateCode39Svg filtre son entrée par
  // table blanche et n'interpole ensuite que des entiers calculés.
  const svg = generateCode39Svg(cardId);
  return html`
    <div class="mc-barcode-overlay active" @click=${onOverlayClick}>
      <div class="mc-barcode-dialog">
        <h3>Ma carte</h3>
        <div class="mc-barcode-id">${cardId}</div>
        <div class="mc-barcode-svg">${unsafeSVG(svg)}</div>
        <button class="mc-barcode-close" @click=${onClose}>Fermer</button>
      </div>
    </div>
  `;
}
