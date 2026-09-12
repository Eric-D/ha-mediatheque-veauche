/** Budget de réessai de la carte.

Les invariants testés ici sont nommés dans CLAUDE.md : dix essais, délai
croissant plafonné à 15 s — soit environ 100 s d'indisponibilité continue — et
remise à zéro au rattachement de l'élément. Épuisé, le quota fait basculer la
carte du dernier rendu conservé vers un message explicite : afficher
indéfiniment des emprunts périmés sans aucun indice est le comportement qu'on
cherche à éviter.
*/
import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, mock, test } from 'node:test';

import { RetryScheduler } from '../src/helpers/retry.ts';

describe('RetryScheduler', () => {
  beforeEach(() => mock.timers.enable({ apis: ['setTimeout'] }));
  afterEach(() => mock.timers.reset());

  const scheduler = () => {
    let fired = 0;
    const retry = new RetryScheduler('test-card', () => (fired += 1));
    return { retry, fired: () => fired };
  };

  test('le premier essai attend deux secondes', () => {
    const { retry, fired } = scheduler();

    retry.schedule();
    mock.timers.tick(1999);
    assert.equal(fired(), 0);

    mock.timers.tick(1);
    assert.equal(fired(), 1);
  });

  test('le délai croît à chaque essai', () => {
    const { retry, fired } = scheduler();

    retry.schedule();
    mock.timers.tick(2000);
    retry.schedule();
    mock.timers.tick(3999);
    assert.equal(fired(), 1, 'le deuxième essai doit attendre 4 s');

    mock.timers.tick(1);
    assert.equal(fired(), 2);
  });

  test('le délai plafonne à quinze secondes', () => {
    // Sans plafond, le dixième essai attendrait vingt secondes.
    const { retry, fired } = scheduler();

    for (let i = 0; i < 8; i++) {
      retry.schedule();
      mock.timers.tick(15000);
    }
    retry.schedule();
    mock.timers.tick(15000);

    assert.equal(fired(), 9);
  });

  test('le quota est de dix essais', () => {
    const { retry, fired } = scheduler();

    for (let i = 0; i < 12; i++) {
      retry.schedule();
      mock.timers.tick(15000);
    }

    assert.equal(fired(), 10);
    assert.equal(retry.exhausted, true);
  });

  test("tant qu'il reste des essais, le quota n'est pas épuisé", () => {
    // C'est ce drapeau qui décide de conserver ou non le dernier rendu.
    const { retry } = scheduler();

    for (let i = 0; i < 10; i++) {
      retry.schedule();
      mock.timers.tick(15000);
    }

    assert.equal(retry.exhausted, false);
  });

  test('un essai déjà programmé ne se dédouble pas', () => {
    // Plusieurs échecs rapprochés ne doivent pas consommer le quota d'un coup
    // ni déclencher une rafale de rendus.
    const { retry, fired } = scheduler();

    retry.schedule();
    retry.schedule();
    retry.schedule();
    mock.timers.tick(2000);

    assert.equal(fired(), 1);
  });

  test('reset rend le quota et annule ce qui est en vol', () => {
    // Appelé par connectedCallback : changer de vue ou déplacer la carte doit
    // lui redonner ses dix essais.
    const { retry, fired } = scheduler();

    for (let i = 0; i < 12; i++) {
      retry.schedule();
      mock.timers.tick(15000);
    }
    retry.reset();

    assert.equal(retry.exhausted, false);
    retry.schedule();
    mock.timers.tick(2000);
    assert.equal(fired(), 11, 'le compteur doit repartir du premier délai');
  });

  test('cancel empêche le tir sans rendre le quota', () => {
    // Appelé par disconnectedCallback : aucun timer ne doit survivre au
    // détachement de l'élément.
    const { retry, fired } = scheduler();

    retry.schedule();
    retry.cancel();
    mock.timers.tick(60000);

    assert.equal(fired(), 0);
  });

  test('après cancel, un nouvel essai reste programmable', () => {
    const { retry, fired } = scheduler();

    retry.schedule();
    retry.cancel();
    retry.schedule();
    mock.timers.tick(4000);

    assert.equal(fired(), 1);
  });
});
