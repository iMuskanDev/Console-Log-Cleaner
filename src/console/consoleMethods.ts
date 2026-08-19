export const CONSOLE_METHODS = [
  'log',
  'info',
  'warn',
  'error',
  'debug',
  'trace',
  'dir',
  'table',
  'time',
  'timeEnd',
  'timeLog',
  'count',
  'countReset',
  'assert',
  'clear',
  'group',
  'groupCollapsed',
  'groupEnd'
] as const;

export type ConsoleMethod = typeof CONSOLE_METHODS[number];

export const CONSOLE_METHOD_SET: ReadonlySet<string> = new Set(CONSOLE_METHODS);

export function isConsoleMethod(methodName: string): methodName is ConsoleMethod {
  return CONSOLE_METHOD_SET.has(methodName);
}
