/** En-tête, loader, bandeau de péremption. */
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { renderHeader, renderLoader, renderStaleNotice } from '../src/renders/chrome.ts';
import { click, mount, text } from './helpers.ts';

const header = (over: Record<string, unknown> = {}) =>
  renderHeader({
    title: 'Médiathèque',
    badgeText: '3 emprunts',
    highlight: false,
    cardId: '',
    onBarcodeClick: () => {},
    ...over,
  } as never);

describe('renderHeader', () => {
  test('le titre et le badge ne sont pas intervertis', () => {
    // Deux chaînes de même type : c'est exactement l'inversion que le typage
    // ne peut pas voir, et la raison d'être de l'objet nommé en paramètre.
    const host = mount(header());

    assert.equal(text(host, '.mediatheque-title'), 'Médiathèque');
    assert.equal(text(host, '.mediatheque-total'), '3 emprunts');
  });

  test('highlight ne s\'applique qu\'au badge', () => {
    const host = mount(header({ highlight: true }));

    assert.ok(host.querySelector('.mediatheque-total')!.classList.contains('highlight'));
    assert.ok(!host.querySelector('.mediatheque-title')!.classList.contains('highlight'));
  });

  test('sans highlight, la classe est absente', () => {
    const host = mount(header());
    assert.ok(!host.querySelector('.mediatheque-total')!.classList.contains('highlight'));
  });

  test('pas de bouton code-barres sans identifiant de carte', () => {
    const host = mount(header({ cardId: '' }));
    assert.equal(host.querySelector('.mc-barcode-btn'), null);
  });

  test('le bouton code-barres appelle son gestionnaire', () => {
    let called = 0;
    const host = mount(header({ cardId: '900123', onBarcodeClick: () => (called += 1) }));

    click(host, '.mc-barcode-btn');

    assert.equal(called, 1);
  });
});

describe('renderLoader', () => {
  test('affiche le titre et le message par défaut', () => {
    const host = mount(renderLoader({ title: 'Médiathèque' }));

    assert.equal(text(host, '.mediatheque-title'), 'Médiathèque');
    assert.match(host.textContent ?? '', /Chargement/);
  });

  test('le message fourni remplace le défaut', () => {
    const host = mount(renderLoader({ title: 'Médiathèque', message: 'Reconnexion…' }));

    assert.match(host.textContent ?? '', /Reconnexion…/);
    assert.doesNotMatch(host.textContent ?? '', /Chargement/);
  });

  test('rend toujours une ha-card visible', () => {
    // Un rendu vide ne donne aucune information à l'utilisateur.
    const host = mount(renderLoader({ title: 'X' }));
    assert.ok(host.querySelector('ha-card'));
  });
});

describe('renderStaleNotice', () => {
  const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();

  test('rien tant que le dernier fetch a réussi', () => {
    const host = mount(
      renderStaleNotice({ fetch_ok: true, last_success: hoursAgo(48) } as never)
    );
    assert.equal(host.querySelector('.mc-stale'), null);
  });

  test('rien non plus quand fetch_ok est absent', () => {
    // Premier rendu sur cache : aucun fetch n'a encore échoué.
    const host = mount(renderStaleNotice({ last_success: hoursAgo(48) } as never));
    assert.equal(host.querySelector('.mc-stale'), null);
  });

  test('un échec récent ne déclenche pas le bandeau', () => {
    const host = mount(
      renderStaleNotice({ fetch_ok: false, last_success: hoursAgo(2) } as never)
    );
    assert.equal(host.querySelector('.mc-stale'), null);
  });

  test('au-delà du seuil, le bandeau apparaît', () => {
    const host = mount(
      renderStaleNotice({ fetch_ok: false, last_success: hoursAgo(20) } as never)
    );

    assert.ok(host.querySelector('.mc-stale'));
    assert.match(text(host, '.mc-stale'), /liste des emprunts/);
  });

  test('le seuil est une durée, pas un changement de jour', () => {
    // La condition « même jour civil » datait de l'époque où les délais
    // étaient figés au scrape : elle alertait sur dix minutes d'écart à
    // 00 h 05 et se taisait sur quinze heures à 23 h 00.
    const host = mount(
      renderStaleNotice({ fetch_ok: false, last_success: hoursAgo(1) } as never)
    );
    assert.equal(host.querySelector('.mc-stale'), null);
  });

  test('sans date de dernier succès, le bandeau apparaît quand même', () => {
    const host = mount(renderStaleNotice({ fetch_ok: false } as never));

    assert.ok(host.querySelector('.mc-stale'));
    assert.match(text(host, '.mc-stale'), /date inconnue/);
  });

  test('une date illisible ne fait pas disparaître le bandeau', () => {
    const host = mount(
      renderStaleNotice({ fetch_ok: false, last_success: 'pas une date' } as never)
    );

    assert.ok(host.querySelector('.mc-stale'));
    assert.match(text(host, '.mc-stale'), /date inconnue/);
  });
});
