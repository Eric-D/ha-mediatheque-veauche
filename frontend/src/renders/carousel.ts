/** Mode « carousel » : une bande horizontale de couvertures, sans en-tête.

Conçu pour une tablette murale, où la hauteur est la ressource rare : la carte
tient en une centaine de pixels là où le mode couvertures en prend plus du
double.

Le défilement est **natif** (`overflow-x` + `scroll-snap`), sans aucune
librairie : le bundle ne doit porter aucune dépendance externe, la carte devant
fonctionner en WebView Android hors CDN.

La tuile reprend la logique du mode couvertures — couverture, badge de délai,
tap vers la fiche détaillée — mais pas son rendu : la palette du badge, le
marqueur « lu » et les dimensions diffèrent, et une fonction unique couvrant
les deux demanderait quatre drapeaux. Ce qui est réellement commun —
l'`<img>` et son repli — vit dans `shared.ts`.
*/
import { html, nothing, type TemplateResult } from 'lit';

import { getDaysChip } from '../helpers/days-chip.js';
import type { BadgeType, Loan } from '../types.js';
import { renderCoverImage } from './shared.js';

/** Proportion d'une couverture de livre. 52 × 76 à la hauteur par défaut. */
export const COVER_RATIO = 0.68;

/** Bornes de `cover_height`. En dessous de 56 px une couverture n'est plus
    reconnaissable ; au-delà de 120 px le carousel perd sa raison d'être, qui
    est de tenir en une bande basse. */
export const COVER_HEIGHT_DEFAULT = 76;
export const COVER_HEIGHT_MIN = 56;
export const COVER_HEIGHT_MAX = 120;

export function coverWidth(height: number): number {
  return Math.round(height * COVER_RATIO);
}

export interface CarouselBadge {
  text: string;
  bg: string;
  fg: string;
}

/** Palette du carousel, plus dense que celle de `days-chip`.

    Fonds pleins et texte clair plutôt que les pastels des modes liste et
    couvertures : à 10 px sur une vignette de 52 px, un pastel ne se détache
    pas de la couverture. Tous les couples dépassent 4,5:1.

    Les seuils, eux, ne sont **pas** recalculés : ils viennent de `getDaysChip`,
    seule source de vérité. Les redéfinir ici ferait diverger le carousel du
    filtre `badges`, qui s'appuie sur le même type. */
const BADGE_PALETTE: Record<BadgeType, { bg: string; fg: string }> = {
  overdue: { bg: '#d32f2f', fg: '#ffffff' },
  today: { bg: '#e65100', fg: '#ffffff' },
  urgent: { bg: '#e65100', fg: '#ffffff' },
  soon: { bg: '#f9a825', fg: '#1c1c1c' },
  ok: { bg: '#2e7d32', fg: '#ffffff' },
  not_extendable: { bg: '#6a1b9a', fg: '#ffffff' },
  unknown: { bg: '#3a3a3a', fg: '#e0e0e0' },
};

/** Type affiché par le badge, qui n'est pas tout à fait celui du délai.

    `getDaysChip` ne classe que par échéance et ne renvoie jamais
    `not_extendable`, qui se lit sur le prêt lui-même — même écart que dans le
    filtre `badges` de la carte.

    Il ne remplace que le type `ok`, le seul qui dise « rien à faire ». Un
    livre à rendre demain et non prolongeable reste orange : la couleur sert à
    dire quand agir, et la masquer derrière le violet perdrait l'urgence. */
export function badgeTypeFor(loan: Loan): BadgeType {
  const type = getDaysChip(loan.days_left).type;
  if (type === 'ok' && (loan.extended || loan.extend_disabled)) {
    return 'not_extendable';
  }
  return type;
}

/** Libellé court du badge, propre au carousel.

    Les modes liste et couvertures gardent les leurs : les changer serait une
    régression visuelle sur des cartes déjà installées. Ici la place autorise
    un mot là où la tuile du mode couvertures se contentait d'un glyphe — « ! »
    pour aujourd'hui ne dit rien à qui ne connaît pas la convention. */
export function badgeTextFor(loan: Loan, type: BadgeType): string {
  const days = loan.days_left;
  if (type === 'unknown' || typeof days !== 'number' || !Number.isFinite(days)) return '?';
  if (type === 'overdue') return 'Retard';
  if (type === 'today') return 'Auj.';
  return `${days} j`;
}

export function carouselBadge(loan: Loan, hideOkBadges: boolean): CarouselBadge | null {
  const type = badgeTypeFor(loan);
  // Le masquage porte sur le type affiché : un livre « ok » mais non
  // prolongeable est devenu `not_extendable`, et cette information-là mérite
  // de rester visible.
  if (hideOkBadges && type === 'ok') return null;
  return { text: badgeTextFor(loan, type), ...BADGE_PALETTE[type] };
}

/** Tri d'affichage : le plus urgent d'abord.

    `days_left` à null part en fin de liste et non en tête : une échéance
    illisible n'est pas une urgence, et la trier comme un retard remplirait le
    début de la bande de livres dont on ne sait rien.

    Départage par emprunteur puis titre pour que l'ordre soit stable d'un
    rafraîchissement à l'autre — sans quoi les vignettes changeraient de place
    à chaque cycle, sur une carte qu'on regarde en passant. */
export function sortForCarousel(loans: Loan[]): Loan[] {
  const rank = (loan: Loan): number =>
    typeof loan.days_left === 'number' && Number.isFinite(loan.days_left)
      ? loan.days_left
      : Number.MAX_SAFE_INTEGER;
  return [...loans].sort(
    (a, b) =>
      rank(a) - rank(b) ||
      (a.emprunteur ?? '').localeCompare(b.emprunteur ?? '') ||
      (a.titre ?? '').localeCompare(b.titre ?? '')
  );
}

/** Libellé du bouton code-barres, compteur compris.

    Le compteur est une bulle `aria-hidden` : un lecteur d'écran qui
    l'annoncerait séparément dirait « 3 » sans dire de quoi. Il est donc porté
    par le libellé du bouton, seul endroit où il a un sens.

    Le pluriel est explicite : « 1 livres » sur une carte qu'on lit tous les
    jours finit par se voir. */
export function barcodeLabel(count: number): string {
  const base = 'Afficher la carte de bibliothèque';
  if (count <= 0) return base;
  return `${base} — ${count} livre${count > 1 ? 's' : ''}`;
}

export interface CarouselOptions {
  loans: Loan[];
  cardId: string;
  coverHeight: number;
  hideOkBadges: boolean;
  onDetail: (loan: Loan) => void;
  onBarcode: () => void;
}

function renderCarouselTile(
  loan: Loan,
  coverHeight: number,
  hideOkBadges: boolean,
  onDetail: (loan: Loan) => void
): TemplateResult {
  const badge = carouselBadge(loan, hideOkBadges);
  const label = [loan.titre, loan.emprunteur, loan.due_date_display]
    .filter((part) => typeof part === 'string' && part.length > 0)
    .join(' — ');

  return html`
    <button
      class="mc-car-tile ${loan.read ? 'is-read' : ''}"
      style="width:${coverWidth(coverHeight)}px;height:${coverHeight}px"
      aria-label=${label}
      @click=${(): void => onDetail(loan)}
    >
      ${renderCoverImage(loan.cover_url, 'mc-car-cover')}
      ${badge
        ? html`<span
            class="mc-car-badge"
            style="background:${badge.bg};color:${badge.fg}"
            aria-hidden="true"
            >${badge.text}</span
          >`
        : nothing}
    </button>
  `;
}

export function renderCarousel({
  loans,
  cardId,
  coverHeight,
  hideOkBadges,
  onDetail,
  onBarcode,
}: CarouselOptions): TemplateResult {
  const sorted = sortForCarousel(loans);

  return html`
    <div class="mc-car-row" style="padding:12px;gap:12px">
      ${sorted.length === 0
        ? html`<div class="mc-car-empty">Aucun livre à afficher</div>`
        : html`<div class="mc-car-strip" style="height:${coverHeight}px">
            ${sorted.map((loan) =>
              renderCarouselTile(loan, coverHeight, hideOkBadges, onDetail)
            )}
          </div>`}
      ${cardId
        ? html`<button
            class="mc-car-barcode"
            style="height:${coverHeight}px"
            aria-label=${barcodeLabel(sorted.length)}
            @click=${onBarcode}
          >
            <ha-icon icon="mdi:barcode"></ha-icon>
            ${sorted.length > 0
              ? html`<span class="mc-car-count" aria-hidden="true">${sorted.length}</span>`
              : nothing}
          </button>`
        : nothing}
    </div>
  `;
}
