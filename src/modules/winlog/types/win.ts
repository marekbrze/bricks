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
  /** Full ISO timestamp/date used for sort order. */
  at: string
  /**
   * True when this action Win was logged from an `Essential` (the Action
   * carries an `essentialId`) — the row labels it and shows `note`. Always
   * false for a goal Win. See docs/modules/essentials.md.
   */
  viaEssential: boolean
  /**
   * The free-text comment left when the Win was logged — only ever set on an
   * Essential-logged action Win (`LogEssentialDialog`'s optional note), which
   * records *what the completion was about*. Null otherwise.
   */
  note: string | null
  /**
   * For an action Win: the Action's *current* `scheduledDate`, if it still
   * has one — a completed Action can be moved to another day afterward
   * (docs/modules/today.md "Move to another day"), so this can differ from
   * `date` (which stays the day it was completed on). `WinRow` prefers this
   * for its link target so it doesn't land on a day the Action no longer
   * appears on. Always null for a goal Win. See docs/modules/winlog-edgecases.md #2.
   */
  currentScheduledDate: string | null
}
