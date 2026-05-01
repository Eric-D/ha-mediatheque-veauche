export const MEDIATHEQUE_CARD_VERSION = '3.2.2';

export function logBanner(): void {
  // eslint-disable-next-line no-console
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
  // eslint-disable-next-line no-console
  console[level](prefix + ' ' + msg, ...styles, ...args);
}
