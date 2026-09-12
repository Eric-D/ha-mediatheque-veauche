/** En-tête, loader et bandeau de péremption.

Fonctions pures : elles reçoivent tout ce dont elles ont besoin, y compris les
gestionnaires d'événements. Les paramètres multiples passent par un objet nommé
— deux chaînes adjacentes dans une signature positionnelle s'inversent sans que
rien ne le signale, ni le typage ni le linter.
*/
import { html, nothing, type TemplateResult } from 'lit';
import { classMap } from 'lit/directives/class-map.js';

import type { FreshnessAttributes } from '../types.js';

export function renderLoader(title: string, message = 'Chargement…'): TemplateResult {
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
  // days_left est figé à la date du dernier scrape.
  if (attrs.fetch_ok !== false) return nothing;

  const lastSuccess = attrs.last_success ? new Date(attrs.last_success) : null;
  const stamp = lastSuccess?.getTime();
  // Ce qui rend days_left faux n'est pas l'écoulement de N heures, c'est le
  // passage de minuit : tant que la dernière synchro date d'aujourd'hui, les
  // délais affichés restent justes même si le dernier fetch a échoué.
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
      <span>Synchronisation en échec — données du ${since}, délais non à jour</span>
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
