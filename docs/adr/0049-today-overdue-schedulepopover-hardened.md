# 0049 - Today: Overdue + SchedulePopover surface hardened

**Date**: 2026-09-10
**Module**: today
**Status**: Accepted

## Context
The second-pass edge-case audit (ADR 0048,
`docs/modules/today-edgecases.md` → "Second pass (2026-09-10)") found 11 gaps
in the surface `smart-due-dates-and-overdue-rollover` (ADR 0045) added — the
Overdue bucket, `SchedulePopover`, and the `ScheduleActionDialog` refactor.

## Decision
Implemented 8, deferred 3.

**Closed:**
- **#12** `ScheduleActionDialog`'s "No date" row now unschedules (with Undo)
  instead of silently closing — `onClear` wired by both move-dialog callers.
- **#13** `TodayPage` filters `dayActions` and the Overdue list to active-Path
  ids; archived-Path Actions are quietly excluded (self-heal keeps their
  `pathId` because archiving isn't deleting).
- **#14** When the day has overdue work but nothing scheduled exactly today,
  one quiet line replaces the full-height "nothing scheduled" empty state.
- **#16** Direct **Abandon** button on each Overdue row.
- **#18** Malformed `/today/:date` is canonicalised to `/today`.
- **#20** Day-view heading is `whitespace-nowrap` so out-of-year labels don't
  reflow the nav.
- **#21** New `completeOverdueAction` — completing an overdue row also pulls it
  onto today so it shows as a visible win instead of vanishing.
- **#22** Picking the day an Action is already on is a silent no-op.

**Deferred (with reasons):**
- **#15** Frog-first sort in the plain day view — a visual-hierarchy change,
  belongs in `proto-design` / `proto-polish`, not harden.
- **#17** Overdue in the agenda view — pairs with the already-deferred
  "overdue badge on the Today nav item" (ADR 0045 *Later*); revisit together.
- **#19** Day-nav `replace` vs push — intentional "day view, not a calendar";
  position still survives a refresh via the URL.

No new action, state, or entity — `completeOverdueAction` is a variant of the
existing "Complete Action", not a new one; `ACTIONS.md` / `ENTITY_MAP.md`
unchanged.

## Impact
The Overdue / `SchedulePopover` surface now handles its broken paths as
deliberately as its happy path. New Storybook stories cover each state
(`OverdueSection.AbandonARow`, `TodayPage.OverdueButNothingToday`,
`TodayPage.ArchivedPathActionsExcluded`, `Today/Dialogs.MoveToAnotherDayWithClear`).
Visual polish of the Overdue section, popover, and calendar remains a separate
future `proto-design` pass. Re-run `proto-edgecases` for a fresh baseline.
