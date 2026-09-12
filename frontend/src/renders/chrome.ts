/** En-tête, loader et bandeau de péremption.

Fonctions pures : elles reçoivent tout ce dont elles ont besoin, y compris les
gestionnaires d'événements. Les paramètres multiples passent par un objet nommé
— deux chaînes adjacentes dans une signature positionnelle s'inversent sans que
rien ne le signale, ni le typage ni le linter.
*/
import { html, nothing, type TemplateResult } from 'lit';
import { classMap } from 'lit/directives/class-map.js';

import type { FreshnessAttributes } from '../types.js';

export interface LoaderOptions {
  title: string;
  message?: string;
}

export function renderLoader({
  title,
  message = 'Chargement…',
}: LoaderOptions): TemplateResult {
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

export function renderStaleNotice(
  attrs: FreshnessAttributes
): TemplateResult | typeof nothing {
  // fetch_ok=false signifie que le coordinator est retombé sur son cache : les
  // entités restent disponibles et les données paraissent fraîches alors que
  // la liste date du dernier scrape — un livre rendu depuis y figure encore.
  // Les délais, eux, sont recalculés à chaque cycle côté intégration
  // (`dates.with_days_left`) : ce sont les emprunts qui sont périmés, pas les
  // décomptes.
  if (attrs.fetch_ok !== false) return nothing;

  const lastSuccess = attrs.last_success ? new Date(attrs.last_success) : null;
  const stamp = lastSuccess?.getTime();
  // Tant que la dernière synchro date d'aujourd'hui, l'écart avec la réalité
  // reste celui d'une journée de bibliothèque : pas de quoi alerter.
  if (stamp !== undefined && !Number.isNaN(stamp)) {
    if (lastSuccess!.toDateString() === new Date().toDateString()) return nothing;
  }

  const since =
    stamp === undefined || Number.isNaN(stamp)
      ? 'date inconnue'
      : lastSuccess!.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
  return html`
    <div class="mc-stale" role="status">
      <span>⚠</span>
      <span>Synchronisation en échec — liste des emprunts du ${since}</span>
    </div>
  `;
}

export interface HeaderOptions {
  title: string;
  badgeText: string;
  highlight: boolean;
  cardId: string;
  onBarcodeClick: () => void;
}

export function renderHeader({
  title,
  badgeText,
  highlight,
  cardId,
  onBarcodeClick,
}: HeaderOptions): TemplateResult {
  return html`
    <div class="mediatheque-header">
      <span class="mediatheque-title">${title}</span>
      <span class="header-right">
        <span class=${classMap({ 'mediatheque-total': true, highlight })}>${badgeText}</span>
        ${cardId
          ? html`<button class="mc-barcode-btn" title="Ma carte" @click=${onBarcodeClick}>
              |||
            </button>`
          : nothing}
      </span>
    </div>
  `;
}
