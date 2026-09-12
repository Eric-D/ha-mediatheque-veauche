/** Tuile du mode couvertures et ligne du mode liste. */
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { renderBookRow, renderTile } from '../src/renders/book.ts';
import { PLACEHOLDER_SVG } from '../src/renders/shared.ts';
import { click, loan, mount, text } from './helpers.ts';

describe('renderTile', () => {
  test('le clic ouvre le détail', () => {
    let called = 0;
    const host = mount(renderTile(loan(), () => (called += 1)));

    click(host, '.book-tile');

    assert.equal(called, 1);
  });

  test('le titre et l\'emprunteur vont dans l\'infobulle', () => {
    const host = mount(renderTile(loan({ titre: 'Astérix', emprunteur: 'Lucas' }), () => {}));

    assert.equal(host.querySelector('.book-tile')!.getAttribute('title'), 'Astérix — Lucas');
  });

  test('sans emprunteur, pas de tiret orphelin', () => {
    const host = mount(renderTile(loan({ titre: 'Astérix', emprunteur: null }), () => {}));

    assert.equal(host.querySelector('.book-tile')!.getAttribute('title'), 'Astérix');
  });

  test('la pastille abrège les jours restants', () => {
    assert.equal(text(mount(renderTile(loan({ days_left: 5 }), () => {})), '.book-tile-badge'), '5j');
  });

  test('un retard s\'affiche en valeur absolue', () => {
    assert.equal(text(mount(renderTile(loan({ days_left: -3 }), () => {})), '.book-tile-badge'), '3j');
  });

  test('le jour même n\'est pas « 0j »', () => {
    // 0j se lirait « plus de délai du tout » alors que la journée est entière.
    assert.equal(text(mount(renderTile(loan({ days_left: 0 }), () => {})), '.book-tile-badge'), '!');
  });

  test('un délai inconnu ne devient pas « undefinedj »', () => {
    assert.equal(text(mount(renderTile(loan({ days_left: null }), () => {})), '.book-tile-badge'), '?');
  });

  test('sans couverture, le placeholder inliné', () => {
    // Data-URI, et pas seulement « égal à la constante » : l'assertion doit
    // rester vraie pour la bonne raison. Aucune requête réseau ni CDN — la
    // carte doit fonctionner hors ligne, en WebView Android.
    const host = mount(renderTile(loan({ cover_url: null }), () => {}));
    const src = host.querySelector('.book-tile-cover')!.getAttribute('src') ?? '';

    assert.ok(src.startsWith('data:image/svg+xml'), `placeholder distant : ${src}`);
    assert.equal(src, PLACEHOLDER_SVG);
  });

  test("la pastille reste lisible par un lecteur d'écran", () => {
    // Le libellé abrégé (« 5j ») ne dit pas ce qu'il compte.
    const host = mount(renderTile(loan({ days_left: 5 }), () => {}));

    assert.equal(
      host.querySelector('.book-tile-badge')!.getAttribute('aria-label'),
      '⚡ 5j restants'
    );
  });

  test('une couverture distante est utilisée telle quelle', () => {
    const host = mount(renderTile(loan({ cover_url: 'https://exemple/1.jpg' }), () => {}));

    assert.equal(
      host.querySelector('.book-tile-cover')!.getAttribute('src'),
      'https://exemple/1.jpg'
    );
  });

  test('une couverture en échec retombe sur le placeholder', () => {
    const host = mount(renderTile(loan({ cover_url: 'https://exemple/absent.jpg' }), () => {}));
    const img = host.querySelector('.book-tile-cover')!;

    img.dispatchEvent(new Event('error'));

    assert.equal(img.getAttribute('src'), PLACEHOLDER_SVG);
  });

  test('un prêt prolongeable n\'a pas de coin barré', () => {
    const host = mount(renderTile(loan(), () => {}));
    assert.equal(host.querySelector('.book-tile-corner'), null);
  });

  test('désactivé et non prolongeable ne se confondent pas', () => {
    const off = mount(renderTile(loan({ extend_disabled: true }), () => {}));
    const done = mount(renderTile(loan({ extended: true }), () => {}));

    assert.equal(off.querySelector('.book-tile-corner')!.getAttribute('title'), 'Désactivé');
    assert.equal(
      done.querySelector('.book-tile-corner')!.getAttribute('title'),
      'Non prolongeable'
    );
  });
});

describe('renderBookRow', () => {
  test('le clic sur la couverture ouvre le détail', () => {
    let called = 0;
    const host = mount(renderBookRow(loan(), () => (called += 1)));

    click(host, '.book-cover-wrapper');

    assert.equal(called, 1);
  });

  test('le titre et la date ne sont pas intervertis', () => {
    const host = mount(
      renderBookRow(loan({ titre: 'Astérix', due_date_display: '15 mars 2024' }), () => {})
    );

    assert.equal(text(host, '.book-title'), 'Astérix');
    assert.equal(text(host, '.book-date'), 'Retour : 15 mars 2024');
  });

  test('sans couverture, la ligne aussi retombe sur le placeholder', () => {
    const host = mount(renderBookRow(loan({ cover_url: null }), () => {}));
    const src = host.querySelector('.book-cover')!.getAttribute('src') ?? '';

    assert.ok(src.startsWith('data:image/svg+xml'), `placeholder distant : ${src}`);
  });

  test('une couverture en échec retombe sur le placeholder', () => {
    // Le mode liste est le mode par défaut : l'invariant y compte au moins
    // autant que sur la tuile.
    const host = mount(renderBookRow(loan({ cover_url: 'https://exemple/absent.jpg' }), () => {}));
    const img = host.querySelector('.book-cover')!;

    img.dispatchEvent(new Event('error'));

    assert.ok((img.getAttribute('src') ?? '').startsWith('data:image/svg+xml'));
  });

  test('le titre complet est accessible en infobulle', () => {
    // Il est tronqué visuellement par le CSS.
    const host = mount(renderBookRow(loan({ titre: 'Un très long titre' }), () => {}));

    assert.equal(host.querySelector('.book-title')!.getAttribute('title'), 'Un très long titre');
  });

  test('la pastille reprend le libellé complet du délai', () => {
    const host = mount(renderBookRow(loan({ days_left: 0 }), () => {}));

    assert.equal(text(host, '.badge-days'), "⚠ Aujourd'hui");
  });

  test('un prêt normal n\'a qu\'une pastille', () => {
    const host = mount(renderBookRow(loan(), () => {}));
    assert.equal(host.querySelectorAll('.badge-days').length, 1);
  });

  test('désactivé ajoute une seconde pastille explicite', () => {
    const host = mount(renderBookRow(loan({ extend_disabled: true }), () => {}));
    const badges = [...host.querySelectorAll('.badge-days')].map((b) => b.textContent?.trim());

    assert.equal(badges.length, 2);
    assert.match(badges[1] ?? '', /Désactivé/);
  });

  test('désactivé l\'emporte sur prolongé', () => {
    // Les deux drapeaux peuvent coexister ; afficher « non prolongeable »
    // laisserait croire à une limite atteinte plutôt qu'à un blocage du compte.
    const host = mount(renderBookRow(loan({ extend_disabled: true, extended: true }), () => {}));
    const badges = [...host.querySelectorAll('.badge-days')].map((b) => b.textContent?.trim());

    assert.equal(badges.length, 2);
    assert.match(badges[1] ?? '', /Désactivé/);
  });
});
