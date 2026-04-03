/**
 * Médiathèque de Veauche - Carte Lovelace Custom
 * Affiche les emprunts de la médiathèque par membre de la famille.
 */

if (window.MEDIATHEQUE_CARD_LOADED) { /* already loaded */ } else {
window.MEDIATHEQUE_CARD_LOADED = true;

const MEDIATHEQUE_CARD_VERSION = '1.12.0';
console.info(`%c MEDIATHEQUE-CARD %c ${MEDIATHEQUE_CARD_VERSION} IS INSTALLED `, 'color: white; background: #2e7d32; font-weight: bold;', 'color: #2e7d32; background: #c8e6c9; font-weight: bold;');

function _mcLog(level, card, msg, ...args) {
  const prefix = `%c MEDIATHEQUE-CARD %c [${card}]`;
  const styles = ['color: white; background: #2e7d32; font-weight: bold;', 'color: #2e7d32; font-weight: bold;'];
  console[level](prefix + ' ' + msg, ...styles, ...args);
}

const PLACEHOLDER_SVG = `data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2252%22 height=%2276%22 viewBox=%220 0 52 76%22%3E%3Crect width=%2252%22 height=%2276%22 fill=%22%23e0e0e0%22 rx=%224%22/%3E%3Ctext x=%2226%22 y=%2242%22 text-anchor=%22middle%22 font-family=%22sans-serif%22 font-size=%2220%22 fill=%22%239e9e9e%22%3E%F0%9F%93%96%3C/text%3E%3C/svg%3E`;

const ALL_BADGES = ['overdue', 'today', 'urgent', 'soon', 'ok', 'not_extendable'];

function getDaysChip(daysLeft) {
  if (daysLeft < 0) return { type: 'overdue', text: `✗ ${Math.abs(daysLeft)}j de retard`, color: '#b71c1c', bg: '#ffcdd2' };
  if (daysLeft === 0) return { type: 'today', text: "⚠ Aujourd'hui", color: '#d84315', bg: '#ffe0b2' };
  if (daysLeft <= 3) return { type: 'urgent', text: `⚠ ${daysLeft}j restants`, color: '#d84315', bg: '#ffe0b2' };
  if (daysLeft <= 7) return { type: 'soon', text: `⚡ ${daysLeft}j restants`, color: '#f57f17', bg: '#fff9c4' };
  return { type: 'ok', text: `✓ ${daysLeft}j restants`, color: '#2e7d32', bg: '#c8e6c9' };
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
  if (!text) return '';
  const codes = [];
  const startCode = 104; // Start B
  codes.push(startCode);
  let checksum = startCode;
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    if (charCode < 32 || charCode > 126) continue; // skip non-printable
    const code = charCode - 32;
    codes.push(code);
    checksum += code * (i + 1);
  }
  codes.push(checksum % 103);
  codes.push(106); // Stop

  let binary = '';
  for (const c of codes) {
    if (c >= 0 && c < CODE128B_PATTERNS.length) {
      binary += CODE128B_PATTERNS[c];
    }
  }

  if (!binary) return '';

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

function escapeHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function bindModal(root, modalId, hass) {
  const overlay = root.querySelector(`#${modalId}`);
  if (!overlay) return;
  const coverImg = overlay.querySelector('.mc-modal-cover');
  const titleEl = overlay.querySelector('.mc-modal-title');
  const isbnEl = overlay.querySelector('.mc-modal-isbn');
  const extendBtn = overlay.querySelector('.mc-modal-btn-extend');
  const closeBtn = overlay.querySelector('.mc-modal-btn-close');

  const confirmOverlay = root.querySelector(`#${modalId}-confirm`);
  if (!confirmOverlay) return;
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
    if (currentExtendUrl && hass) {
      hass.callService('mediatheque_veauche', 'extend_loan', { extend_url: currentExtendUrl });
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
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._connected = false;
    this._unsubStates = null;
  }

  connectedCallback() {
    this._connected = true;
    this._subscribeStatesContext();
    if (this._hass && this._config) {
      try { this._render(); } catch (e) { _mcLog('error', 'card', 'Render error: %o', e); }
    }
  }

  disconnectedCallback() {
    this._connected = false;
    if (this._unsubStates) {
      this._unsubStates();
      this._unsubStates = null;
    }
    if (this._retryTimer) {
      clearTimeout(this._retryTimer);
      this._retryTimer = null;
    }
  }

  _subscribeStatesContext() {
    const event = new CustomEvent('context-request', {
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    event.context = 'states';
    event.subscribe = true;
    event.callback = (result) => {
      if (result && result.unsubscribe) {
        this._unsubStates = result.unsubscribe;
      }
    };
    this.dispatchEvent(event);
  }

  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;
    if (!this._config || !this._connected) return;

    const entityId = this._config.entity;
    if (entityId && oldHass) {
      const oldState = oldHass.states[entityId];
      const newState = hass.states[entityId];
      if (oldState === newState) return;
    }

    if (isModalOpen(this.shadowRoot)) return;
    if (this._retryTimer) { clearTimeout(this._retryTimer); this._retryTimer = null; }
    try {
      this._render();
    } catch (e) {
      _mcLog('error', 'card', 'Render error: %o', e);
    }
  }

  setConfig(config) {
    if (!config || !config.entity) {
      throw new Error("Configuration invalide : l'option 'entity' est requise.");
    }
    if (config.badges !== undefined && Array.isArray(config.badges)) {
      config = { ...config, badges: config.badges.filter(b => ALL_BADGES.includes(b)) };
    }
    _mcLog('info', 'card', 'Config OK, entity=%s, version=%s', config.entity, MEDIATHEQUE_CARD_VERSION);
    this._config = config;
  }

  static getStubConfig(hass) {
    const entity = Object.keys(hass.states).find(
      e => e.startsWith('sensor.mediatheque_')
    );
    return { entity: entity || 'sensor.mediatheque_veauche', mode: 'all' };
  }

  static getConfigForm() {
    return {
      schema: [
        { name: 'entity', required: true, selector: { entity: { domain: 'sensor' } } },
        { name: 'title', selector: { text: {} } },
        {
          name: 'mode',
          selector: {
            select: {
              options: [
                { value: 'all', label: 'Tous les emprunts' },
                { value: 'due', label: 'A rendre cette semaine' },
              ],
            },
          },
        },
        { name: 'total_entity', selector: { entity: { domain: 'sensor' } } },
        { name: 'card_id', selector: { text: {} } },
        {
          name: 'badges',
          selector: {
            select: {
              multiple: true,
              options: [
                { value: 'overdue', label: 'En retard' },
                { value: 'today', label: "Aujourd'hui" },
                { value: 'urgent', label: 'Urgent (< 3j)' },
                { value: 'soon', label: 'Bientôt (< 7j)' },
                { value: 'ok', label: 'OK' },
                { value: 'not_extendable', label: 'Non prolongeable' },
              ],
            },
          },
        },
      ],
      computeLabel(schema) {
        const labels = {
          entity: 'Entité',
          title: 'Titre de la carte',
          mode: 'Mode d\'affichage',
          total_entity: 'Entité total (mode "due")',
          card_id: 'N° de carte bibliothèque',
          badges: 'Filtrer par statut',
        };
        return labels[schema.name] || schema.name;
      },
    };
  }

  getCardSize() {
    return (this._config && this._config.mode === 'due') ? 3 : 4;
  }

  getGridOptions() {
    return {
      columns: 12,
      min_columns: 6,
      rows: (this._config && this._config.mode === 'due') ? 3 : 4,
      min_rows: 2,
    };
  }

  _scheduleRetry() {
    if (this._retryTimer) return;
    this._retryCount = (this._retryCount || 0) + 1;
    if (this._retryCount > 10) return;
    const delay = Math.min(2000 * this._retryCount, 15000);
    _mcLog('info', 'card', 'Retry %d dans %dms…', this._retryCount, delay);
    this._retryTimer = setTimeout(() => {
      this._retryTimer = null;
      if (this._hass && this._config) {
        try { this._render(); } catch (e) { _mcLog('error', 'card', 'Retry render error: %o', e); }
      }
    }, delay);
  }

  _matchesBadgeFilter(loan, enabledBadges) {
    const chip = getDaysChip(loan.days_left);
    return enabledBadges.includes(chip.type);
  }

  _renderBookRow(loan, enabledBadges, showEmprunteur) {
    const chip = getDaysChip(loan.days_left);
    const coverSrc = loan.cover_url || PLACEHOLDER_SVG;

    let badgesHtml = `<span class="badge-days" style="color:${chip.color};background:${chip.bg}">${chip.text}</span>`;
    if (loan.extended) {
      badgesHtml += `<span class="badge-days" style="color:#6a1b9a;background:#e1bee7">✗ Non prolongeable</span>`;
    }

    const titre = escapeHtml(loan.titre);
    const dueDateDisplay = escapeHtml(loan.due_date_display);
    const emprunteur = escapeHtml(loan.emprunteur || '');

    return `
      <div class="book-row">
        <div class="book-cover-wrapper"
             data-cover="${escapeHtml(coverSrc)}"
             data-title="${titre}"
             data-isbn="${escapeHtml(loan.isbn || '')}"
             data-can-extend="${loan.can_extend ? 'true' : 'false'}"
             data-extend-url="${escapeHtml(loan.extend_url || '')}">
          <img class="book-cover" src="${coverSrc}" alt="" loading="lazy"
               onerror="this.src='${PLACEHOLDER_SVG}'" />
        </div>
        <div class="book-info">
          <div class="book-title" title="${titre}">${titre}</div>
          <div class="book-date">Retour : ${dueDateDisplay}</div>
          ${showEmprunteur && loan.emprunteur ? `<div class="book-emprunteur">Emprunteur : ${emprunteur}</div>` : ''}
          <div class="book-badges">${badgesHtml}</div>
        </div>
      </div>
    `;
  }

  _render() {
    const root = this.shadowRoot;
    const entityId = this._config.entity;
    const mode = this._config.mode || 'all';
    const state = this._hass.states[entityId];
    const title = escapeHtml(this._config.title || (mode === 'due' ? 'A rendre cette semaine' : 'Médiathèque de Veauche'));
    const enabledBadges = this._config.badges || ALL_BADGES;

    if (!state || state.state === 'unavailable' || state.state === 'unknown') {
      const reason = !state ? 'entity not found' : `state=${state.state}`;
      _mcLog('warn', 'card', '%s — %s %s', entityId, reason, this._lastHtml ? '(keeping last render)' : '(showing loader)');
      this._scheduleRetry();
      if (this._lastHtml) return;
      root.innerHTML = `
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
              width: 36px; height: 36px;
              border: 3px solid var(--divider-color, #e0e0e0);
              border-top: 3px solid var(--primary-color, #03a9f4);
              border-radius: 50%; margin: 0 auto;
              animation: mediatheque-spin 1s linear infinite;
            }
            @keyframes mediatheque-spin { to { transform: rotate(360deg); } }
          </style>
        </ha-card>`;
      return;
    }

    this._retryCount = 0;
    const attrs = state.attributes || {};

    const hasFilter = !!this._config.badges;

    let cardId, badgeText, badgeHighlight, filteredData;

    if (mode === 'due') {
      const livres = attrs.livres || [];
      const filtered = hasFilter ? livres.filter(l => this._matchesBadgeFilter(l, enabledBadges)) : livres;
      filteredData = { livres: filtered };

      const totalEntityId = this._config.total_entity;
      const autoId = entityId.replace('_due_week', '_total');
      const totalState = (totalEntityId && this._hass.states[totalEntityId]) || this._hass.states[autoId];
      let totalEmprunts = null;
      if (totalState) {
        totalEmprunts = parseInt(totalState.state) || 0;
        cardId = (totalState.attributes || {}).card_id || this._config.card_id || '';
      } else {
        cardId = this._config.card_id || '';
      }
      badgeText = totalEmprunts !== null ? `${filtered.length} / ${totalEmprunts}` : `${filtered.length}`;
      badgeHighlight = filtered.length > 0;
    } else {
      const membres = attrs.membres || {};
      const compte = attrs.compte || '';
      const filteredMembres = {};
      let filteredTotal = 0;
      for (const [member, loans] of Object.entries(membres)) {
        const filtered = hasFilter ? loans.filter(l => this._matchesBadgeFilter(l, enabledBadges)) : loans;
        if (filtered.length > 0) {
          filteredMembres[member] = filtered;
          filteredTotal += filtered.length;
        }
      }
      filteredData = { membres: filteredMembres, compte };

      cardId = attrs.card_id || this._config.card_id || '';
      badgeText = `${filteredTotal} emprunt${filteredTotal > 1 ? 's' : ''}`;
      badgeHighlight = hasFilter && filteredTotal > 0;
    }

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
            background: ${badgeHighlight ? '#f57f17' : 'var(--primary-color)'};
            color: ${badgeHighlight ? '#fff' : 'var(--text-primary-color, #fff)'};
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
            padding: 8px 16px;
            border-bottom: 1px solid var(--divider-color, rgba(0,0,0,0.06));
          }
          .book-row:last-child {
            border-bottom: none;
          }
          .member-section .book-row {
            padding: 8px 0;
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
          <span style="display:flex;align-items:center;gap:6px">
            <span class="mediatheque-total">${badgeText}</span>
            ${cardId ? `<button class="mc-barcode-btn" id="mc-barcode-trigger" title="Ma carte">|||</button>` : ''}
          </span>
        </div>
    `;

    if (cardId) {
      html += `
        <div class="mc-barcode-overlay" id="mc-barcode-modal">
          <div class="mc-barcode-dialog">
            <h3>Ma carte</h3>
            <div class="mc-barcode-id">${escapeHtml(cardId)}</div>
            ${generateCode128Svg(cardId)}
            <br><button class="mc-barcode-close">Fermer</button>
          </div>
        </div>
      `;
    }

    if (mode === 'due') {
      const livres = filteredData.livres;

      if (livres.length === 0) {
        html += `<div class="empty-state">Aucun livre à rendre cette semaine</div>`;
      }

      const sorted = [...livres].sort((a, b) => (a.days_left ?? 0) - (b.days_left ?? 0));
      for (const loan of sorted) {
        html += this._renderBookRow(loan, enabledBadges, true);
      }
    } else {
      const membres = filteredData.membres;
      const compte = filteredData.compte;

      const sortedMembers = Object.keys(membres).sort((a, b) => {
        if (a === compte) return -1;
        if (b === compte) return 1;
        return a.localeCompare(b);
      });

      if (sortedMembers.length === 0) {
        html += `<div class="empty-state">Aucun emprunt en cours</div>`;
      }

      for (const member of sortedMembers) {
        const loans = membres[member];
        const icon = member === compte ? '👤' : '👦';
        const sorted = [...loans].sort((a, b) => (a.days_left ?? 0) - (b.days_left ?? 0));

        html += `
          <div class="member-section">
            <div class="member-header">
              <span class="member-icon">${icon}</span>
              <span class="member-name">${escapeHtml(member)}</span>
              <span class="member-count">${loans.length}</span>
            </div>
        `;

        for (const loan of sorted) {
          html += this._renderBookRow(loan, enabledBadges, false);
        }

        html += `</div>`;
      }
    }

    html += getModalHtml('mc-modal');
    html += `</ha-card>`;
    root.innerHTML = html;
    this._lastHtml = true;

    bindModal(root, 'mc-modal', this._hass);

    const bcTrigger = root.querySelector('#mc-barcode-trigger');
    const bcOverlay = root.querySelector('#mc-barcode-modal');
    if (bcTrigger && bcOverlay) {
      const bcClose = bcOverlay.querySelector('.mc-barcode-close');
      bcTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        bcOverlay.classList.add('active');
      });
      bcOverlay.addEventListener('click', (e) => {
        if (e.target === bcOverlay) bcOverlay.classList.remove('active');
      });
      if (bcClose) bcClose.addEventListener('click', () => bcOverlay.classList.remove('active'));
    }
  }
}

if (!customElements.get('mediatheque-card')) {
  customElements.define('mediatheque-card', MediathequeCard);
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'mediatheque-card',
  name: 'Médiathèque de Veauche',
  preview: true,
  description: 'Affiche les emprunts de la médiathèque de Veauche',
});

} // end MEDIATHEQUE_CARD_LOADED guard
