import type { AppData } from './types';

/** Nothing created yet — every module shows its first-run empty state. */
export function emptyScenario(): AppData {
  return {
    paths: [],
    actions: [],
    goals: [],
  };
}
