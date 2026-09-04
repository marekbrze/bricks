# [0021] - Actions view edge-case baseline
**Date**: 2026-09-04
**Module**: actions
**Status**: Accepted
## Context
The Actions view prototype (flat grouped list, quick-add) handled its happy paths but had
not been stress-tested. Most lifecycle machinery already inherited hardened behavior from
`useActions` (schedule/complete/abandon, self-heal) and the storage layer
(corruption screens, write-failure banner), so the audit focused on the view layer.
## Decision
Audited into docs/modules/actions-edgecases.md. 8 gaps found: 🔴 0 · 🟡 3 · 🟢 5.
Top priorities: (1) quick-add lacks the spec's "Pick a date…" option; (2)+(3) the
"Unassigned" orphan fallback renders inert rows and ignores the Show-completed filter.
Zero high-severity findings — no data loss, no broken primary flow, no silent failures.
## Impact
proto-harden will implement the priority list. Re-run proto-edgecases after the prototype
changes to get a fresh baseline.
