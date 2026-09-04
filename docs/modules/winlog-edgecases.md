# WinLog — Edge Cases

## Coverage

- **Spec already captured** (`docs/modules/winlog.md` → Edge Cases): no Wins
  at all yet; a Path has Wins but the filtered Path has none; un-completing /
  reactivating removes the Win immediately; the underlying Action/Goal is
  deleted; same-day multiple Wins; clicking an Action-Win links to the day it
  was *completed* on; very long Win history; Goal achieved + Action completed
  same day.
- **Already handled in code**:
  - No Wins at all → `LogPage.tsx:42-58` (dedicated empty state, no filter
    chips, matches the spec decision).
  - Filtered Path has no Wins → `LogPage.tsx:79-80` (scoped "No wins for this
    Path yet" message; graph still renders with all-empty cells since
    `winDaysForPath` naturally returns `{}`).
  - Un-completing / reactivating / deleting → `use-win-log.ts:31-55` (`wins`
    is a `useMemo` over live `actions`/`goals` state — nothing is stored, so
    the next render simply excludes it. No separate handling needed).
  - Action-Win's *displayed* date is always `completedAt`'s date (`win.date`,
    `use-win-log.ts:40`) regardless of current scheduling — only the link
    *target* needed reconciling with live scheduling, see #2 below.
  - Same-day multiple Wins / Goal+Action same day → the data model already
    supports it (two independent `Win` entries); `daysMap` (`use-win-log.ts:14-18`)
    sums them into one cell count.
- **New gaps found**: 8
- **By severity**: 🔴 1 · 🟡 4 · 🟢 3
- **Hardened (proto-harden, 2026-09-04)**: 8 closed, 0 deferred — see "Hardening status" below.

## Inventory

| # | Severity | Category | Edge case | Behavior today | Suggested behavior | Where |
|---|----------|----------|-----------|----------------|--------------------|-------|
| 1 | 🔴 | Cross-module & lifecycle | "Move to another day" on an already-`done` Action | `scheduleAction` unconditionally sets `state: 'assigned'` without checking the Action's current state, and never clears `completedAt`. The Action ends up `{ state: 'assigned', completedAt: <stale timestamp> }` — an inconsistent combination. `useWinLog`'s Win filter requires `state === 'done'`, so the Win **silently disappears from the log** with no toast, no warning, nothing un-completed by the Owner's own choice. The Today row for the new day also renders unchecked (`ActionRow.tsx:24` derives `done` from `action.state`), so it looks like the completion itself was undone. | `scheduleAction` should preserve `state: 'done'` when moving an already-completed Action (only flip an `abandoned`/`assigned` Action to `assigned`); a `done` row's "Move to another day" should change `scheduledDate` without touching `state`/`completedAt` at all. | `src/modules/capture-triage/hooks/use-actions.ts` (`scheduleAction`) — surfaces in `src/modules/winlog/hooks/use-win-log.ts:33` |
| 2 | 🟡 | Navigation & flow | Action-Win link vs. current scheduling | Even once #1 is fixed so the Win survives a move, `WinRow` still links to `/today/${win.date}` using the *original* `completedAt` date. If the Action was later moved to a different day, Today's day view for that original date no longer shows it (`scheduledActionsForDate` filters strictly by current `scheduledDate`) — the Owner clicks a Win and lands on a page where it's invisible. | Either link using the Action's *current* `scheduledDate` when it still exists (falling back to `completedAt`'s date otherwise), or show an inline note on the day view ("this Action has since moved to <date>") when the two diverge. | `src/modules/winlog/components/WinRow.tsx:13` |
| 3 | 🟡 | Navigation & flow | Path filter isn't in the URL | `pathId` is plain `useState`, not part of the route (`today` deliberately put day-position in `/today/:date` for the same reason — see `docs/modules/today.md` "Day position on refresh"). Refreshing `/winlog`, or sharing/bookmarking a filtered view, always resets to "All Paths". | Move the filter into a query param (`/winlog?path=<id>`) or a route segment, read on mount, written on change — mirrors the `today` precedent. | `src/modules/winlog/components/LogPage.tsx:32` |
| 4 | 🟡 | Cross-module & lifecycle | Archived Paths can't be isolated in the filter | Archived-Path Wins still count toward "All Paths" (global graph + history, since `useWinLog` never checks `path.archived`), but `PathFilterChips` is only fed `activePaths` — there's no way to scope the Log to just an archived Path's history. | Either include archived Paths in the chip list (labeled, e.g. "Home & calm (archived)") or explicitly note in a tooltip/empty state that archived-Path wins are counted only in the combined view. | `src/modules/winlog/components/LogPage.tsx:64`, `PathFilterChips.tsx` |
| 5 | 🟡 | Navigation & flow | Empty state doesn't handle "no Paths yet" | The global empty state ("Complete an Action in Today or mark a Goal achieved") assumes a Path already exists — neither action is reachable without one. `today.md` and `paths.md` both point their own empty states straight at Path creation for the same underlying case. | When `activePaths.length === 0`, swap the copy/CTA to point at creating a first Path (mirrors `today`'s "No Paths at all" state), instead of instructions the Owner can't act on yet. | `src/modules/winlog/components/LogPage.tsx:49-53` |
| 6 | 🟢 | Data states | Contribution intensity caps at 3 | `tone()` has four tiers (`0`, `1`, `2`, `3+`) — a 5-win day renders identically to a 3-win day. The module spec's own example ("a 5-Win day should read as visibly more saturated than a 1-Win day") implies more headroom than this. | Add one or two more tiers (e.g. `4`, `5+`) so unusually prolific days keep reading as more saturated, matching GitHub's own graph. | `src/modules/winlog/components/ContributionGraph.tsx:54-60` |
| 7 | 🟢 | Data states | Unbounded History list | The chronological list is a single flat `<ul>` with no pagination or virtualization. The spec deferred this "to size against real data" as a future concern, but the shipped mock data already produces ~150-250 historical Wins across three active Paths — the un-paginated case is already today's default experience, not a hypothetical later one. | Add a "load more" / infinite-scroll cutoff (e.g. 50 rows initially) once real usage volume is confirmed — worth prioritizing sooner than the spec implied. | `src/modules/winlog/components/LogPage.tsx:82-91` |
| 8 | 🟢 | Accessibility (WCAG 2.2 AAA) | ContributionGraph has no per-cell text alternative | Each day cell is a bare `<span>` with only a color tone — no per-cell `title`/label. The whole grid carries one aggregate `aria-label` ("N wins over the last N weeks"). On the dedicated Log page the History list happens to cover the same data in text form, but the two **embedded** graphs (Path overview, Goal progress) have no adjacent list — a screen-reader user there gets only the aggregate figure, never which day had how many wins. | Add a visually-hidden per-cell description (date + count) or a `<table>`-based accessible fallback; at minimum, a `title` attribute per cell for a hover tooltip. | `src/modules/winlog/components/ContributionGraph.tsx:64-79` |

**Forms & input**: no issues found — `winlog` has no create/edit forms (it owns no entity).

**State transitions**: no issues found — `winlog` owns no entity state; every transition it reads (`Action.state`, `Goal.state`) is validated by `capture-triage`/`today`/`goals`.

**Loading & async**: no issues found — all reads are synchronous `LocalStorage` via `useLocalStorageState`; no network, no skeleton needed.

**Errors**: no issues found beyond the three `DataUnreadable` guards already wired in `LogPage.tsx:38-40`, which mirror the app-wide recovery-screen pattern used by every other module.

**Prototype-specific (LocalStorage)**: no issues found — `winlog` performs no writes of its own (pure derived read), so storage-quota/write-failure and offline behavior don't apply to this module directly (they're already covered where the writes actually happen: `capture-triage`, `today`, `goals`).

## Priority list

1. **#1 — Move-to-another-day silently drops a completed Action's Win.** The
   highest-impact gap: a very ordinary, already-documented interaction
   (`today.md` explicitly says a `done` row can still be Moved) quietly
   erases motivational history with zero feedback — exactly the kind of
   silent loss `winlog` exists to prevent.
2. **#3 — Path filter isn't URL-addressable.** Cheap fix, meaningfully closes
   the gap with `today`'s own established pattern, and unblocks sharing/
   bookmarking a scoped view.
3. **#5 — Empty state ignores the no-Paths-yet case.** One-line copy/CTA fix
   that removes a dead end for a brand-new Owner.

## Hand-off to proto-harden

The top-priority gaps a harden pass should implement first:
- Fix `scheduleAction` to preserve `state: 'done'` on a completed Action
  being moved (#1) — this is a `capture-triage` fix that `winlog` depends on.
- Reconcile the Action-Win link target with current scheduling, once #1 no
  longer makes it moot for most cases (#2).
- Put the Path filter in the URL (#3) and extend the empty state for the
  no-Paths-yet case (#5).
- Everything else (#4, #6, #7, #8) is real but lower-impact — confirm with
  the designer whether to fold into this harden pass or defer.

## Hardening status (proto-harden, 2026-09-04)

| # | Status | What changed | Where |
|---|--------|--------------|-------|
| 1 | ✅ | `scheduleAction` now keeps `state: 'done'` when the Action being moved was already `done` — only a non-`done` Action still gets bumped to `assigned`. A moved-but-completed Action keeps its Win and its checked style on the new day | `src/modules/capture-triage/hooks/use-actions.ts` (`scheduleAction`) |
| 2 | ✅ | `Win` gained `currentScheduledDate` (the Action's live `scheduledDate`, null for goal Wins); `WinRow` links there when present, falling back to the completed-on date otherwise | `src/modules/winlog/types/win.ts`, `src/modules/winlog/hooks/use-win-log.ts:41`, `src/modules/winlog/components/WinRow.tsx:13` |
| 3 | ✅ | The Path filter moved from `useState` to a `?path=` query param via `useSearchParams`; an unknown/stale id falls back to "All Paths" instead of erroring (`isKnownPathId`) | `src/modules/winlog/components/LogPage.tsx` (`searchParams`/`setPathId`), `src/modules/winlog/hooks/use-win-log.ts` (`isKnownPathId`) |
| 4 | ✅ | `PathFilterChips` is now fed active **and** archived Paths (`[...activePaths, ...archivedPaths]`), with an "(archived)" suffix on the chip label | `src/modules/winlog/components/LogPage.tsx` (`filterablePaths`), `PathFilterChips.tsx` |
| 5 | ✅ | A dedicated "No Paths yet" state (distinct from "No wins yet") renders when there are zero Paths at all — active or archived — with a "Go to Paths" CTA | `src/modules/winlog/components/LogPage.tsx` |
| 6 | ✅ | `tone()` gained two more tiers — six total (`0`/`1`/`2`/`3`/`4`/`5+`) — so a 5-win day reads more saturated than a 3-win day | `src/modules/winlog/components/ContributionGraph.tsx` (`tone`) |
| 7 | ✅ | The History list now shows the first 50 Wins with a "Load more" button appending 50 more; resets on Path-filter change | `src/modules/winlog/components/LogPage.tsx` (`PAGE_SIZE`/`visibleCount`) |
| 8 | ✅ | Each non-future day cell gets a `title` (date + win count) as a per-cell text alternative, on top of the grid's existing aggregate `aria-label` | `src/modules/winlog/components/ContributionGraph.tsx` |
