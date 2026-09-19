/** Dimensions annoncées à la vue « sections ».

Ces fonctions vivaient dans `card.ts`, hors d'atteinte du runner — qui refuse
les décorateurs — donc rien ne couvrait le défaut qu'elles portaient : une
hauteur fixe sous laquelle la carte suivante venait se superposer.
*/
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { cardSizeFor, gridOptionsFor } from '../src/helpers/grid.ts';

describe('gridOptionsFor', () => {
  test('la hauteur est toujours « auto », jamais un nombre', () => {
    // Un nombre fait poser par hui-grid-section la classe `fit-rows`, qui
    // applique une hauteur DURE de `rows * (56 + 8) - 8` px. Le contenu plus
    // haut déborde, et la grille place la carte suivante juste après cette
    // hauteur — donc par-dessus le débordement.
    for (const mode of ['list', 'covers', undefined] as const) {
      assert.equal(gridOptionsFor(mode).rows, 'auto', `mode ${mode}`);
    }
  });

  test('aucun mode ne réintroduit une hauteur chiffrée', () => {
    // La garde porte sur le type, pas sur une valeur : c'est « un nombre »
    // qui casse, quel qu'il soit.
    for (const mode of ['list', 'covers', undefined] as const) {
      assert.notEqual(typeof gridOptionsFor(mode).rows, 'number', `mode ${mode}`);
    }
  });

  test('le mode couvertures se replie plus étroit que la liste', () => {
    // Une tuile se réarrange, une ligne de liste tronque son titre.
    assert.ok(gridOptionsFor('covers').min_columns! < gridOptionsFor('list').min_columns!);
  });

  test('la carte occupe toute la largeur par défaut', () => {
    assert.equal(gridOptionsFor('list').columns, 12);
  });

  test('min_rows reste borné pour le redimensionnement manuel', () => {
    // Sans effet sur la hauteur tant que `rows` vaut 'auto' — le clamp de
    // computeCardGridSize ne s'applique qu'aux nombres — mais l'éditeur s'en
    // sert pour borner la poignée.
    assert.equal(gridOptionsFor('list').min_rows, 2);
  });
});

describe('cardSizeFor', () => {
  test('les vues masonry reçoivent une estimation, pas une contrainte', () => {
    // getCardSize ne sert qu'à équilibrer les colonnes et ne rogne rien :
    // c'est pourquoi le débordement ne se produisait qu'en mode sections.
    assert.equal(cardSizeFor('covers'), 2);
    assert.equal(cardSizeFor('list'), 4);
    assert.equal(cardSizeFor(undefined), 4);
  });
});
