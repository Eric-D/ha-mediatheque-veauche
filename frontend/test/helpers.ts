/** Outillage commun : rendre un TemplateResult et l'interroger comme du DOM.

On rend réellement plutôt que d'inspecter les `strings` et `values` du
TemplateResult. C'est ce qui permet de vérifier ce que ni `tsc` ni oxlint ne
voient : deux paramètres de même type inversés, et surtout un gestionnaire
branché sur le mauvais élément — un `@click` ne se distingue d'un autre qu'en
le déclenchant.

Le DOM est installé par `--import ./test/_setup.ts`, et non par un import ici :
les imports statiques d'un module de test sont évalués avant son corps, donc
Lit serait chargé avant que `HTMLElement` existe.
*/
import { render, type TemplateResult, type nothing } from 'lit';

/** `nothing` est accepté : renderStaleNotice le renvoie quand il n'y a rien à
    dire, et c'est un cas que les tests doivent pouvoir monter. */
export function mount(template: TemplateResult | typeof nothing): HTMLElement {
  const host = document.createElement('div');
  render(template, host);
  return host;
}

export function text(host: ParentNode, selector: string): string {
  const found = host.querySelector(selector);
  if (!found) throw new Error(`sélecteur introuvable : ${selector}`);
  return (found.textContent ?? '').replace(/\s+/g, ' ').trim();
}

export function click(host: ParentNode, selector: string): void {
  const found = host.querySelector(selector);
  if (!found) throw new Error(`sélecteur introuvable : ${selector}`);
  (found as HTMLElement).dispatchEvent(new Event('click', { bubbles: true }));
}

/** Prêt complet : chaque test ne surcharge que ce qu'il regarde. */
export function loan(overrides: Record<string, unknown> = {}) {
  return {
    titre: 'Le Petit Prince',
    book_id: '123',
    due_date: '2024-03-15',
    due_date_display: '15 mars 2024',
    days_left: 5,
    can_extend: true,
    extended: false,
    extend_disabled: false,
    extend_url: '/extend/123',
    cover_url: null,
    isbn: null,
    emprunteur: 'Jean',
    ...overrides,
  } as never;
}
