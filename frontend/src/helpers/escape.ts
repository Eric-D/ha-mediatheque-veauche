// Lit échappe automatiquement les expressions ${} dans html``.
// Cet helper sert uniquement aux générations SVG en string (code-barres).
export function escapeHtml(str: string | undefined | null): string {
  return (str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
