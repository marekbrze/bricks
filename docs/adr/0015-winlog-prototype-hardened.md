# 0015 - WinLog prototype hardened

**Date**: 2026-09-04
**Module**: winlog
**Status**: Accepted

## Context

The `winlog` prototype handled its happy path but not the 8 gaps found in
`docs/modules/winlog-edgecases.md`.

## Decision

Implemented all 8 edge-case states — 0 deferred:

1. Fixed the root cause of the highest-severity gap in `capture-triage`:
   `scheduleAction` no longer resets a `done` Action to `assigned` when it's
   moved to another day, so "Move to another day" can no longer silently
   drop a completed Action's Win or un-check its Today row.
2. `Win` gained `currentScheduledDate`; `WinRow` links there when present,
   so a Win never points at a day the Action has since moved away from.
3. The Path filter moved from component state to a `?path=` query param
   (`useSearchParams`), surviving a refresh/deep-link, with an unknown/stale
   id falling back to "All Paths".
4. `PathFilterChips` now includes archived Paths (labeled), matching that
   their Wins already counted toward "All Paths".
5. A dedicated "No Paths yet" empty state (pointing at Path creation)
   precedes the "No wins yet" state when there are no Paths at all.
6. `ContributionGraph`'s tone scale grew from four tiers to six, so a 5-win
   day reads more saturated than a 3-win day.
7. The History list now paginates at 50 rows with "Load more", since the
   shipped mock data already produces ~150-250 Wins.
8. Each `ContributionGraph` day cell gained a `title` (date + count) as a
   per-cell text alternative, for the two embedded graphs that have no
   adjacent text list.

## Impact

- `src/modules/capture-triage/hooks/use-actions.ts` — `scheduleAction` fix.
- `src/modules/winlog/` — `types/win.ts`, `hooks/use-win-log.ts`,
  `components/{LogPage,WinRow,PathFilterChips,ContributionGraph}.tsx`, plus
  new/updated Storybook stories for every state above.
- `docs/modules/winlog-edgecases.md` — all 8 rows marked ✅ with file:line.
- `docs/modules/winlog.md` — Edge Cases and Screens synced to the hardened
  behavior; the `/log` route typo from the original `proto-detail` pass
  corrected to the real `/winlog` route throughout.
- The prototype now handles every flow path on this module, not just the
  happy one. Visual polish is a separate future `proto-design` pass.
