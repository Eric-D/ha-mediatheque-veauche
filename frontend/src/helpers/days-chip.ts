import type { DaysChip } from '../types.js';

export function getDaysChip(daysLeft: number): DaysChip {
  if (daysLeft < 0) {
    return {
      type: 'overdue',
      text: `✗ ${Math.abs(daysLeft)}j de retard`,
      color: '#b71c1c',
      bg: '#ffcdd2',
    };
  }
  if (daysLeft === 0) {
    return {
      type: 'today',
      text: "⚠ Aujourd'hui",
      color: '#d84315',
      bg: '#ffe0b2',
    };
  }
  if (daysLeft <= 3) {
    return {
      type: 'urgent',
      text: `⚠ ${daysLeft}j restants`,
      color: '#d84315',
      bg: '#ffe0b2',
    };
  }
  if (daysLeft <= 7) {
    return {
      type: 'soon',
      text: `⚡ ${daysLeft}j restants`,
      color: '#f57f17',
      bg: '#fff9c4',
    };
  }
  return {
    type: 'ok',
    text: `✓ ${daysLeft}j restants`,
    color: '#2e7d32',
    bg: '#c8e6c9',
  };
}
