# 0048 - Today: Overdue + SchedulePopover edge-case baseline

**Date**: 2026-09-10
**Module**: today
**Status**: Accepted

## Context
The `today` module was stress-tested once before (ADR 0044-era pass, gaps #1–11
in `docs/modules/today-edgecases.md`, hardened 2026-09-04). The
`smart-due-dates-and-overdue-rollover` feature (ADR 0045) then added a new
surface — the **Overdue** bucket on `/today`, the shared
`SchedulePopover` / `SchedulePopoverPanel`, the `ScheduleActionDialog` refactor
to a thin shell around that panel, and the `overdueActions` /
`rescheduleOverdueToday` selectors in `capture-triage`'s `use-actions.ts` — that
had not been systematically stress-tested for edge cases.

## Decision
Audited into `docs/modules/today-edgecases.md` → "Second pass (2026-09-10)".
11 new gaps found: 🔴 0 · 🟡 3 · 🟢 8.

Top priorities:
- **#12** "No date" quick row in the move/reschedule `ScheduleActionDialog` is a
  dead control — shown whenever `initialDate` is set, but the move callers don't
  wire `onClear`, so clicking it just closes the dialog.
- **#13** `dayActions` and `overdueActions` never filter to active Paths — an
  archived-Path Action leaks into the Overdue section (and "Move all to today")
  or vanishes silently from the day view while suppressing its empty state.
- **#14** When there's overdue work but nothing dated exactly today, the Overdue
  section and the full "Nothing scheduled today" empty CTA render together —
  contradictory messaging.
- **#15 / #16** Day-view rows aren't frog-first (unlike the Overdue bucket and
  the `goals`/`paths` lists); the Overdue row has no Abandon.

## Impact
proto-harden implements the priority list. Re-run proto-edgecases after the
prototype changes to get a fresh baseline.
