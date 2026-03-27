/**
 * Médiathèque de Veauche - Carte Lovelace Custom
 * Affiche les emprunts de la médiathèque par membre de la famille.
 */

if (window.MEDIATHEQUE_CARD_LOADED) { /* already loaded */ } else {
window.MEDIATHEQUE_CARD_LOADED = true;

const MEDIATHEQUE_CARD_VERSION = '1.6.3';
console.info(`%c MEDIATHEQUE-CARD %c ${MEDIATHEQUE_CARD_VERSION} IS INSTALLED `, 'color: white; background: #2e7d32; font-weight: bold;', 'color: #2e7d32; background: #c8e6c9; font-weight: bold;');

function _mcLog(level, card, msg, ...args) {
  const prefix = `%c MEDIATHEQUE-CARD %c [${card}]`;
  const styles = ['color: white; background: #2e7d32; font-weight: bold;', 'color: #2e7d32; font-weight: bold;'];
  console[level](prefix + ' ' + msg, ...styles, ...args);
}

const MONTHS_FR = [
  '', 'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
];

const PLACEHOLDER_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='52' height='76' viewBox='0 0 52 76'%3E%3Crect width='52' height='76' fill='%23e0e0e0' rx='4'/%3E%3Ctext x='26' y='42' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%239e9e9e'%3E%F0%9F%93%96%3C/text%3E%3C/svg%3E`;

function getDaysChip(daysLeft) {
  if (daysLeft < 0) return { text: `✗ ${Math.abs(daysLeft)}j de retard`, color: '#b71c1c', bg: '#ffcdd2' };
  if (daysLeft === 0) return { text: "⚠ Aujourd'hui", color: '#d84315', bg: '#ffe0b2' };
  if (daysLeft <= 3) return { text: `⚠ ${daysLeft}j restants`, color: '#d84315', bg: '#ffe0b2' };
  if (daysLeft <= 7) return { text: `⚡ ${daysLeft}j restants`, color: '#f57f17', bg: '#fff9c4' };
  return { text: `✓ ${daysLeft}j restants`, color: '#2e7d32', bg: '#c8e6c9' };
}

// Code 128B barcode encoder → SVG
const CODE128B_PATTERNS = [
  '11011001100','11001101100','11001100110','10010011000','10010001100',
  '10001001100','10011001000','10011000100','10001100100','11001001000',
  '11001000100','11000100100','10110011100','10011011100','10011001110',
  '10111001100','10011101100','10011100110','11001110010','11001011100',
  '11001001110','11011100100','11001110100','11100101100','11100100110',
  '10110001100','10001101100','10001100110','11010001100','11000101100',
  '11000100110','10110001000','10001101000','10001100010','11010001000',
  '11000101000','11000100010','10110111000','10110001110','10001101110',
  '10111011000','10111000110','10001110110','11101011000','11101000110',
  '11100010110','11011101000','11011100010','11000111010','11101101000',
  '11101100010','11100011010','11101111010','11001000010','11110001010',
  '10100110000','10100001100','10010110000','10010000110','10000101100',
  '10000100110','10110010000','10110000100','10011010000','10011000010',
  '10000110100','10000110010','11000010010','11001010000','11110111010',
  '11000010100','10001111010','10100111100','10010111100','10010011110',
  '10111100100','10011110100','10011110010','11110100100','11110010100',
  '11110010010','11011011110','11011110110','11110110110','10101111000',
  '10100011110','10001011110','10111101000','10111100010','11110101000',
  '11110100010','10111011110','10111101110','11101011110','11110101110',
  '11010000100','11010010000','11010011100','1100011101011',
];

function generateCode128Svg(text, height = 80) {
  const codes = [];
  const startCode = 104; // Start B
  codes.push(startCode);
  let checksum = startCode;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i) - 32;
    codes.push(code);
    checksum += code * (i + 1);
  }
  codes.push(checksum % 103);
  codes.push(106); // Stop

  let binary = '';
  for (const c of codes) binary += CODE128B_PATTERNS[c];

  const barWidth = 2;
  const width = binary.length * barWidth;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">`;
  for (let i = 0; i < binary.length; i++) {
    if (binary[i] === '1') {
      svg += `<rect x="${i * barWidth}" y="0" width="${barWidth}" height="${height}" fill="#000"/>`;
    }
  }
  svg += `</svg>`;
  return svg;
}

function getModalStyles() {
  return `
    .mc-modal-overlay {
      display: none;
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      z-index: 999;
      background: rgba(0,0,0,0.7);
      align-items: center;
      justify-content: center;
      padding: 16px;
      box-sizing: border-box;
    }
    .mc-modal-overlay.active {
      display: flex;
    }
    .mc-modal {
      background: var(--card-background-color, #fff);
      border-radius: 12px;
      max-width: 360px;
      width: 100%;
      max-height: 85vh;
      overflow-y: auto;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    }
    .mc-modal-cover {
      width: 100%;
      max-height: 300px;
      object-fit: contain;
      background: var(--secondary-background-color, #f0f0f0);
    }
    .mc-modal-body {
      padding: 16px;
    }
    .mc-modal-body-top {
      padding-bottom: 0;
    }
    .mc-modal-title {
      font-size: 1.1em;
      font-weight: 600;
      color: var(--primary-text-color);
      margin-bottom: 8px;
    }
    .mc-modal-isbn {
      font-size: 0.85em;
      color: var(--secondary-text-color);
      margin-bottom: 12px;
    }
    .mc-modal-actions {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }
    .mc-modal-btn {
      flex: 1;
      padding: 10px 16px;
      border: none;
      border-radius: 8px;
      font-size: 0.9em;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .mc-modal-btn:active { opacity: 0.7; }
    .mc-modal-btn-close {
      background: var(--secondary-background-color, #e0e0e0);
      color: var(--primary-text-color);
    }
    .mc-modal-btn-extend {
      background: #1565c0;
      color: #fff;
    }
    .mc-confirm-overlay {
      display: none;
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      z-index: 1000;
      background: rgba(0,0,0,0.75);
      align-items: center;
      justify-content: center;
      padding: 16px;
      box-sizing: border-box;
    }
    .mc-confirm-overlay.active {
      display: flex;
    }
    .mc-confirm-dialog {
      background: var(--card-background-color, #fff);
      border-radius: 12px;
      max-width: 320px;
      width: 100%;
      padding: 24px;
      text-align: center;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    }
    .mc-confirm-icon {
      font-size: 2.5em;
      margin-bottom: 12px;
    }
    .mc-confirm-title {
      font-size: 1em;
      font-weight: 600;
      color: var(--primary-text-color);
      margin-bottom: 4px;
    }
    .mc-confirm-text {
      font-size: 0.85em;
      color: var(--secondary-text-color);
      margin-bottom: 16px;
    }
    .mc-confirm-actions {
      display: flex;
      gap: 8px;
    }
    .mc-modal-btn-cancel {
      flex: 1;
      background: var(--secondary-background-color, #e0e0e0);
      color: var(--primary-text-color);
      padding: 10px 16px;
      border: none;
      border-radius: 8px;
      font-size: 0.9em;
      font-weight: 600;
      cursor: pointer;
    }
    .mc-modal-btn-confirm {
      flex: 1;
      background: #1565c0;
      color: #fff;
      padding: 10px 16px;
      border: none;
      border-radius: 8px;
      font-size: 0.9em;
      font-weight: 600;
      cursor: pointer;
    }
    .mc-barcode-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 2px 6px;
      font-size: 1.2em;
      color: var(--primary-text-color);
      opacity: 0.6;
      transition: opacity 0.2s;
    }
    .mc-barcode-btn:hover { opacity: 1; }
    .mc-barcode-overlay {
      display: none;
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      z-index: 999;
      background: rgba(0,0,0,0.7);
      align-items: center;
      justify-content: center;
      padding: 16px;
      box-sizing: border-box;
    }
    .mc-barcode-overlay.active {
      display: flex;
    }
    .mc-barcode-dialog {
      background: #fff;
      border-radius: 12px;
      max-width: 360px;
      width: 100%;
      padding: 24px;
      text-align: center;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    }
    .mc-barcode-dialog h3 {
      margin: 0 0 4px;
      font-size: 1em;
      font-weight: 600;
      color: #333;
    }
    .mc-barcode-dialog .mc-barcode-id {
      font-size: 0.85em;
      color: #666;
      margin-bottom: 16px;
    }
    .mc-barcode-dialog svg {
      width: 100%;
      height: auto;
    }
    .mc-barcode-dialog .mc-barcode-close {
      margin-top: 16px;
      padding: 8px 24px;
      border: none;
      border-radius: 8px;
      background: #e0e0e0;
      color: #333;
      font-weight: 600;
      cursor: pointer;
    }
  `;
}

function getModalHtml(id) {
  return `
    <div class="mc-modal-overlay" id="${id}">
      <div class="mc-modal">
        <div class="mc-modal-body mc-modal-body-top">
          <div class="mc-modal-title"></div>
        </div>
        <img class="mc-modal-cover" src="" alt="" />
        <div class="mc-modal-body">
          <div class="mc-modal-isbn"></div>
          <div class="mc-modal-actions">
            <button class="mc-modal-btn mc-modal-btn-close">Fermer</button>
            <button class="mc-modal-btn mc-modal-btn-extend" style="display:none">Prolonger</button>
          </div>
        </div>
      </div>
    </div>
    <div class="mc-confirm-overlay" id="${id}-confirm">
      <div class="mc-confirm-dialog">
        <div class="mc-confirm-icon">↻</div>
        <div class="mc-confirm-title">Prolonger cet emprunt ?</div>
        <div class="mc-confirm-text"></div>
        <div class="mc-confirm-actions">
          <button class="mc-modal-btn-cancel">Annuler</button>
          <button class="mc-modal-btn-confirm">Confirmer</button>
        </div>
      </div>
    </div>
  `;
}

function escapeAttr(str) {
  return (str || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function bindModal(root, modalId) {
  const overlay = root.querySelector(`#${modalId}`);
  const coverImg = overlay.querySelector('.mc-modal-cover');
  const titleEl = overlay.querySelector('.mc-modal-title');
  const isbnEl = overlay.querySelector('.mc-modal-isbn');
  const extendBtn = overlay.querySelector('.mc-modal-btn-extend');
  const closeBtn = overlay.querySelector('.mc-modal-btn-close');

  const confirmOverlay = root.querySelector(`#${modalId}-confirm`);
  const confirmText = confirmOverlay.querySelector('.mc-confirm-text');
  const cancelBtn = confirmOverlay.querySelector('.mc-modal-btn-cancel');
  const confirmBtn = confirmOverlay.querySelector('.mc-modal-btn-confirm');

  let currentExtendUrl = null;
  let currentTitle = '';

  function closeDetail() {
    overlay.classList.remove('active');
    currentExtendUrl = null;
  }

  function closeConfirm() {
    confirmOverlay.classList.remove('active');
  }

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeDetail();
  });
  closeBtn.addEventListener('click', closeDetail);

  extendBtn.addEventListener('click', () => {
    confirmText.textContent = currentTitle;
    confirmOverlay.classList.add('active');
  });

  confirmOverlay.addEventListener('click', (e) => {
    if (e.target === confirmOverlay) closeConfirm();
  });
  cancelBtn.addEventListener('click', closeConfirm);

  confirmBtn.addEventListener('click', () => {
    if (currentExtendUrl) {
      window.open(currentExtendUrl, '_blank');
      closeConfirm();
      closeDetail();
    }
  });

  root.querySelectorAll('.book-cover-wrapper').forEach(wrapper => {
    wrapper.addEventListener('click', (e) => {
      e.stopPropagation();
      coverImg.src = wrapper.dataset.cover || '';
      currentTitle = wrapper.dataset.title || '';
      titleEl.textContent = currentTitle;
      const isbn = wrapper.dataset.isbn;
      if (isbn) {
        isbnEl.textContent = `ISBN : ${isbn}`;
        isbnEl.style.display = '';
      } else {
        isbnEl.textContent = '';
        isbnEl.style.display = 'none';
      }
      currentExtendUrl = wrapper.dataset.extendUrl || null;
      extendBtn.style.display = (wrapper.dataset.canExtend === 'true') ? '' : 'none';
      overlay.classList.add('active');
    });
  });
}

function isModalOpen(root) {
  return !!(root.querySelector('.mc-modal-overlay.active') || root.querySelector('.mc-confirm-overlay.active') || root.querySelector('.mc-barcode-overlay.active'));
}

class MediathequeCard extends HTMLElement {
  set hass(hass) {
    this._hass = hass;
    if (!this._config) return;
    if (isModalOpen(this)) return;
    if (this._retryTimer) { clearTimeout(this._retryTimer); this._retryTimer = null; }
    try {
      this._render();
    } catch (e) {
      _mcLog('error', 'main', 'Render error: %o', e);
    }
  }

  setConfig(config) {
    if (!config.entity) {
      _mcLog('warn', 'main', 'Config sans entity, config reçue: %o — attente…', config);
      this._config = config;
      return;
    }
    _mcLog('info', 'main', 'Config OK, entity=%s, version=%s', config.entity, MEDIATHEQUE_CARD_VERSION);
    this._config = config;
    this._rendered = false;
  }

  _scheduleRetry() {
    if (this._retryTimer) return;
    this._retryCount = (this._retryCount || 0) + 1;
    if (this._retryCount > 10) return;
    const delay = Math.min(2000 * this._retryCount, 15000);
    _mcLog('info', 'main', 'Retry %d dans %dms…', this._retryCount, delay);
    this._retryTimer = setTimeout(() => {
      this._retryTimer = null;
      if (this._hass && this._config) {
        try { this._render(); } catch (e) { _mcLog('error', 'main', 'Retry render error: %o', e); }
      }
    }, delay);
  }

  getCardSize() {
    return 4;
  }

  _render() {
    const entityId = this._config.entity;
    if (!entityId) {
      _mcLog('warn', 'main', 'Pas d\'entity configurée, attente…');
      return;
    }
    const state = this._hass.states[entityId];

    const titre = this._config.title || 'Médiathèque de Veauche';

    // No state or unavailable: keep last render if available, schedule retry
    if (!state || state.state === 'unavailable' || state.state === 'unknown') {
      const reason = !state ? 'entity not found' : `state=${state.state}`;
      _mcLog('warn', 'main', '%s — %s', entityId, reason, this._lastHtml ? '(keeping last render)' : '(showing loader)');
      this._scheduleRetry();
      if (this._lastHtml) return;
      this.innerHTML = `
        <ha-card>
          <div class="mediatheque-header">
            <span class="mediatheque-title">${titre}</span>
          </div>
          <div style="padding:32px 16px;text-align:center">
            <div class="mediatheque-loader"></div>
            <div style="margin-top:12px;color:var(--secondary-text-color);font-size:0.9em">Chargement des emprunts...</div>
          </div>
          <style>
            .mediatheque-loader {
              width: 36px;
              height: 36px;
              border: 3px solid var(--divider-color, #e0e0e0);
              border-top: 3px solid var(--primary-color, #03a9f4);
              border-radius: 50%;
              margin: 0 auto;
              animation: mediatheque-spin 1s linear infinite;
            }
            @keyframes mediatheque-spin {
              to { transform: rotate(360deg); }
            }
          </style>
        </ha-card>`;
      return;
    }

    // State OK — reset retry counter
    this._retryCount = 0;

    const attrs = state.attributes;
    const membres = attrs.membres || {};
    const compte = attrs.compte || '';
    const total = attrs.total || 0;
    const title = titre;

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
          .badge-days {
            font-size: 0.75em;
            padding: 2px 8px;
            border-radius: 10px;
            font-weight: 600;
            white-space: nowrap;
          }
          .book-cover-wrapper {
            position: relative;
            flex-shrink: 0;
            cursor: pointer;
          }
          .empty-state {
            padding: 24px 16px;
            text-align: center;
            color: var(--secondary-text-color);
          }
          ${getModalStyles()}
        </style>

        <div class="mediatheque-header">
          <span class="mediatheque-title">${title}</span>
          <span style="display:flex;align-items:center;gap:6px">
            <span class="mediatheque-total">${total} emprunt${total > 1 ? 's' : ''}</span>
            ${this._config.card_id ? `<button class="mc-barcode-btn" id="mc-barcode-trigger" title="Ma carte">|||</button>` : ''}
          </span>
        </div>
    `;

    if (this._config.card_id) {
      const cardId = this._config.card_id;
      html += `
        <div class="mc-barcode-overlay" id="mc-barcode-modal">
          <div class="mc-barcode-dialog">
            <h3>Ma carte</h3>
            <div class="mc-barcode-id">${escapeAttr(cardId)}</div>
            ${generateCode128Svg(cardId)}
            <br><button class="mc-barcode-close">Fermer</button>
          </div>
        </div>
      `;
    }

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
        const chip = getDaysChip(loan.days_left);
        const coverSrc = loan.cover_url || PLACEHOLDER_SVG;

        html += `
          <div class="book-row">
            <div class="book-cover-wrapper"
                 data-cover="${escapeAttr(coverSrc)}"
                 data-title="${escapeAttr(loan.titre)}"
                 data-isbn="${escapeAttr(loan.isbn || '')}"
                 data-can-extend="${loan.can_extend ? 'true' : 'false'}"
                 data-extend-url="${escapeAttr(loan.extend_url || '')}">
              <img class="book-cover" src="${coverSrc}" alt="" loading="lazy"
                   onerror="this.src='${PLACEHOLDER_SVG}'" />
            </div>
            <div class="book-info">
              <div class="book-title" title="${escapeAttr(loan.titre)}">${loan.titre}</div>
              <div class="book-date">Retour : ${loan.due_date_display}</div>
              <div class="book-badges">
                <span class="badge-days" style="color:${chip.color};background:${chip.bg}">${chip.text}</span>
                ${loan.extended ? `<span class="badge-days" style="color:#6a1b9a;background:#e1bee7">✗ Non prolongeable</span>` : ''}
              </div>
            </div>
          </div>
        `;
      }

      html += `</div>`;
    }

    html += getModalHtml('mc-modal-main');
    html += `</ha-card>`;
    this.innerHTML = html;
    this._lastHtml = true;

    bindModal(this, 'mc-modal-main');

    // Barcode modal
    const bcTrigger = this.querySelector('#mc-barcode-trigger');
    const bcOverlay = this.querySelector('#mc-barcode-modal');
    if (bcTrigger && bcOverlay) {
      const bcClose = bcOverlay.querySelector('.mc-barcode-close');
      bcTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        bcOverlay.classList.add('active');
      });
      bcOverlay.addEventListener('click', (e) => {
        if (e.target === bcOverlay) bcOverlay.classList.remove('active');
      });
      bcClose.addEventListener('click', () => bcOverlay.classList.remove('active'));
    }
  }
}

customElements.define('mediatheque-card', MediathequeCard);


class MediathequeDueCard extends HTMLElement {
  set hass(hass) {
    this._hass = hass;
    if (!this._config) return;
    if (isModalOpen(this)) return;
    if (this._retryTimer) { clearTimeout(this._retryTimer); this._retryTimer = null; }
    try {
      this._render();
    } catch (e) {
      _mcLog('error', 'due', 'Render error: %o', e);
    }
  }

  setConfig(config) {
    if (!config.entity) {
      _mcLog('warn', 'due', 'Config sans entity, config reçue: %o — attente…', config);
      this._config = config;
      return;
    }
    _mcLog('info', 'due', 'Config OK, entity=%s, version=%s', config.entity, MEDIATHEQUE_CARD_VERSION);
    this._config = config;
  }

  _scheduleRetry() {
    if (this._retryTimer) return;
    this._retryCount = (this._retryCount || 0) + 1;
    if (this._retryCount > 10) return;
    const delay = Math.min(2000 * this._retryCount, 15000);
    _mcLog('info', 'due', 'Retry %d dans %dms…', this._retryCount, delay);
    this._retryTimer = setTimeout(() => {
      this._retryTimer = null;
      if (this._hass && this._config) {
        try { this._render(); } catch (e) { _mcLog('error', 'due', 'Retry render error: %o', e); }
      }
    }, delay);
  }

  getCardSize() {
    return 3;
  }

  _render() {
    const entityId = this._config.entity;
    if (!entityId) {
      _mcLog('warn', 'due', 'Pas d\'entity configurée, attente…');
      return;
    }
    const state = this._hass.states[entityId];

    const title = this._config.title || 'A rendre cette semaine';

    if (!state || state.state === 'unavailable' || state.state === 'unknown') {
      const reason = !state ? 'entity not found' : `state=${state.state}`;
      _mcLog('warn', 'due', '%s — %s %s', entityId, reason, this._lastHtml ? '(keeping last render)' : '(showing loader)');
      this._scheduleRetry();
      if (this._lastHtml) return;
      this.innerHTML = `
        <ha-card>
          <div class="mediatheque-header">
            <span class="mediatheque-title">${title}</span>
          </div>
          <div style="padding:32px 16px;text-align:center">
            <div class="mediatheque-loader"></div>
            <div style="margin-top:12px;color:var(--secondary-text-color);font-size:0.9em">Chargement...</div>
          </div>
          <style>
            .mediatheque-loader {
              width: 36px;
              height: 36px;
              border: 3px solid var(--divider-color, #e0e0e0);
              border-top: 3px solid var(--primary-color, #03a9f4);
              border-radius: 50%;
              margin: 0 auto;
              animation: mediatheque-spin 1s linear infinite;
            }
            @keyframes mediatheque-spin {
              to { transform: rotate(360deg); }
            }
          </style>
        </ha-card>`;
      return;
    }

    // State OK — reset retry counter
    this._retryCount = 0;

    const attrs = state.attributes;
    const livres = attrs.livres || [];
    const count = parseInt(state.state) || 0;

    // Get total from total_entity config or auto-detect
    let totalEmprunts = null;
    const totalEntityId = this._config.total_entity;
    if (totalEntityId && this._hass.states[totalEntityId]) {
      totalEmprunts = parseInt(this._hass.states[totalEntityId].state) || 0;
    } else {
      // Auto-detect: replace _due_week with _total
      const autoId = entityId.replace('_due_week', '_total');
      if (this._hass.states[autoId]) {
        totalEmprunts = parseInt(this._hass.states[autoId].state) || 0;
      }
    }

    const badgeText = totalEmprunts !== null ? `${count} / ${totalEmprunts}` : `${count}`;

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
            background: ${count > 0 ? '#f57f17' : 'var(--primary-color)'};
            color: ${count > 0 ? '#fff' : 'var(--text-primary-color, #fff)'};
            border-radius: 12px;
            padding: 2px 10px;
            font-size: 0.85em;
            font-weight: 600;
          }
          .book-row {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 8px 16px;
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
          .book-cover-wrapper {
            position: relative;
            flex-shrink: 0;
            cursor: pointer;
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
          .book-emprunteur {
            font-size: 0.75em;
            color: var(--secondary-text-color);
            margin-top: 1px;
          }
          .book-badges {
            display: flex;
            gap: 6px;
            margin-top: 4px;
            flex-wrap: wrap;
          }
          .badge-days {
            font-size: 0.75em;
            padding: 2px 8px;
            border-radius: 10px;
            font-weight: 600;
            white-space: nowrap;
          }
          .empty-state {
            padding: 24px 16px;
            text-align: center;
            color: var(--secondary-text-color);
          }
          ${getModalStyles()}
        </style>

        <div class="mediatheque-header">
          <span class="mediatheque-title">${title}</span>
          <span class="mediatheque-total">${badgeText}</span>
        </div>
    `;

    if (livres.length === 0) {
      html += `<div class="empty-state">Aucun livre à rendre cette semaine</div>`;
    }

    const sorted = [...livres].sort((a, b) => a.days_left - b.days_left);

    for (const loan of sorted) {
      const chip = getDaysChip(loan.days_left);
      const coverSrc = loan.cover_url || PLACEHOLDER_SVG;

      html += `
        <div class="book-row">
          <div class="book-cover-wrapper"
               data-cover="${escapeAttr(coverSrc)}"
               data-title="${escapeAttr(loan.titre)}"
               data-isbn="${escapeAttr(loan.isbn || '')}"
               data-can-extend="${loan.can_extend ? 'true' : 'false'}"
               data-extend-url="${escapeAttr(loan.extend_url || '')}">
            <img class="book-cover" src="${coverSrc}" alt="" loading="lazy"
                 onerror="this.src='${PLACEHOLDER_SVG}'" />
          </div>
          <div class="book-info">
            <div class="book-title" title="${escapeAttr(loan.titre)}">${loan.titre}</div>
            <div class="book-date">Retour : ${loan.due_date_display}</div>
            ${loan.emprunteur ? `<div class="book-emprunteur">Emprunteur : ${loan.emprunteur}</div>` : ''}
            <div class="book-badges">
              <span class="badge-days" style="color:${chip.color};background:${chip.bg}">${chip.text}</span>
              ${loan.extended ? `<span class="badge-days" style="color:#6a1b9a;background:#e1bee7">✗ Non prolongeable</span>` : ''}
            </div>
          </div>
        </div>
      `;
    }

    html += getModalHtml('mc-modal-due');
    html += `</ha-card>`;
    this.innerHTML = html;
    this._lastHtml = true;

    bindModal(this, 'mc-modal-due');
  }
}

if (!customElements.get('mediatheque-card')) {
  customElements.define('mediatheque-card', MediathequeCard);
}
if (!customElements.get('mediatheque-due-card')) {
  customElements.define('mediatheque-due-card', MediathequeDueCard);
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'mediatheque-card',
  name: 'Médiathèque de Veauche',
  description: 'Affiche les emprunts de la médiathèque de Veauche par membre',
});
window.customCards.push({
  type: 'mediatheque-due-card',
  name: 'Médiathèque - A rendre',
  description: 'Affiche les livres à rendre cette semaine',
});

} // end MEDIATHEQUE_CARD_LOADED guard
