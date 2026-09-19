import { css } from 'lit';

export const cardStyles = css`
  :host {
    display: block;
  }
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
    border-radius: 12px;
    padding: 2px 10px;
    font-size: 0.85em;
    font-weight: 600;
    color: var(--text-primary-color, #fff);
    background: var(--primary-color);
  }
  .mediatheque-total.highlight {
    background: #f57f17;
    color: #fff;
  }
  .header-right {
    display: flex;
    align-items: center;
    gap: 6px;
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
    border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.06));
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
  .book-badges {
    display: flex;
    gap: 6px;
    margin-top: 4px;
    flex-wrap: wrap;
  }
  .book-row-read {
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    padding: 0;
    border-radius: 50%;
    border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
    background: var(--secondary-background-color, #f0f0f0);
    color: var(--secondary-text-color);
    font-size: 0.85em;
    font-weight: 700;
    line-height: 1;
    cursor: pointer;
  }
  .book-row-read.is-read {
    background: #2e7d32;
    border-color: #2e7d32;
    color: #fff;
  }
  .badge-days {
    font-size: 0.75em;
    padding: 2px 8px;
    border-radius: 10px;
    font-weight: 600;
    white-space: nowrap;
  }
  /* --- Mode carousel ------------------------------------------------- */
  .mc-car-row {
    display: flex;
    align-items: center;
  }
  .mc-car-strip {
    flex: 1 1 auto;
    /* Sans min-width:0, un enfant flex refuse de rétrécir sous sa taille de
       contenu : la bande pousserait la tuile code-barres hors de la carte au
       lieu de défiler. */
    min-width: 0;
    display: flex;
    gap: 10px;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-snap-type: x proximity;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  .mc-car-strip::-webkit-scrollbar {
    display: none;
  }
  .mc-car-tile {
    flex: 0 0 auto;
    padding: 0;
    border: 0;
    border-radius: 4px;
    overflow: hidden;
    position: relative;
    cursor: pointer;
    scroll-snap-align: start;
    /* Visible tant que la couverture n'est pas chargée, et sous une image qui
       ne couvre pas tout à fait. Pas d'ombre portée ici : overflow-x:auto
       force overflow-y à auto, et tout dépassement créerait une barre de
       défilement verticale parasite dans une bande de 76 px. */
    background: #2b3a4f;
  }
  .mc-car-tile.is-read {
    /* Le liseré est intérieur : l'image se retire de 2 px et le fond vert
       forme le cadre. Une bordure extérieure décalerait les tuiles voisines,
       et un outline déborderait dans la zone de défilement. */
    padding: 2px;
    background: var(--success-color, #4caf50);
  }
  .mc-car-tile.is-read .mc-car-cover {
    border-radius: 2px;
  }
  .mc-car-cover {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .mc-car-badge {
    position: absolute;
    top: 4px;
    right: 4px;
    padding: 1px 5px;
    border-radius: 999px;
    font-size: 10px;
    line-height: 12px;
    font-weight: 700;
    white-space: nowrap;
  }
  .mc-car-barcode {
    flex: 0 0 auto;
    width: 44px;
    padding: 0;
    border: 0;
    border-radius: 10px;
    background: var(--secondary-background-color, #2e2e2e);
    color: var(--primary-text-color);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
  .mc-car-barcode ha-icon {
    --mdc-icon-size: 24px;
  }
  .mc-car-empty {
    flex: 1 1 auto;
    min-width: 0;
    font-size: 13px;
    color: var(--secondary-text-color);
  }
  .mc-car-tile:focus-visible,
  .mc-car-barcode:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  .empty-state {
    padding: 24px 16px;
    text-align: center;
    color: var(--secondary-text-color);
  }
  .mc-stale {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 0 16px 8px;
    padding: 6px 10px;
    border-radius: 6px;
    background: var(--warning-color, #ffa726);
    color: #21201f;
    font-size: 0.8em;
    line-height: 1.3;
  }
  .book-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    padding: 12px 16px 16px;
    justify-content: flex-start;
  }
  .book-tile {
    position: relative;
    width: 80px;
    height: 120px;
    padding: 0;
    border: none;
    background: var(--secondary-background-color, #f0f0f0);
    border-radius: 6px;
    overflow: hidden;
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
    transition: transform 0.12s ease;
  }
  .book-tile:active {
    transform: scale(0.96);
  }
  /* Le liseré vert doit rester lisible sur une couverture claire comme sur
     une sombre : posé en inset, il mord sur l'image plutôt que sur le fond de
     la tuile, que la couverture recouvre entièrement. */
  .book-tile.is-read {
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.15),
      inset 0 0 0 2px #2e7d32;
  }
  .book-tile-read {
    position: absolute;
    bottom: 4px;
    left: 4px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    font-size: 0.72em;
    font-weight: 700;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #fff;
    background: rgba(0, 0, 0, 0.45);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }
  .book-tile-read.is-read {
    background: #2e7d32;
  }
  .book-tile-cover {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .book-tile-badge {
    position: absolute;
    top: 4px;
    right: 4px;
    min-width: 22px;
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 0.72em;
    font-weight: 700;
    line-height: 1.2;
    text-align: center;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }
  .book-tile-corner {
    position: absolute;
    top: 4px;
    left: 4px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    color: #fff;
    font-size: 0.7em;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }
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
    to {
      transform: rotate(360deg);
    }
  }
`;
