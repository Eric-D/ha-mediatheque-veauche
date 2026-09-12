/** Seuils des pastilles de délai.

`type` n'est pas décoratif : `card.ts` filtre les emprunts affichés par
`enabled.includes(getDaysChip(loan.days_left).type)`. Décaler un seuil retire
donc des livres de la carte, silencieusement, chez un utilisateur qui a
configuré un filtre.
*/
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { getDaysChip } from '../src/helpers/days-chip.ts';

const type = (days: number | null | undefined) => getDaysChip(days).type;

describe('getDaysChip', () => {
  test('les seuils sont exactement ceux du filtre de la carte', () => {
    assert.deepEqual(
      [-1, 0, 1, 3, 4, 7, 8].map(type),
      ['overdue', 'today', 'urgent', 'urgent', 'soon', 'soon', 'ok']
    );
  });

  test("le jour même n'est ni un retard ni un délai ordinaire", () => {
    // La frontière que le décalage de fuseau horaire faisait franchir.
    assert.equal(type(0), 'today');
    assert.equal(type(-1), 'overdue');
    assert.equal(type(1), 'urgent');
  });

  test('un délai inconnu a son propre type', () => {
    // Sans cette garde, un prêt sans days_left tombait dans la branche finale
    // et affichait « ✓ undefinedj restants ».
    assert.equal(type(null), 'unknown');
    assert.equal(type(undefined), 'unknown');
    assert.equal(type(Number.NaN), 'unknown');
    assert.equal(type(Number.POSITIVE_INFINITY), 'unknown');
  });

  test('un retard est annoncé en valeur absolue', () => {
    // Sans Math.abs : « ✗ -3j de retard ».
    assert.equal(getDaysChip(-3).text, '✗ 3j de retard');
  });

  test('chaque type a son libellé', () => {
    assert.equal(getDaysChip(0).text, "⚠ Aujourd'hui");
    assert.equal(getDaysChip(2).text, '⚠ 2j restants');
    assert.equal(getDaysChip(5).text, '⚡ 5j restants');
    assert.equal(getDaysChip(30).text, '✓ 30j restants');
    assert.equal(getDaysChip(null).text, '? Date inconnue');
  });

  test('couleur de texte et couleur de fond ne sont pas interverties', () => {
    // L'inversion donne un texte rouge sur fond rouge : illisible, et le type
    // de défaut que cette suite existe pour attraper.
    for (const days of [-1, 0, 2, 5, 30, null]) {
      const chip = getDaysChip(days);
      assert.notEqual(chip.color, chip.bg, `${chip.type} : couleurs identiques`);
    }
    assert.equal(getDaysChip(-1).color, '#b71c1c');
    assert.equal(getDaysChip(-1).bg, '#ffcdd2');
  });

  test('urgent et today partagent leurs couleurs, pas leur type', () => {
    // Un décalage de seuil ne se voit donc pas à l'œil : seul le filtre change.
    assert.equal(getDaysChip(0).color, getDaysChip(2).color);
    assert.notEqual(type(0), type(2));
  });
});
