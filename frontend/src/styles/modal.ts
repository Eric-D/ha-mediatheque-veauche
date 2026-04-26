import { css } from 'lit';

export const modalStyles = css`
  .mc-modal-overlay,
  .mc-confirm-overlay,
  .mc-barcode-overlay {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    background: rgba(0, 0, 0, 0.7);
    align-items: center;
    justify-content: center;
    padding: 16px;
    box-sizing: border-box;
  }
  .mc-confirm-overlay {
    z-index: 1000;
    background: rgba(0, 0, 0, 0.75);
  }
  .mc-modal-overlay.active,
  .mc-confirm-overlay.active,
  .mc-barcode-overlay.active {
    display: flex;
  }
  .mc-modal {
    background: var(--card-background-color, #fff);
    border-radius: 12px;
    max-width: 360px;
    width: 100%;
    max-height: 85vh;
    overflow-y: auto;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
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
  .mc-modal-btn:active {
    opacity: 0.7;
  }
  .mc-modal-btn-close,
  .mc-modal-btn-cancel {
    background: var(--secondary-background-color, #e0e0e0);
    color: var(--primary-text-color);
  }
  .mc-modal-btn-extend,
  .mc-modal-btn-confirm {
    background: #1565c0;
    color: #fff;
  }
  .mc-confirm-dialog {
    background: var(--card-background-color, #fff);
    border-radius: 12px;
    max-width: 320px;
    width: 100%;
    padding: 24px;
    text-align: center;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
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
  .mc-modal-btn-cancel,
  .mc-modal-btn-confirm {
    flex: 1;
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
  .mc-barcode-btn:hover {
    opacity: 1;
  }
  .mc-barcode-dialog {
    background: #fff;
    border-radius: 12px;
    max-width: 360px;
    width: 100%;
    padding: 24px;
    text-align: center;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  }
  .mc-barcode-dialog h3 {
    margin: 0 0 4px;
    font-size: 1em;
    font-weight: 600;
    color: #333;
  }
  .mc-barcode-id {
    font-size: 0.85em;
    color: #666;
    margin-bottom: 16px;
  }
  .mc-barcode-svg svg {
    width: 100%;
    height: auto;
  }
  .mc-barcode-close {
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
