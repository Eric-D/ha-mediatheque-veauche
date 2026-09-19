/** Dimensions annoncées à la vue « sections » de Home Assistant.

Sorti de `card.ts` pour être testable : le runner de Node refuse les
décorateurs, donc rien de ce qui vit dans la classe n'est couvert. C'est la
même raison qui a fait sortir `coordinator.py` de sa closure côté Python.

`rows` vaut **'auto'**, jamais un nombre. Un nombre fait poser à
`hui-grid-section` la classe `fit-rows`, qui applique une hauteur **dure** :

    height: calc(rows * (row-height + row-gap) - row-gap)

soit 248 px pour 4 rangées. Le contenu plus haut déborde de cette boîte, et la
grille place la carte suivante juste après les 248 px — donc par-dessus le
débordement. C'est exactement ce qu'on a observé : une carte posée dessous
recouvrait la fin de la liste des emprunts.

Avec 'auto', la classe `fit-rows` n'est pas posée, aucune hauteur n'est
imposée, et le `grid-auto-rows: auto` du conteneur dimensionne la rangée sur le
contenu réel. C'est d'ailleurs le défaut de Home Assistant
(`DEFAULT_GRID_SIZE`) : la carte s'était inscrite d'elle-même à une hauteur
fixe.

Vérifié contre les sources du frontend (`sections/hui-grid-section.ts` et
`common/compute-card-grid-size.ts`) : `rows` y est typé `number | "auto"`, et
`computeCardGridSize` laisse passer la chaîne sans la soumettre au clamp de
`min_rows`/`max_rows`.

**Ne pas y remettre un nombre** pour « réserver de la place » : la hauteur
d'une carte d'emprunts dépend du nombre de livres, qu'aucune constante ne
connaît.
*/
import type { CardMode } from '../types.js';

/** Sous-ensemble de LovelaceGridOptions du frontend de Home Assistant.

    Tous les champs y sont optionnels et `rows` accepte la chaîne 'auto' ;
    typer `rows: number` — ce qui était le cas — rendait la correction
    impossible à écrire sans que `tsc` proteste. */
export interface GridOptions {
  columns?: number | 'full';
  rows?: number | 'auto';
  min_columns?: number;
  max_columns?: number;
  min_rows?: number;
  max_rows?: number;
}

export function gridOptionsFor(mode: CardMode | undefined): GridOptions {
  if (mode === 'carousel') {
    // 'full' plutôt que 12 : la bande est conçue pour occuper la largeur de la
    // section, et sa hauteur ne dépend pas de sa largeur — elle ne gagne rien
    // à être réduite, elle perd des couvertures visibles.
    return { columns: 'full', rows: 'auto', min_rows: 2 };
  }
  return {
    columns: 12,
    // Le mode couvertures reste lisible plus étroit : ses tuiles se replient,
    // alors qu'une ligne de liste tronque son titre.
    min_columns: mode === 'covers' ? 4 : 6,
    rows: 'auto',
    // Sans effet sur la hauteur tant que `rows` vaut 'auto' — le clamp ne
    // s'applique qu'aux nombres. Gardé pour borner le redimensionnement à la
    // main dans l'éditeur.
    min_rows: 2,
  };
}

/** Estimation pour les vues masonry, qui ignorent getGridOptions().

    Purement indicative : elle sert à équilibrer les colonnes, et ne rogne
    rien. C'est pourquoi le débordement ne se produisait qu'en mode sections. */
export function cardSizeFor(mode: CardMode | undefined): number {
  // Le carousel vaut 2 comme les couvertures : une centaine de pixels, soit
  // deux unités de 50.
  return mode === 'covers' || mode === 'carousel' ? 2 : 4;
}
