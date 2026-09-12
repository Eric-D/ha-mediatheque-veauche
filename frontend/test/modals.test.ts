/** Les trois modales : détail, confirmation de prolongation, code-barres. */
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { renderBarcodeModal, renderConfirmModal, renderDetailModal } from '../src/renders/modals.ts';
import { PLACEHOLDER_SVG } from '../src/renders/shared.ts';
import { click, loan, mount, text } from './helpers.ts';

/** Les clics remontent, comme dans un vrai navigateur : un clic sur un bouton
    déclenche aussi le gestionnaire de l'overlay. C'est exactement pourquoi
    card.ts filtre par `e.target === e.currentTarget` (`_onOverlayClick` et ses
    deux jumeaux). `buttons` écarte donc l'overlay, et `selfClicks` retient les
    seuls clics dont l'élément porteur du gestionnaire est lui-même la cible. */
const spies = () => {
  const calls: string[] = [];
  const selfClicks: string[] = [];
  return {
    calls,
    selfClicks,
    get buttons() {
      return calls.filter((name) => name !== 'overlay');
    },
    on: (name: string) => (e?: Event) => {
      calls.push(name);
      if (e && e.target === e.currentTarget) selfClicks.push(name);
    },
  };
};

describe('renderDetailModal', () => {
  const detail = (over: Record<string, unknown> = {}, s = spies()) =>
    mount(
      renderDetailModal({
        loan: loan(),
        onOverlayClick: s.on('overlay'),
        onClose: s.on('close'),
        onExtend: s.on('extend'),
        ...over,
      } as never)
    );

  test('chaque bouton appelle SON gestionnaire', () => {
    // Trois rappels de même signature : les intervertir fermerait la modale en
    // croyant prolonger. Ni le typage ni le linter ne le verraient.
    const s = spies();
    const host = detail({}, s);

    click(host, '.mc-modal-btn-close');
    click(host, '.mc-modal-btn-extend');

    assert.deepEqual(s.buttons, ['close', 'extend']);
  });

  test('le clic sur le fond appelle le gestionnaire d\'overlay', () => {
    const s = spies();
    const host = detail({}, s);

    click(host, '.mc-modal-overlay');

    assert.deepEqual(s.selfClicks, ['overlay']);
  });

  test('pas de bouton Prolonger quand le prêt ne l\'est pas', () => {
    const host = detail({ loan: loan({ can_extend: false }) });

    assert.equal(host.querySelector('.mc-modal-btn-extend'), null);
    assert.ok(host.querySelector('.mc-modal-btn-close'));
  });

  test('l\'ISBN n\'apparaît que s\'il existe', () => {
    assert.equal(detail({ loan: loan({ isbn: null }) }).querySelector('.mc-modal-isbn'), null);
    assert.match(
      text(detail({ loan: loan({ isbn: '978-2070612758' }) }), '.mc-modal-isbn'),
      /978-2070612758/
    );
  });

  test('le titre du prêt est affiché', () => {
    assert.equal(text(detail({ loan: loan({ titre: 'Astérix' }) }), '.mc-modal-title'), 'Astérix');
  });

  test('sans couverture, le placeholder inliné', () => {
    const host = detail({ loan: loan({ cover_url: null }) });

    assert.equal(host.querySelector('.mc-modal-cover')!.getAttribute('src'), PLACEHOLDER_SVG);
  });
});

describe('renderConfirmModal', () => {
  const confirm = (s = spies()) =>
    mount(
      renderConfirmModal({
        loan: loan({ titre: 'Astérix' }),
        onOverlayClick: s.on('overlay'),
        onCancel: s.on('cancel'),
        onConfirm: s.on('confirm'),
      } as never)
    );

  test('Annuler et Confirmer ne sont pas intervertis', () => {
    // L'inversion prolongerait un emprunt sur un clic « Annuler », et la
    // prolongation est irréversible côté portail.
    const s = spies();
    const host = confirm(s);

    click(host, '.mc-modal-btn-cancel');
    click(host, '.mc-modal-btn-confirm');

    assert.deepEqual(s.buttons, ['cancel', 'confirm']);
  });

  test('le titre du prêt est rappelé', () => {
    assert.equal(text(confirm(), '.mc-confirm-text'), 'Astérix');
  });

  test('le clic sur le fond appelle le gestionnaire d\'overlay', () => {
    const s = spies();
    click(confirm(s), '.mc-confirm-overlay');

    assert.deepEqual(s.selfClicks, ['overlay']);
  });
});

describe('renderBarcodeModal', () => {
  const barcode = (cardId: string, s = spies()) =>
    mount(
      renderBarcodeModal({
        cardId,
        onOverlayClick: s.on('overlay'),
        onClose: s.on('close'),
      } as never)
    );

  test('l\'identifiant est affiché et encodé', () => {
    const host = barcode('900123');

    assert.equal(text(host, '.mc-barcode-id'), '900123');
    assert.ok(host.querySelector('.mc-barcode-svg svg'));
  });

  test('Fermer appelle son gestionnaire, pas celui de l\'overlay', () => {
    const s = spies();
    click(barcode('900123', s), '.mc-barcode-close');

    assert.deepEqual(s.buttons, ['close']);
    // Le clic remonte bien jusqu'à l'overlay, mais sans le prendre pour
    // cible : c'est ce que teste card.ts avant de fermer, et c'est pourquoi
    // cliquer « Fermer » ne déclenche pas deux fermetures.
    assert.ok(s.calls.includes('overlay'));
    assert.ok(!s.selfClicks.includes('overlay'));
  });

  test('aucun caractère du code-barres n\'échappe à la table blanche', () => {
    // C'est le seul unsafeSVG de la carte : sa sûreté tient à ce filtrage, et
    // à rien d'autre. Une refactorisation le casserait sans bruit.
    const host = barcode('<script>alert(1)</script>');

    assert.equal(host.querySelector('script'), null);
    assert.ok(host.querySelector('.mc-barcode-svg'));
  });

  test('un identifiant vide ne produit pas de SVG cassé', () => {
    const host = barcode('');

    assert.equal(text(host, '.mc-barcode-id'), '');
    assert.ok(host.querySelector('.mc-barcode-dialog'));
  });
});
