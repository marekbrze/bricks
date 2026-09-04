# [0019] - Feature Actions Page planned
**Date**: 2026-09-04
**Status**: Accepted
## Context
A feature request for a Todoist/Things-style flat Actions list grouped by Path → Goal,
with quick-add of Actions and Goals and due dates, on the living system. Needed impact
scoping before implementation: no existing module is a whole-app task list (`goals` owns
the tree, `today` owns the day), and the nav had exactly 4 top-level entries.
## Decision
Planned in docs/changes/actions-page.md. New module `actions` (derived list view, no new
entities). Due dates reuse `Action.scheduledDate` — one date concept across the app.
Grouping: Inbox group on top, then Path → Goal (sub-Goals nested) → Actions, standalone
Actions after Goal groups. Completed/abandoned hidden behind a "Show completed" toggle.
Adds a 5th nav entry. MVP scoped; reordering, search/smart lists, outliner editing and
bulk actions deferred. Routes to detail → lofi → edgecases → harden (+ design/polish later);
4 residual direct-edits folded into lofi (nav slot, routes, UI-STRATEGY.md, scenario data).
## Impact
proto-detail/lofi/harden act on the plan. Re-run proto-feature if scope changes.
