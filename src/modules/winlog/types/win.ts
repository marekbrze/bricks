/**
 * `Win` — a single entry in the log: a completed `Action` or an achieved
 * `Goal`. `winlog` owns no stored entity — every `Win` is computed live from
 * `Action.completedAt` / `Goal.achievedOn` (see `useWinLog`), so un-completing
 * an Action or reactivating a Goal removes its Win immediately. See
 * docs/GLOSSARY.md, docs/modules/winlog.md and ADR 0013.
 */
export type WinKind = 'action' | 'goal'

export interface Win {
  /** `action:<Action id>` or `goal:<Goal id>` — stable across re-renders, not a stored id. */
  id: string
  kind: WinKind
  name: string
  pathId: string
  /**
   * The Goal this Win counts toward. For an action Win: the Action's own
   * `goalId` (null when standalone). For a goal Win: that Goal's own id —
   * so a single `goalId` filter works for both kinds at once.
   */
  goalId: string | null
  /** Local calendar date (YYYY-MM-DD) this Win counts on the contribution graph. */
  date: string
  /** Full ISO timestamp/date used for sort order and as the Action link's day. */
  at: string
}
