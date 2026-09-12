/** Encodeur Code 39.

Ces tests portent sur l'encodage lui-même, pas sur la modale qui l'affiche. Un
code-barres faux se rend parfaitement : le seul symptôme est un scanner de
médiathèque qui refuse la carte, à la banque de prêt, sans qu'aucun test ni
aucune relecture n'ait pu le voir.
*/
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { generateCode39Svg } from '../src/helpers/barcode.ts';

/** Largeurs des rectangles noirs, dans l'ordre. */
const bars = (svg: string): number[] =>
  [...svg.matchAll(/<rect x="\d+" y="0" width="(\d+)"[^>]*fill="#000"/g)].map((m) => Number(m[1]));

/** Positions de départ des rectangles noirs, dans l'ordre. */
const positions = (svg: string): number[] =>
  [...svg.matchAll(/<rect x="(\d+)" y="0" width="\d+"[^>]*fill="#000"/g)].map((m) => Number(m[1]));

describe('generateCode39Svg', () => {
  test('encadre le code des délimiteurs * de Code 39', () => {
    // Sans eux, aucun scanner ne reconnaît le début ni la fin du code : la
    // carte devient illisible sans que le rendu change d'aspect.
    assert.equal(bars(generateCode39Svg('A')).length, 15);
    assert.equal(bars(generateCode39Svg('AAA')).length, 25);
  });

  test("le ratio large/étroit vaut 3, comme l'exige la norme", () => {
    // Un ratio de 2 sort de la tolérance des scanners bas de gamme, qui sont
    // exactement ceux que Code 39 a été choisi pour satisfaire.
    const widths = new Set(bars(generateCode39Svg('0123456789')));

    assert.deepEqual([...widths].sort((a, b) => a - b), [2, 6]);
  });

  test('barres et espaces alternent : deux barres ne se touchent jamais', () => {
    // Intervertir les indices pairs et impairs produit un SVG plausible dont
    // chaque symbole est faux.
    const svg = generateCode39Svg('12345');
    const starts = positions(svg);
    const widths = bars(svg);

    for (let i = 0; i < starts.length - 1; i++) {
      assert.ok(
        starts[i] + widths[i] < starts[i + 1],
        `barres ${i} et ${i + 1} jointives : un espace manque`
      );
    }
  });

  test('chaque caractère ajoute exactement cinq barres', () => {
    // Propriété structurelle de Code 39 : 9 éléments alternés par caractère.
    assert.equal(bars(generateCode39Svg('AB')).length, 20);
  });

  test("aucun caractère de l'entrée n'atteint la sortie", () => {
    // L'invariant de sûreté réel, et ce qui rend unsafeSVG acceptable dans la
    // modale : ce qui sort ne contient que des entiers calculés. Un filtre par
    // table blanche ne suffirait pas si le texte était réinterpolé ailleurs.
    const svg = generateCode39Svg('900"><script>alert(1)</script>');

    assert.ok(svg.startsWith('<svg '));
    assert.doesNotMatch(svg, /script|alert/i);
    assert.doesNotMatch(svg, /900/);
    assert.doesNotMatch(svg, /onerror|onload/i);
  });

  test('les caractères hors table sont ignorés, pas encodés', () => {
    // « ! » n'a pas de motif : l'encoder mettrait « undefined » dans la chaîne
    // de motifs, donc des largeurs NaN.
    const clean = generateCode39Svg('AB');

    assert.equal(generateCode39Svg('A!B'), clean);
    assert.doesNotMatch(clean, /NaN|undefined/);
  });

  test('les minuscules sont encodées, pas jetées', () => {
    assert.equal(generateCode39Svg('abc'), generateCode39Svg('ABC'));
  });

  test("le * de l'entrée ne s'ajoute pas aux délimiteurs", () => {
    // Un * au milieu terminerait le code prématurément pour le scanner.
    assert.equal(generateCode39Svg('A*B'), generateCode39Svg('AB'));
  });

  test('une entrée vide ne produit rien', () => {
    assert.equal(generateCode39Svg(''), '');
  });

  test('une entrée entièrement hors table ne produit rien', () => {
    // Plutôt qu'un code réduit à ses délimiteurs, que le scanner lirait comme
    // une carte vide.
    assert.equal(generateCode39Svg('!!!'), '');
  });

  test('la zone silencieuse encadre le code', () => {
    // Sans marge blanche, le scanner ne trouve pas le bord du symbole.
    const svg = generateCode39Svg('A');

    assert.ok(positions(svg)[0] >= 20, 'zone silencieuse absente à gauche');
    assert.match(svg, /fill="#fff"/);
  });
});
