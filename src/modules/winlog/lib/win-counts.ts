import type { Win } from '../types/win'

export interface WinKindCounts {
  /** Completed Actions — the small wins. */
  small: number
  /** Achieved Goals — the big wins. */
  big: number
}

/**
 * The one way wins are counted everywhere — Log balance, Path overview, Goal
 * progress, PathCard badges, day-group headers — so no two surfaces can drift
 * apart on what a "win" totals. Wins stay derived (ADR 0013); only the reading
 * of them changed (ADR 0039).
 */
export function winKindCounts(wins: Win[]): WinKindCounts {
  let small = 0
  let big = 0
  for (const w of wins) {
    if (w.kind === 'goal') big += 1
    else small += 1
  }
  return { small, big }
}
