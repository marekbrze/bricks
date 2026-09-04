# [0022] - Actions view prototype hardened
**Date**: 2026-09-04
**Module**: actions
**Status**: Accepted
## Context
The Actions view prototype handled happy paths but not the 8 edge cases diagnosed in
docs/modules/actions-edgecases.md (🔴 0 · 🟡 3 · 🟢 5).
## Decision
Implemented all 8 gaps, none deferred: "Pick a date…" free-date dialog in quick-add;
"Unassigned" orphan fallback as full actionable rows obeying the Show-completed filter;
due-date chip suppressed on abandoned rows; Undo on the Schedule toast (symmetric with
Unschedule); `aria-live` on the standalone "All clear" line; per-Goal collapse overrides
persisted in LocalStorage (`actions-group-visibility` — a new storage key, no entity
changes); `flex-wrap` quick-add row for narrow widths. New Storybook story
`OrphanedActions` covers the fallback group (95 story smoke tests pass).
## Impact
The prototype now handles every flow path, not just the happy one. Visual polish is a
separate future proto-design pass (once docs/DESIGN.md exists).
