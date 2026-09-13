export type BadgeType =
  | 'overdue'
  | 'today'
  | 'urgent'
  | 'soon'
  | 'ok'
  | 'not_extendable'
  | 'unknown';

export const ALL_BADGES: readonly BadgeType[] = [
  'overdue',
  'today',
  'urgent',
  'soon',
  'ok',
  'not_extendable',
  'unknown',
] as const;

export type CardMode = 'list' | 'covers';

// Aliases acceptés pour rétro-compat (anciens dashboards) — normalisés vers
// les modes canoniques dans setConfig. Important : ne JAMAIS retirer un alias,
// sinon les vieilles cartes encore en YAML cassent avec 'Erreur de configuration'.
export const MODE_ALIASES: Record<string, CardMode> = {
  all: 'list',
  grid: 'covers',
  due: 'covers',
};

export const ALL_MODES: readonly CardMode[] = ['list', 'covers'] as const;

export interface MediathequeConfig {
  type?: string;
  entity: string;
  title?: string;
  mode?: CardMode;
  badges?: BadgeType[];
  total_entity?: string;
  card_id?: string;
}

// Les champs optionnels arrivent en `null` depuis Python, pas en `undefined` :
// les typer `?: string` inviterait un `=== undefined` ou un `??` silencieusement
// faux.
export interface Loan {
  titre: string;
  book_id?: string | null;
  due_date?: string | null;
  due_date_display: string;
  // null = date d'échéance illisible côté scraper. Surtout pas 0, qui veut
  // dire « à rendre aujourd'hui ».
  days_left: number | null;
  can_extend?: boolean;
  extended?: boolean;
  extend_disabled?: boolean;
  extend_url?: string | null;
  cover_url?: string | null;
  isbn?: string | null;
  emprunteur?: string | null;
  // Dérivés côté Python au moment de servir, comme days_left : jamais écrits
  // dans le cache disque. `read_key` est calculé par l'intégration et renvoyé
  // tel quel au service — surtout pas recalculé ici, la normalisation du titre
  // de repli ne se traduit pas fidèlement en TypeScript.
  read?: boolean;
  read_key?: string | null;
}

export interface MembersMap {
  [member: string]: Loan[];
}

// Fraîcheur des données, exposée par tous les sensors d'emprunts.
export interface FreshnessAttributes {
  last_success?: string | null;
  fetch_ok?: boolean;
  // Jamais lu par la carte : son seul rôle est de faire varier les attributs
  // à chaque échec, sans quoi HA dédoublonne l'écriture d'état et la carte ne
  // re-render pas.
  last_error_at?: string | null;
}

export interface DueAttributes extends FreshnessAttributes {
  livres?: Loan[];
  card_id?: string;
}

export interface AllAttributes extends FreshnessAttributes {
  membres?: MembersMap;
  compte?: string;
  card_id?: string;
}

export interface DaysChip {
  type: BadgeType;
  text: string;
  color: string;
  bg: string;
}

export interface HassEntityState {
  state: string;
  attributes: Record<string, unknown>;
}

export interface HassLike {
  states: Record<string, HassEntityState | undefined>;
  callService: (
    domain: string,
    service: string,
    serviceData?: Record<string, unknown>
  ) => Promise<unknown>;
}
