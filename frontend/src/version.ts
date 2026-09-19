export const MEDIATHEQUE_CARD_VERSION = '4.2.0';

export function logBanner(): void {
  // console volontaire : c'est la convention des cartes Lovelace, et le bandeau
  // de version est le premier élément de diagnostic dans ce projet.
  console.info(
    `%c MEDIATHEQUE-CARD %c ${MEDIATHEQUE_CARD_VERSION} IS INSTALLED `,
    'color: white; background: #2e7d32; font-weight: bold;',
    'color: #2e7d32; background: #c8e6c9; font-weight: bold;'
  );
}

type LogLevel = 'info' | 'warn' | 'error';

export function mcLog(
  level: LogLevel,
  card: string,
  msg: string,
  ...args: unknown[]
): void {
  const prefix = `%c MEDIATHEQUE-CARD %c [${card}]`;
  const styles = [
    'color: white; background: #2e7d32; font-weight: bold;',
    'color: #2e7d32; font-weight: bold;',
  ];
  // console volontaire : voir logBanner.
  console[level](prefix + ' ' + msg, ...styles, ...args);
}
