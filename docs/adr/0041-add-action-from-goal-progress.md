# [0041] - Feature add-action-from-goal-view planned
**Date**: 2026-09-08
**Status**: Accepted
## Context
A feature request: the Owner wants to add Actions to a Goal from the Goal's
own page (Goal progress). Today that page lists Actions read-only and its
empty state defers to Inbox triage — every add path required navigating to
the Actions view or triage first. Needed impact scoping before implementation.
## Decision
Planned in docs/changes/add-action-from-goal-view.md. Affects modules
[goals] (screen + docs); reuses `actions`' `QuickAddActionRow` and
`capture-triage`'s `useActions().createAction` unchanged. New module: no.
MVP scoped; interactive rows, tree-page add entry, and sub-Goal-row quick-add
deferred. Routes entirely to residual direct edits — no new screens, states,
or visual vocabulary, so the detail → lofi → edgecases → harden → design
loop is not warranted.
## Impact
Direct edits apply the plan; the goals module spec (docs/modules/goals.md),
ACTIONS.md, MODULES.md, and goals-edgecases.md are updated in the same pass.
Re-run proto-feature if scope changes.
