# 0045 - Feature "smart due dates + overdue rollover" planned

**Date**: 2026-09-08
**Status**: Accepted

## Context
A feature request on the living system: setting an Action's day should be a
one-tap choice (Today / Tomorrow / this weekend / next week), matching Todoist /
Things / TickTick, and overdue Actions should be movable to today in bulk from
the Today view rather than one at a time. Needed impact scoping before build.

## Decision
Planned in `docs/changes/smart-due-dates-and-overdue-rollover.md`.

- **No new module.** Extends `today` (Overdue section + bulk "Move all to
  today") and `actions` (adopt the shared date UI); hook-only change in
  `capture-triage` (`useActions` gains `overdueActions` + `rescheduleOverdueToday`,
  no entity/field change); `goals` inherits with no edit.
- **New shared `SchedulePopover`** in `src/shared/components/` — quick rows
  (Today, Tomorrow, This weekend = coming Saturday, Next week = coming Monday,
  In a week = +7d, No date) plus an inline `react-day-picker` calendar. Replaces
  every ad-hoc date menu (`QuickAddActionRow`, `ScheduleActionDialog` callers,
  both row overflow menus).
- **New dependency**: `react-day-picker` (v9), designer-chosen over the native
  `input[type=date]`.
- **Overdue stays a derived bucket** — `scheduledDate < today` while `assigned`;
  `scheduledActionsForDate` keeps its exact-date match, overdue is never folded
  into "today". The Overdue section shows only when the viewed day is today.
- MVP scoped; recurring dates, time-of-day, NL entry, per-Path overdue, nav
  badge, snooze-all, silent auto-absorb, and midnight auto-rollover deferred.

Routes to `proto-detail (today)` → residual direct-edit (`react-day-picker` +
`date.ts` helpers) → `proto-lofi (today)` → `proto-edgecases` → `proto-harden`
→ `proto-design` + `proto-polish (today, actions)`. Two residual direct-edits.

## Impact
`proto-detail` / `lofi` / `edgecases` / `harden` / `design` / `polish` act on
the plan doc. The riskiest point is the shared `SchedulePopover` depending only
on `shared/lib/date` + `components/ui` (no module imports, to avoid a cycle) and
the `rescheduleOverdueToday` bulk write following the existing
`restoreSnapshot` Undo pattern. Re-run `proto-feature` if scope changes.
