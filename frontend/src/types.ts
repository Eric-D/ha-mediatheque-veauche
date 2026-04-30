export type BadgeType =
  | 'overdue'
  | 'today'
  | 'urgent'
  | 'soon'
  | 'ok'
  | 'not_extendable';

export const ALL_BADGES: readonly BadgeType[] = [
  'overdue',
  'today',
  'urgent',
  'soon',
  'ok',
  'not_extendable',
] as const;

export type CardMode = 'all' | 'due' | 'grid';

export interface MediathequeConfig {
  type?: string;
  entity: string;
  title?: string;
  mode?: CardMode;
  badges?: BadgeType[];
  total_entity?: string;
  card_id?: string;
}

export interface Loan {
  titre: string;
  book_id?: string;
  due_date?: string;
  due_date_display: string;
  days_left: number;
  can_extend?: boolean;
  extended?: boolean;
  extend_disabled?: boolean;
  extend_url?: string;
  cover_url?: string;
  isbn?: string;
  emprunteur?: string;
}

export interface MembersMap {
  [member: string]: Loan[];
}

export interface DueAttributes {
  livres?: Loan[];
  card_id?: string;
}

export interface AllAttributes {
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
