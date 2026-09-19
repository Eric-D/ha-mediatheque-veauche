/** Mode carousel : bande de couvertures, badges, tri, tuile code-barres. */
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import {
  badgeTypeFor,
  carouselBadge,
  coverWidth,
  renderCarousel,
  sortForCarousel,
  type CarouselOptions,
} from '../src/renders/carousel.ts';
import { PLACEHOLDER_SVG } from '../src/renders/shared.ts';
import type { Loan } from '../src/types.ts';
import { click, loan, mount, text } from './helpers.ts';

const carousel = (over: Partial<CarouselOptions> = {}) =>
  mount(
    renderCarousel({
      loans: [loan()],
      cardId: '123456',
      coverHeight: 76,
      hideOkBadges: false,
      onDetail: () => {},
      onBarcode: () => {},
      ...over,
    })
  );

const tiles = (host: ParentNode) => [...host.querySelectorAll('.mc-car-tile')];
const badges = (host: ParentNode) =>
  [...host.querySelectorAll('.mc-car-badge')].map((b) => (b.textContent ?? '').trim());

describe('sortForCarousel', () => {
  const named = (titre: string, days: number | null, emprunteur = 'Jean') =>
    loan({ titre, days_left: days, emprunteur });

  test('le plus urgent en premier', () => {
    const sorted = sortForCarousel([named('C', 20), named('A', -2), named('B', 3)]);

    assert.deepEqual(sorted.map((l) => l.titre), ['A', 'B', 'C']);
  });

  test('une échéance illisible part en fin de bande', () => {
    // La trier comme un retard remplirait le début de la bande de livres dont
    // on ne sait rien.
    const sorted = sortForCarousel([named('inconnu', null), named('retard', -1)]);

    assert.deepEqual(sorted.map((l) => l.titre), ['retard', 'inconnu']);
  });

  test('à égalité, l\'ordre est stable d\'un cycle à l\'autre', () => {
    // Sans départage, les vignettes changeraient de place à chaque
    // rafraîchissement, sur une carte qu'on regarde en passant.
    const input = [named('Zoé', 5, 'Luc'), named('Ana', 5, 'Luc'), named('Ana', 5, 'Eric')];

    const once = sortForCarousel(input).map((l) => `${l.emprunteur}/${l.titre}`);
    const twice = sortForCarousel([...input].reverse()).map((l) => `${l.emprunteur}/${l.titre}`);

    assert.deepEqual(once, ['Eric/Ana', 'Luc/Ana', 'Luc/Zoé']);
    assert.deepEqual(once, twice);
  });

  test('ne mute pas la liste reçue', () => {
    // Elle vient des attributs de l'entité : la trier en place modifierait
    // l'état que HA compare d'un cycle à l'autre.
    const input = [named('C', 20), named('A', -2)];

    sortForCarousel(input);

    assert.deepEqual(input.map((l) => l.titre), ['C', 'A']);
  });
});

describe('badges du carousel', () => {
  const typeOf = (over: Partial<Loan>) => badgeTypeFor(loan(over));

  test('les seuils viennent de days-chip, ils ne sont pas recalculés', () => {
    assert.equal(typeOf({ days_left: -1 }), 'overdue');
    assert.equal(typeOf({ days_left: 0 }), 'today');
    assert.equal(typeOf({ days_left: 3 }), 'urgent');
    assert.equal(typeOf({ days_left: 7 }), 'soon');
    assert.equal(typeOf({ days_left: 8 }), 'ok');
    assert.equal(typeOf({ days_left: null }), 'unknown');
  });

  test('un livre non prolongeable et sans urgence passe en violet', () => {
    assert.equal(typeOf({ days_left: 20, extended: true }), 'not_extendable');
    assert.equal(typeOf({ days_left: 20, extend_disabled: true }), 'not_extendable');
  });

  test("l'urgence l'emporte sur le non-prolongeable", () => {
    // La couleur dit quand agir : masquer le rouge derrière du violet ferait
    // perdre l'urgence sur un livre déjà en retard.
    assert.equal(typeOf({ days_left: -1, extended: true }), 'overdue');
    assert.equal(typeOf({ days_left: 0, extend_disabled: true }), 'today');
    assert.equal(typeOf({ days_left: 2, extended: true }), 'urgent');
  });

  test('les libellés sont courts et lisibles sans convention', () => {
    assert.equal(carouselBadge(loan({ days_left: -3 }), false)!.text, 'Retard');
    assert.equal(carouselBadge(loan({ days_left: 0 }), false)!.text, 'Auj.');
    assert.equal(carouselBadge(loan({ days_left: 6 }), false)!.text, '6 j');
    assert.equal(carouselBadge(loan({ days_left: null }), false)!.text, '?');
  });

  test('hide_ok_badges masque les livres sans échéance proche', () => {
    assert.equal(carouselBadge(loan({ days_left: 20 }), true), null);
    assert.ok(carouselBadge(loan({ days_left: 6 }), true), 'un délai proche reste visible');
  });

  test('hide_ok_badges ne masque pas un non-prolongeable', () => {
    // Il n'est plus de type « ok », et cette information mérite de rester.
    assert.equal(carouselBadge(loan({ days_left: 20, extended: true }), true)!.text, '20 j');
  });

  test('chaque type a sa couleur, et elles diffèrent', () => {
    const seen = new Set(
      [-1, 0, 2, 6, 20].map((d) => carouselBadge(loan({ days_left: d }), false)!.bg)
    );

    assert.ok(seen.size >= 4, `palette trop uniforme : ${[...seen].join(', ')}`);
  });
});

describe('renderCarousel', () => {
  test('une tuile par prêt, dans l\'ordre du tri', () => {
    const host = carousel({
      loans: [loan({ titre: 'C', days_left: 20 }), loan({ titre: 'A', days_left: 1 })],
    });

    assert.equal(tiles(host).length, 2);
    assert.match(tiles(host)[0]!.getAttribute('aria-label') ?? '', /^A —/);
  });

  test('aucun en-tête n\'est rendu', () => {
    // Le mode existe pour économiser de la hauteur : un en-tête lui coûterait
    // le tiers de sa boîte.
    const host = carousel();

    assert.equal(host.querySelector('.mediatheque-header'), null);
    assert.equal(host.querySelector('.mediatheque-title'), null);
  });

  test('le tap sur une couverture ouvre SA fiche', () => {
    const opened: string[] = [];
    const host = carousel({
      loans: [loan({ titre: 'A', days_left: 1 }), loan({ titre: 'B', days_left: 2 })],
      onDetail: (l) => opened.push(l.titre),
    });

    (tiles(host)[1] as HTMLElement).click();

    assert.deepEqual(opened, ['B']);
  });

  test('le tap sur la tuile code-barres n\'ouvre pas de fiche', () => {
    // Deux rappels de même signature : les intervertir ouvrirait la fiche du
    // premier livre au lieu du code-barres.
    const calls: string[] = [];
    const host = carousel({
      onDetail: () => calls.push('detail'),
      onBarcode: () => calls.push('barcode'),
    });

    click(host, '.mc-car-barcode');

    assert.deepEqual(calls, ['barcode']);
  });

  test('pas de card_id, pas de tuile code-barres', () => {
    assert.equal(carousel({ cardId: '' }).querySelector('.mc-car-barcode'), null);
    assert.ok(carousel({ cardId: '123' }).querySelector('.mc-car-barcode'));
  });

  test('zéro prêt : le message remplace la bande, la tuile code-barres reste', () => {
    // Utile au moment précis où l'on emprunte, donc où la liste est vide.
    const host = carousel({ loans: [] });

    assert.equal(text(host, '.mc-car-empty'), 'Aucun livre à afficher');
    assert.equal(host.querySelector('.mc-car-strip'), null);
    assert.ok(host.querySelector('.mc-car-barcode'), 'la tuile code-barres a disparu');
  });

  test('un livre lu porte le liseré, un autre non', () => {
    assert.ok(carousel({ loans: [loan({ read: true })] }).querySelector('.mc-car-tile.is-read'));
    assert.equal(
      carousel({ loans: [loan({ read: false })] }).querySelector('.mc-car-tile.is-read'),
      null
    );
  });

  test('aucune bascule « lu » sur la tuile : elle vit dans la fiche', () => {
    // Une pastille de 20 px sur une vignette de 52 px invite au clic
    // accidentel, sur une carte qu'on touche en passant.
    const host = carousel({ loans: [loan({ read: false })] });

    assert.equal(host.querySelector('.book-tile-read'), null);
  });

  test('hide_ok_badges retire les badges de la bande', () => {
    const loans = [loan({ days_left: 20 }), loan({ days_left: 2 })];

    assert.deepEqual(badges(carousel({ loans, hideOkBadges: true })), ['2 j']);
    assert.equal(badges(carousel({ loans, hideOkBadges: false })).length, 2);
  });

  test('la hauteur configurée pilote les deux dimensions', () => {
    const host = carousel({ coverHeight: 100 });
    const style = tiles(host)[0]!.getAttribute('style') ?? '';

    assert.match(style, /height:100px/);
    assert.match(style, /width:68px/, 'la largeur doit suivre le ratio, pas rester figée');
  });

  test('sans couverture, le placeholder inliné', () => {
    // Aucune requête réseau ni CDN : la carte doit fonctionner en WebView
    // Android hors ligne.
    const host = carousel({ loans: [loan({ cover_url: null })] });
    const src = host.querySelector('.mc-car-cover')!.getAttribute('src') ?? '';

    assert.ok(src.startsWith('data:image/svg+xml'), `placeholder distant : ${src}`);
    assert.equal(src, PLACEHOLDER_SVG);
  });

  test('les couvertures se chargent en différé', () => {
    // Une bande peut porter vingt images hors écran.
    assert.equal(
      carousel().querySelector('.mc-car-cover')!.getAttribute('loading'),
      'lazy'
    );
  });

  test('tuiles et bouton sont annoncés aux lecteurs d\'écran', () => {
    const host = carousel({
      loans: [loan({ titre: 'Astérix', emprunteur: 'Lucas', due_date_display: '25 sept.' })],
    });

    assert.equal(
      tiles(host)[0]!.getAttribute('aria-label'),
      'Astérix — Lucas — 25 sept.'
    );
    assert.equal(
      host.querySelector('.mc-car-barcode')!.getAttribute('aria-label'),
      'Afficher la carte de bibliothèque'
    );
    // Le badge répéterait une information déjà portée par l'aria-label.
    assert.equal(host.querySelector('.mc-car-badge')!.getAttribute('aria-hidden'), 'true');
  });

  test('un prêt sans emprunteur ne produit pas de tiret orphelin', () => {
    const host = carousel({
      loans: [loan({ titre: 'Seul', emprunteur: null, due_date_display: '25 sept.' })],
    });

    assert.equal(tiles(host)[0]!.getAttribute('aria-label'), 'Seul — 25 sept.');
  });
});

describe('coverWidth', () => {
  test('la largeur suit le ratio d\'une couverture de livre', () => {
    assert.equal(coverWidth(76), 52);
    assert.equal(coverWidth(100), 68);
  });
});
