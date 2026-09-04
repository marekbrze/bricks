# 0006 - Capture-triage prototype hardened

**Date**: 2026-09-04
**Module**: capture-triage
**Status**: Accepted

## Context

The `capture-triage` prototype handled happy paths but not edge cases (see
`docs/modules/capture-triage-edgecases.md`).

## Decision

Implemented 8 of the 11 audited gaps:
- `useActions` self-heals an `Action` orphaned by a Path deleted elsewhere,
  returning it to the Inbox with a toast (#1).
- `TriagePage` now handles a corrupt `actions` value the same way `InboxPage`
  does, instead of silently rendering a fake "Inbox zero" (#2).
- `PathPicker` became self-sufficient and gained an inline **New Path**
  fallback (reusing `paths`' `NewPathDialog`) so having no Paths yet never
  dead-ends triage or costs the Owner their session progress (#3).
- The Promote-to-Goal toast no longer implies a durable Goal exists (#4).
- Path/Goal picker chips dropped `role="radio"`/`radiogroup` for plain
  `aria-pressed` toggle buttons, matching their real (non-roving) keyboard
  behavior (#5).
- `PromoteToGoalDialog` gained the same dirty-form discard guard as
  `NewPathDialog` (#6); `QuickCaptureButton` was deliberately left as-is —
  single field, low friction, consistent with why `RenamePathDialog` also
  skips this guard.
- Picker chips wrap long Path/Goal names instead of forcing
  `whitespace-nowrap` (#8).

Deferred: a double-submit guard on Capture/Assign/Promote (#7 — harmless
while synchronous, revisit with a Dexie migration), session progress
resetting on a mid-triage refresh (#9 — acceptable for a lo-fi prototype),
and Inbox-list virtualization (#10 — not worth it at prototype scale). #11
(retiring `MOCK_GOAL_OPTIONS`) is blocked on the `goals` module existing, not
on this module's hardening.

## Impact

The prototype now handles every flow path in `capture-triage`, not just the
happy one. `docs/modules/capture-triage.md` and
`docs/modules/capture-triage-edgecases.md` updated to match. Visual polish is
a separate, later `proto-design` pass.
