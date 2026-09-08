# Bug: Goal progress view hides the quick-add row when the Goal has no Actions

## Type
Bug (spec-vs-code drift)

## Severity
🟠 medium — a Goal with zero Actions (every freshly created Goal, and every
leaf sub-Goal) offers no way to add its first Action from its own page. The
empty-state copy says "add the first one below", but there is no "below" —
the input only mounts once at least one Action exists. The user has to go to
the Inbox and triage one in instead.

## Reproduction
1. Create a Goal (or open any leaf Goal with no Actions).
2. Open its progress page (`/paths/:pathId/goals/:goalId`).
3. Actions section reads "No Actions yet — add the first one below, or triage
   one in from the Inbox." — but no quick-add row is rendered.

**Expected**: the quick-add row sits under the empty-state message as the
primary way to add the first Action (per `docs/modules/goals.md` → Edge Cases
→ "Goal with no Actions").
**Actual**: no input; the only path in is the Inbox.

## Root cause
**Class**: spec-vs-code drift.

`GoalProgressPage.tsx` branched on `ownActions.length === 0` **first** and
rendered only the `<p>` empty message for that case. The `<QuickAddActionRow>`
lived inside the `else` (`!readOnly`) branch, which was only reachable when
`ownActions.length > 0`. So the row — and the "Show completed" control, which
has nothing to toggle when empty and is correctly still hidden — never
appeared for an empty Goal.

## Fix
`src/modules/goals/components/GoalProgressPage.tsx` — restructured the Actions
section so `!readOnly` is the outer branch and `<QuickAddActionRow>` is
always mounted at its end. Inside it, the body is: empty message when there
are no Actions, "All clear" when all are settled, otherwise the row list. The
read-only branch keeps its own empty line ("No Actions.") for an archived
Path's Goal.

**Spec impact**: none — restores the documented intent.

## Regression scope
- Read-only (archived Path) Goal: no quick-add row, now shows a dashed "No
  Actions." card instead of the shared "add the first one below" copy that
  implied an input that was never there. Story: `ArchivedPathReadOnly`.
- "Show completed" checkbox: still gated on `!readOnly && ownActions.length > 0`
  — unchanged.
- Non-empty Goal: list + quick-add render exactly as before.
- New story `EmptyLeaf` (`goal-pullup-assisted` — a leaf with no Actions and
  no sub-Goals) covers the fixed empty state.

## Hand-off
**Fixed and verified in this pass.** `lint` clean, `tsc` clean, story test
suite + `build` pass.
