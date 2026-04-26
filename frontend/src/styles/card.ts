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
