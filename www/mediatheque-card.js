/**
 * Médiathèque de Veauche - Carte Lovelace Custom
 * Affiche les emprunts de la médiathèque par membre de la famille.
 */

const MONTHS_FR = [
  '', 'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
];

const PLACEHOLDER_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='52' height='76' viewBox='0 0 52 76'%3E%3Crect width='52' height='76' fill='%23e0e0e0' rx='4'/%3E%3Ctext x='26' y='42' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%239e9e9e'%3E%F0%9F%93%96%3C/text%3E%3C/svg%3E`;

function getStatusBadge(daysLeft) {
  if (daysLeft < 0) return { label: '✗ En retard', color: '#b71c1c', bg: '#ffcdd2' };
  if (daysLeft <= 3) return { label: '⚠ Urgent', color: '#d84315', bg: '#ffe0b2' };
  if (daysLeft <= 7) return { label: '⚡ Bientôt', color: '#f57f17', bg: '#fff9c4' };
  return { label: '✓ OK', color: '#2e7d32', bg: '#c8e6c9' };
}

function getDaysChip(daysLeft) {
  if (daysLeft < 0) return { text: `${Math.abs(daysLeft)}j de retard`, color: '#b71c1c', bg: '#ffcdd2' };
  if (daysLeft === 0) return { text: "Aujourd'hui", color: '#d84315', bg: '#ffe0b2' };
  return { text: `${daysLeft}j restants`, color: '#2e7d32', bg: '#c8e6c9' };
}

class MediathequeCard extends HTMLElement {
  set hass(hass) {
    this._hass = hass;
    if (!this._config) return;
    this._render();
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('Vous devez définir une entité (entity)');
    }
    this._config = config;
    this._rendered = false;
  }

  getCardSize() {
    return 4;
  }

  _render() {
    const entityId = this._config.entity;
    const state = this._hass.states[entityId];

    if (!state) {
      this.innerHTML = `<ha-card><div style="padding:16px">Entité introuvable : ${entityId}</div></ha-card>`;
      return;
    }

    const attrs = state.attributes;
    const membres = attrs.membres || {};
    const compte = attrs.compte || '';
    const total = attrs.total || 0;
    const title = this._config.title || 'Médiathèque de Veauche';

    // Sort members: account holder first, then alphabetically
    const sortedMembers = Object.keys(membres).sort((a, b) => {
      if (a === compte) return -1;
      if (b === compte) return 1;
      return a.localeCompare(b);
    });

    let html = `
      <ha-card>
        <style>
          .mediatheque-header {
            padding: 16px 16px 8px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .mediatheque-title {
            font-size: 1.1em;
            font-weight: 500;
            color: var(--primary-text-color);
          }
          .mediatheque-total {
            background: var(--primary-color);
            color: var(--text-primary-color, #fff);
            border-radius: 12px;
            padding: 2px 10px;
            font-size: 0.85em;
            font-weight: 600;
          }
          .member-section {
            padding: 8px 16px;
          }
          .member-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
            padding-bottom: 4px;
            border-bottom: 1px solid var(--divider-color, #e0e0e0);
          }
          .member-icon {
            font-size: 1.1em;
          }
          .member-name {
            font-weight: 500;
            color: var(--primary-text-color);
          }
          .member-count {
            background: var(--secondary-background-color, #f5f5f5);
            border-radius: 10px;
            padding: 1px 8px;
            font-size: 0.8em;
            color: var(--secondary-text-color);
          }
          .book-row {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 8px 0;
            border-bottom: 1px solid var(--divider-color, rgba(0,0,0,0.06));
          }
          .book-row:last-child {
            border-bottom: none;
          }
          .book-cover {
            width: 52px;
            height: 76px;
            border-radius: 4px;
            object-fit: cover;
            flex-shrink: 0;
            background: var(--secondary-background-color, #f0f0f0);
          }
          .book-info {
            flex: 1;
            min-width: 0;
          }
          .book-title {
            font-size: 0.9em;
            font-weight: 500;
            color: var(--primary-text-color);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .book-date {
            font-size: 0.8em;
            color: var(--secondary-text-color);
            margin-top: 2px;
          }
          .book-badges {
            display: flex;
            gap: 6px;
            margin-top: 4px;
            flex-wrap: wrap;
          }
          .badge-status {
            font-size: 0.72em;
            padding: 2px 8px;
            border-radius: 10px;
            font-weight: 600;
            white-space: nowrap;
          }
          .badge-days {
            font-size: 0.72em;
            padding: 2px 8px;
            border-radius: 10px;
            font-weight: 500;
            white-space: nowrap;
          }
          .book-cover-wrapper {
            position: relative;
            flex-shrink: 0;
            cursor: pointer;
          }
          .book-cover-preview {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 999;
            background: rgba(0,0,0,0.7);
            align-items: center;
            justify-content: center;
          }
          .book-cover-preview.active {
            display: flex;
          }
          .book-cover-preview img {
            max-width: 80vw;
            max-height: 80vh;
            border-radius: 8px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.5);
            object-fit: contain;
          }
          .empty-state {
            padding: 24px 16px;
            text-align: center;
            color: var(--secondary-text-color);
          }
        </style>

        <div class="mediatheque-header">
          <span class="mediatheque-title">${title}</span>
          <span class="mediatheque-total">${total} emprunt${total > 1 ? 's' : ''}</span>
        </div>
    `;

    if (sortedMembers.length === 0) {
      html += `<div class="empty-state">Aucun emprunt en cours</div>`;
    }

    for (const member of sortedMembers) {
      const loans = membres[member] || [];
      const icon = member === compte ? '👤' : '👦';

      // Sort by urgency: overdue first, then by days_left ascending
      const sorted = [...loans].sort((a, b) => a.days_left - b.days_left);

      html += `
        <div class="member-section">
          <div class="member-header">
            <span class="member-icon">${icon}</span>
            <span class="member-name">${member}</span>
            <span class="member-count">${loans.length}</span>
          </div>
      `;

      for (const loan of sorted) {
        const status = getStatusBadge(loan.days_left);
        const chip = getDaysChip(loan.days_left);
        const coverSrc = loan.cover_url || PLACEHOLDER_SVG;

        html += `
          <div class="book-row">
            <div class="book-cover-wrapper" data-cover="${coverSrc}">
              <img class="book-cover" src="${coverSrc}" alt="" loading="lazy"
                   onerror="this.src='${PLACEHOLDER_SVG}'" />
            </div>
            <div class="book-info">
              <div class="book-title" title="${loan.titre}">${loan.titre}</div>
              <div class="book-date">Retour : ${loan.due_date_display}</div>
              <div class="book-badges">
                <span class="badge-status" style="color:${status.color};background:${status.bg}">${status.label}</span>
                <span class="badge-days" style="color:${chip.color};background:${chip.bg}">${chip.text}</span>
              </div>
            </div>
          </div>
        `;
      }

      html += `</div>`;
    }

    html += `
        <div class="book-cover-preview" id="cover-preview">
          <img src="" alt="" />
        </div>
      </ha-card>`;
    this.innerHTML = html;

    // Cover click to preview
    const preview = this.querySelector('#cover-preview');
    const previewImg = preview.querySelector('img');

    this.querySelectorAll('.book-cover-wrapper').forEach(wrapper => {
      wrapper.addEventListener('click', (e) => {
        e.stopPropagation();
        const src = wrapper.dataset.cover;
        if (preview.classList.contains('active')) {
          preview.classList.remove('active');
        } else {
          previewImg.src = src;
          preview.classList.add('active');
        }
      });
    });

    preview.addEventListener('click', () => {
      preview.classList.remove('active');
    });
  }
}

customElements.define('mediatheque-card', MediathequeCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'mediatheque-card',
  name: 'Médiathèque de Veauche',
  description: 'Affiche les emprunts de la médiathèque de Veauche par membre',
});
