/** Éléments partagés par les fonctions de rendu. */

/** Couverture de repli, inlinée : la carte doit fonctionner hors ligne. */
export const PLACEHOLDER_SVG =
  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2252%22 height=%2276%22 viewBox=%220 0 52 76%22%3E%3Crect width=%2252%22 height=%2276%22 fill=%22%23e0e0e0%22 rx=%224%22/%3E%3Ctext x=%2226%22 y=%2242%22 text-anchor=%22middle%22 font-family=%22sans-serif%22 font-size=%2220%22 fill=%22%239e9e9e%22%3E%F0%9F%93%96%3C/text%3E%3C/svg%3E';

/** Repli sur le placeholder quand la couverture distante échoue. */
export const onCoverError = (e: Event): void => {
  (e.target as HTMLImageElement).src = PLACEHOLDER_SVG;
};
