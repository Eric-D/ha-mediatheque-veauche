/** Tuile du mode couvertures et ligne du mode liste. */
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { renderBookRow, renderTile } from '../src/renders/book.ts';
import { PLACEHOLDER_SVG } from '../src/renders/shared.ts';
import type { Loan } from '../src/types.ts';
import { click, loan, mount, text } from './helpers.ts';

describe('renderTile', () => {
  test('le clic ouvre le détail', () => {
    let called = 0;
    const host = mount(renderTile({ loan: loan(), onClick: () => (called += 1), onToggleRead: () => {} }));

    click(host, '.book-tile');

    assert.equal(called, 1);
  });

  test('le titre et l\'emprunteur vont dans l\'infobulle', () => {
    const host = mount(renderTile({ loan: loan({ titre: 'Astérix', emprunteur: 'Lucas' }), onClick: () => {}, onToggleRead: () => {} }));

    assert.equal(host.querySelector('.book-tile')!.getAttribute('title'), 'Astérix — Lucas');
  });

  test('sans emprunteur, pas de tiret orphelin', () => {
    const host = mount(renderTile({ loan: loan({ titre: 'Astérix', emprunteur: null }), onClick: () => {}, onToggleRead: () => {} }));

    assert.equal(host.querySelector('.book-tile')!.getAttribute('title'), 'Astérix');
  });

  test('la pastille abrège les jours restants', () => {
    assert.equal(text(mount(renderTile({ loan: loan({ days_left: 5 }), onClick: () => {}, onToggleRead: () => {} })), '.book-tile-badge'), '5j');
  });

  test('un retard s\'affiche en valeur absolue', () => {
    assert.equal(text(mount(renderTile({ loan: loan({ days_left: -3 }), onClick: () => {}, onToggleRead: () => {} })), '.book-tile-badge'), '3j');
  });

  test('le jour même n\'est pas « 0j »', () => {
    // 0j se lirait « plus de délai du tout » alors que la journée est entière.
    assert.equal(text(mount(renderTile({ loan: loan({ days_left: 0 }), onClick: () => {}, onToggleRead: () => {} })), '.book-tile-badge'), '!');
  });

  test('un délai inconnu ne devient pas « undefinedj »', () => {
    assert.equal(text(mount(renderTile({ loan: loan({ days_left: null }), onClick: () => {}, onToggleRead: () => {} })), '.book-tile-badge'), '?');
  });

  test('sans couverture, le placeholder inliné', () => {
    // Data-URI, et pas seulement « égal à la constante » : l'assertion doit
    // rester vraie pour la bonne raison. Aucune requête réseau ni CDN — la
    // carte doit fonctionner hors ligne, en WebView Android.
    const host = mount(renderTile({ loan: loan({ cover_url: null }), onClick: () => {}, onToggleRead: () => {} }));
    const src = host.querySelector('.book-tile-cover')!.getAttribute('src') ?? '';

    assert.ok(src.startsWith('data:image/svg+xml'), `placeholder distant : ${src}`);
    assert.equal(src, PLACEHOLDER_SVG);
  });

  test("la pastille reste lisible par un lecteur d'écran", () => {
    // Le libellé abrégé (« 5j ») ne dit pas ce qu'il compte.
    const host = mount(renderTile({ loan: loan({ days_left: 5 }), onClick: () => {}, onToggleRead: () => {} }));

    assert.equal(
      host.querySelector('.book-tile-badge')!.getAttribute('aria-label'),
      '⚡ 5j restants'
    );
  });

  test('une couverture distante est utilisée telle quelle', () => {
    const host = mount(renderTile({ loan: loan({ cover_url: 'https://exemple/1.jpg' }), onClick: () => {}, onToggleRead: () => {} }));

    assert.equal(
      host.querySelector('.book-tile-cover')!.getAttribute('src'),
      'https://exemple/1.jpg'
    );
  });

  test('une couverture en échec retombe sur le placeholder', () => {
    const host = mount(renderTile({ loan: loan({ cover_url: 'https://exemple/absent.jpg' }), onClick: () => {}, onToggleRead: () => {} }));
    const img = host.querySelector('.book-tile-cover')!;

    img.dispatchEvent(new Event('error'));

    assert.equal(img.getAttribute('src'), PLACEHOLDER_SVG);
  });

  test('un prêt prolongeable n\'a pas de coin barré', () => {
    const host = mount(renderTile({ loan: loan(), onClick: () => {}, onToggleRead: () => {} }));
    assert.equal(host.querySelector('.book-tile-corner'), null);
  });

  test('désactivé et non prolongeable ne se confondent pas', () => {
    const off = mount(renderTile({ loan: loan({ extend_disabled: true }), onClick: () => {}, onToggleRead: () => {} }));
    const done = mount(renderTile({ loan: loan({ extended: true }), onClick: () => {}, onToggleRead: () => {} }));

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
    const host = mount(renderBookRow({ loan: loan(), onClick: () => (called += 1), onToggleRead: () => {} }));

    click(host, '.book-cover-wrapper');

    assert.equal(called, 1);
  });

  test('le titre et la date ne sont pas intervertis', () => {
    const host = mount(
      renderBookRow({ loan: loan({ titre: 'Astérix', due_date_display: '15 mars 2024' }), onClick: () => {}, onToggleRead: () => {} })
    );

    assert.equal(text(host, '.book-title'), 'Astérix');
    assert.equal(text(host, '.book-date'), 'Retour : 15 mars 2024');
  });

  test('sans couverture, la ligne aussi retombe sur le placeholder', () => {
    const host = mount(renderBookRow({ loan: loan({ cover_url: null }), onClick: () => {}, onToggleRead: () => {} }));
    const src = host.querySelector('.book-cover')!.getAttribute('src') ?? '';

    assert.ok(src.startsWith('data:image/svg+xml'), `placeholder distant : ${src}`);
  });

  test('une couverture en échec retombe sur le placeholder', () => {
    // Le mode liste est le mode par défaut : l'invariant y compte au moins
    // autant que sur la tuile.
    const host = mount(renderBookRow({ loan: loan({ cover_url: 'https://exemple/absent.jpg' }), onClick: () => {}, onToggleRead: () => {} }));
    const img = host.querySelector('.book-cover')!;

    img.dispatchEvent(new Event('error'));

    assert.ok((img.getAttribute('src') ?? '').startsWith('data:image/svg+xml'));
  });

  test('le titre complet est accessible en infobulle', () => {
    // Il est tronqué visuellement par le CSS.
    const host = mount(renderBookRow({ loan: loan({ titre: 'Un très long titre' }), onClick: () => {}, onToggleRead: () => {} }));

    assert.equal(host.querySelector('.book-title')!.getAttribute('title'), 'Un très long titre');
  });

  test('la pastille reprend le libellé complet du délai', () => {
    const host = mount(renderBookRow({ loan: loan({ days_left: 0 }), onClick: () => {}, onToggleRead: () => {} }));

    assert.equal(text(host, '.badge-days'), "⚠ Aujourd'hui");
  });

  test('un prêt normal n\'a qu\'une pastille', () => {
    const host = mount(renderBookRow({ loan: loan(), onClick: () => {}, onToggleRead: () => {} }));
    assert.equal(host.querySelectorAll('.badge-days').length, 1);
  });

  test('désactivé ajoute une seconde pastille explicite', () => {
    const host = mount(renderBookRow({ loan: loan({ extend_disabled: true }), onClick: () => {}, onToggleRead: () => {} }));
    const badges = [...host.querySelectorAll('.badge-days')].map((b) => b.textContent?.trim());

    assert.equal(badges.length, 2);
    assert.match(badges[1] ?? '', /Désactivé/);
  });

  test('désactivé l\'emporte sur prolongé', () => {
    // Les deux drapeaux peuvent coexister ; afficher « non prolongeable »
    // laisserait croire à une limite atteinte plutôt qu'à un blocage du compte.
    const host = mount(renderBookRow({ loan: loan({ extend_disabled: true, extended: true }), onClick: () => {}, onToggleRead: () => {} }));
    const badges = [...host.querySelectorAll('.badge-days')].map((b) => b.textContent?.trim());

    assert.equal(badges.length, 2);
    assert.match(badges[1] ?? '', /Désactivé/);
  });
});

describe('marquage « lu »', () => {
  /** Monte une tuile et une ligne avec le même prêt, pour que chaque
      assertion porte sur les deux modes de rendu — c'est la seule façon de
      voir qu'un contrôle a été branché dans l'un et oublié dans l'autre. */
  const both = (over: Partial<Loan>, onToggleRead: () => void = () => {}) => ({
    tile: mount(renderTile({ loan: loan(over), onClick: () => {}, onToggleRead })),
    row: mount(renderBookRow({ loan: loan(over), onClick: () => {}, onToggleRead })),
  });

  test('le contrôle bascule sans ouvrir le détail', () => {
    // La pastille est posée SUR la tuile, elle-même cliquable : sans
    // stopPropagation, marquer un livre lu ouvrirait la fiche dans la foulée.
    let opened = 0;
    let toggled = 0;
    const host = mount(
      renderTile({
        loan: loan(),
        onClick: () => (opened += 1),
        onToggleRead: () => (toggled += 1),
      })
    );

    click(host, '.book-tile-read');

    assert.equal(toggled, 1);
    assert.equal(opened, 0, 'le clic a traversé jusqu\'à la tuile');
  });

  test('la ligne aussi bascule sans ouvrir le détail', () => {
    let opened = 0;
    let toggled = 0;
    const host = mount(
      renderBookRow({
        loan: loan(),
        onClick: () => (opened += 1),
        onToggleRead: () => (toggled += 1),
      })
    );

    click(host, '.book-row-read');

    assert.equal(toggled, 1);
    assert.equal(opened, 0);
  });

  test('un livre lu se voit dans les deux modes', () => {
    const { tile, row } = both({ read: true });

    assert.ok(tile.querySelector('.book-tile-read.is-read'), 'pastille non marquée');
    assert.ok(tile.querySelector('.book-tile.is-read'), 'tuile non marquée');
    assert.equal(text(row, '.badge-read'), '✓ Lu');
  });

  test('un livre non lu ne porte pas le badge', () => {
    const { tile, row } = both({ read: false });

    assert.equal(row.querySelector('.badge-read'), null);
    assert.equal(tile.querySelector('.book-tile-read.is-read'), null);
    assert.ok(tile.querySelector('.book-tile-read'), 'le contrôle doit rester offert');
  });

  test('sans clé, aucun contrôle dans aucun mode', () => {
    const { tile, row } = both({ read_key: null });

    assert.equal(tile.querySelector('.book-tile-read'), null);
    assert.equal(row.querySelector('.book-row-read'), null);
  });

  test('le contrôle annonce son état à un lecteur d\'écran', () => {
    // Le glyphe seul (✓ / +) ne dit rien d'audible.
    const lu = both({ read: true });
    const pas = both({ read: false });

    assert.equal(lu.tile.querySelector('.book-tile-read')!.getAttribute('aria-pressed'), 'true');
    assert.equal(pas.tile.querySelector('.book-tile-read')!.getAttribute('aria-pressed'), 'false');
    assert.equal(lu.row.querySelector('.book-row-read')!.getAttribute('aria-pressed'), 'true');
  });

  test('l\'infobulle dit l\'action, pas l\'état', () => {
    assert.equal(
      both({ read: false }).tile.querySelector('.book-tile-read')!.getAttribute('title'),
      'Marquer comme lu'
    );
    assert.equal(
      both({ read: true }).tile.querySelector('.book-tile-read')!.getAttribute('title'),
      'Marquer non lu'
    );
  });
});
