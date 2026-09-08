# [0042] - Feature goal-view-action-list planned
**Date**: 2026-09-08
**Status**: Accepted
## Context
Follow-up to ADR 0041: the Goal view's Actions list should match the row
vocabulary of every other Action list (complete, schedule, rename, frog,
move, delete, Show completed) and support managing the order of a Goal's
Actions. No Action list in the app had manual ordering — aggregate views
sort automatically (frog-first → scheduled → creation); only Goals
themselves reorder manually. Needed impact scoping before implementation.
## Decision
Planned in docs/changes/goal-view-action-list.md. Affects modules
[capture-triage, actions, goals]. New module: no. Designer chose **manual
ordering within a Goal**: optional `Action.order` (no migration — missing
falls back to creation order), `reorderAction` with Undo, grip + drag and
Move up/down on the shared `ActionRowItem` behind an optional prop. Manual
order is read ONLY on the Goal page; aggregate views keep their automatic
sort (deferred). MVP scoped; 3 items deferred. Routes entirely to residual
direct edits — no new screens, states, or visual vocabulary.
## Impact
Direct edits apply the plan; ACTIONS.md, ENTITY_MAP.md, MODULES.md,
goals/actions specs, and goals-edgecases.md updated in the same pass.
Re-run proto-feature if scope changes.
