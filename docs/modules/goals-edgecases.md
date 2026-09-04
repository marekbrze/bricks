# Goals — Edge Cases

Scope: whole module (`/paths/:pathId/goals`, `/paths/:pathId/goals/:goalId`),
plus the specific spots in `paths` and `capture-triage` that `goals` now
plugs into. Audited against `docs/modules/goals.md` and the built prototype
in `src/modules/goals/`.

## Coverage

- **Spec already captured** (from `goals.md` → Edge Cases): Path has no
  Goals yet; Goal with no Actions; overdue deadline; deleting a childless
  Goal; moving a Goal onto its current Path (no-op); deep sub-Goal nesting;
  frog toggled with zero current Actions; very long Goal name/description;
  a Path deleted while it still has Goals.
- **Already handled in code**:
  - Empty Goal tree → explanation + **Create your first Goal** — `src/modules/goals/components/GoalTreePage.tsx:100`
  - Overdue deadline gets a distinct destructive-tone badge instead of the neutral one — `src/modules/goals/components/GoalRow.tsx:14`
  - Deleting a childless Goal still confirms, with nothing to enumerate — `src/modules/goals/components/DeleteGoalDialog.tsx:37`
  - Moving a Goal onto its own Path is a silent no-op in the hook, and the dialog's Move button is disabled for it — `src/modules/goals/hooks/use-goals.ts:186`, `src/modules/goals/components/MoveGoalDialog.tsx:60`
  - Deep sub-Goal nesting works structurally; visual indent caps at depth 4 so a deep tree doesn't run off-screen — `src/modules/goals/components/GoalRow.tsx:11`
  - Frog toggle with zero current Actions just sets the flag; propagation is a no-op over an empty list, not an error — `src/modules/goals/hooks/use-goals.ts:208`
  - Path deleted elsewhere → Goals (and their Actions) under it are cascade-removed on the next mount that calls `useGoals()`, mirroring `useActions`' own Path self-heal — `src/modules/goals/hooks/use-goals.ts:43`
  - No way to create a cycle in the tree: the only path-change operation (Move to another Path) always lands top-level on a different Path — reparenting within the same Path isn't exposed at all, so nothing can become its own ancestor.
- **New gaps found**: 11
- **By severity**: 🔴 0 · 🟡 6 · 🟢 5

## Inventory

| # | Severity | Category | Edge case | Behavior today | Suggested behavior | Where |
|---|----------|----------|-----------|----------------|--------------------|-------|
| 1 | 🟡 | Cross-module | Goals under an **archived** Path stay fully editable | `paths` locks its own Achievements section read-only when `path.archived` (with a restore banner) — `GoalTreePage`/`GoalProgressPage` never check `path.archived` at all, so create/edit/reorder/move/achieve/abandon/delete all still work on an archived Path's Goals | Gate the same way `PathOverviewPage` does: a restore banner + disabled mutation affordances while `path.archived` is true | `src/modules/goals/components/GoalTreePage.tsx:27` (no archived check), `GoalProgressPage.tsx:38`; compare `src/modules/paths/components/PathOverviewPage.tsx:47` |
| 2 | 🟡 | Errors | Corrupt `actions` storage isn't checked on either Goals route | Both pages check `pathsUnreadable` and `goalsUnreadable`, but neither destructures `dataUnreadable` from `useActions()`. A corrupt `actions` value silently falls back to the hook's empty default, so every row/progress page just shows `0 Actions` instead of surfacing that data is unreadable — the exact shape of the already-fixed capture-triage gap #2 | Check `useActions().dataUnreadable` on both routes too, and render the appropriate recovery screen (or a shared one) | `src/modules/goals/components/GoalTreePage.tsx:27`, `GoalProgressPage.tsx:38` |
| 3 | 🟡 | State transitions / cross-module | Achieving or abandoning a Goal doesn't touch, or even flag, its own Actions | `setGoalState` only changes the Goal's own `state`/`achievedOn` — any Actions still `assigned` to it are left exactly as they were, with nothing on the Action itself or anywhere it might later render (e.g. a future `today` view) indicating its parent Goal is no longer active | Not a fix goals.md decided — needs a call: leave Actions untouched but visually flag them wherever they render, auto-abandon them, or warn before achieving/abandoning a Goal that still has open children | `src/modules/goals/hooks/use-goals.ts:219` (`setGoalState`) |
| 4 | 🟡 | Action outcomes | Move Goal to another Path has no Undo | Every other structural change in this module (Reorder) and in `paths` (Archive, Reorder) gets an Undo toast; `moveGoalToPath` returns `void`, not an `UndoFn`, so a mis-click permanently re-parents the whole subtree with no way back except manually moving it again | Make `moveGoalToPath` snapshot-and-return an `UndoFn` like `reorderGoal` does, and wire it into the toast in both call sites | `src/modules/goals/hooks/use-goals.ts:186`, `src/modules/goals/components/GoalTreePage.tsx:175`, `GoalProgressPage.tsx:257` |
| 5 | 🟡 | Data states | Long Goal name truncates with no way to see the rest | The tree/progress row link uses `truncate` (single-line ellipsis, no `title` attribute) — `goals.md`'s own Edge Cases section says long names should "wrap … same as Path/Action text elsewhere," but the row does the opposite of every other list in the app (`PathCard` clamps + wraps) | Either wrap (`line-clamp` + `break-words`, matching `PathCard`) or keep the truncate but add `title={goal.name}` so the full name is at least reachable | `src/modules/goals/components/GoalRow.tsx:103` |
| 6 | 🟡 | Action outcomes | No success feedback when a Goal or sub-Goal is created | Path creation navigates straight to the new Path's overview (implicit feedback); Goal creation just closes the dialog with no toast and no scroll/navigation to the new row — invisible if it lands off-screen in a long tree, or as a sub-Goal several levels deep | Toast "Created “X”" (matching every other mutation in this module), or scroll the new row into view | `src/modules/goals/components/GoalTreePage.tsx:146`, `GoalProgressPage.tsx:231` |
| 7 | 🟢 | Action outcomes | No toast after Edit Goal | Lower stakes than #6 — the edited row is already the one the Owner was just looking at, so the in-place update is its own feedback — but every other in-module mutation does toast | Add a short "Saved" toast for consistency, low priority | `src/modules/goals/components/GoalTreePage.tsx:165` |
| 8 | 🟢 | Navigation / DnD | Dragging a Goal over a different sibling group gives no "can't drop here" cue | `onDragOver` unconditionally calls `preventDefault()`, so the browser shows an "allowed" drop cursor even over a group the drop will silently no-op on (cross-level drags are intentionally not supported — see goals.md) | Only `preventDefault()` when the hovered target shares the dragged Goal's `pathId`/`parentGoalId`, so the cursor honestly reflects what will happen | `src/modules/goals/components/GoalRow.tsx:82` |
| 9 | 🟢 | Data states | No virtualization/pagination on a very large Goal tree | Consistent with the same deferred gap already accepted in `paths` (Path grid) and `capture-triage` (Inbox list) — fine at prototype scale | Not worth solving now; revisit if a real Goal tree grows large | `src/modules/goals/components/GoalTreePage.tsx:113` (the `<ul>`) |
| 10 | 🟢 | Forms | No double-submit guard on the Goal create/edit dialog | Same class as the already-deferred gap in `paths`/`capture-triage` — harmless while every mutation is synchronous; revisit with a Dexie migration | Note for later; disable the submit button while the mutation runs, once mutations are async | `src/modules/goals/components/GoalDialog.tsx:91` (`submit`) |
| 11 | 🟢 | State transitions | "Add sub-Goal" is offered on an achieved/abandoned parent with no nudge, and achieving/abandoning a Goal with open children has no soft warning | Both are allowed today with zero friction — arguably fine (Owner's call, matches the "manual, not automatic" achieve decision from ADR 0007), but neither was an explicit design decision | Low priority — call out in `proto-harden` and let the designer decide whether either deserves a confirm/nudge | `src/modules/goals/components/GoalOverflowMenu.tsx:85` (Add sub-Goal, always shown) |

### Categories checked with no new gaps

- **Boundary values** — no numeric inputs; a deadline in the past is allowed on create/edit by design (the mock data itself demonstrates an overdue Goal) — not a gap.
- **Invalid formats** — the deadline field is a native `<input type="date">`; the browser constrains it to valid dates.
- **Special characters / unicode / emoji** — plain-text display and storage throughout, same as every other module; verified no encoding-sensitive rendering.
- **Offline** — LocalStorage-only, no network calls in this module; works fully offline.
- **Storage write failure / quota** — already covered app-wide by the shared `StorageHealthBanner`, inherited for free via `useLocalStorageState`; no module-specific gap.
- **Invalid state transition reachable via UI** — `GoalOverflowMenu` only exposes Achieve/Abandon when `state === 'active'` and only Reactivate otherwise; an achieved↔abandoned jump isn't reachable without going through Reactivate first.
- **Referenced-item-deleted (Path → Goal, Goal → Action)** — both cascade correctly (see Coverage above).
- **Deep-linking + refresh** — both routes are `:id`-parameterized and survive a refresh; `GoalNotFound` also catches a Goal whose `pathId` doesn't match the URL's `:pathId` (e.g. a stale link after a Move), not just a missing id.
- **Permissions / roles** — single `Owner`, no auth; N/A, same as every other module.

## Priority list

1. **Archived-Path Goals stay mutable (#1)** and **corrupt-`actions` recovery gap (#2)** — the two that most closely mirror gaps `paths`/`capture-triage` already fixed elsewhere; leaving them open here is the most visible inconsistency.
2. **Achieve/abandon leaves child Actions dangling (#3)** — the one genuinely open cross-module design question (goals.md didn't decide it); worth resolving before `today` starts reading `goalId` off Actions.
3. **Move-to-Path has no Undo (#4)** — closes the one structural mutation in this module without the app's standard safety net.
4. **Long-name truncation contradicts the spec (#5)** and **silent create feedback (#6)** — smaller consistency fixes against `goals.md`'s own decisions and the rest of the app's toast conventions.
5. **Polish (#7–#11)** — edit toast, DnD cursor honesty, list scale, double-submit guard, soft nudges on achieve/abandon-with-children.

## Hand-off to proto-harden

Implement first:
- Decide and implement the archived-Path read-only gate for Goals (#1), matching `PathOverviewPage`'s pattern exactly.
- Add the `actions.dataUnreadable` check to both Goals routes (#2).
- Decide what achieving/abandoning a Goal does to its own Actions (#3) — even a "leave them, but flag it" answer closes the gap, as long as it's a decision rather than silence.
- Make `moveGoalToPath` return an `UndoFn` and wire the toast (#4).
- Fix the long-name truncation to match what `goals.md` already promised (#5), and add success feedback to Goal/sub-Goal creation (#6).
