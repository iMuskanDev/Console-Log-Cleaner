import { ConsoleMethod } from './consoleMethods';

export interface ConsoleMethodPair {
  start: ConsoleMethod;
  ends: ConsoleMethod[];
  description: string;
}

/**
 * Registry of paired console methods (e.g. console.time / console.timeEnd, console.group / console.groupEnd).
 * Used by detector/removal engine to prevent leaving orphaned closing or logging calls.
 */
export const PAIRED_CONSOLE_METHODS: readonly ConsoleMethodPair[] = [
  {
    start: 'time',
    ends: ['timeEnd', 'timeLog'],
    description: 'Timer paired statements'
  },
  {
    start: 'group',
    ends: ['groupEnd'],
    description: 'Group paired statements'
  },
  {
    start: 'groupCollapsed',
    ends: ['groupEnd'],
    description: 'Collapsed group paired statements'
  }
];

export function isPairedStartMethod(method: ConsoleMethod): boolean {
  return PAIRED_CONSOLE_METHODS.some(pair => pair.start === method);
}

export function isPairedEndMethod(method: ConsoleMethod): boolean {
  return PAIRED_CONSOLE_METHODS.some(pair => pair.ends.includes(method));
}

export function getPairedEndMethods(method: ConsoleMethod): readonly ConsoleMethod[] {
  const pair = PAIRED_CONSOLE_METHODS.find(p => p.start === method);
  return pair ? pair.ends : [];
}
