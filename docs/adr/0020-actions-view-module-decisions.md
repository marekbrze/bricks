# [0020] - Actions view module decisions
**Date**: 2026-09-04
**Module**: actions
**Status**: Accepted

## Context
proto-feature planned a new Todoist-style `actions` module (docs/changes/actions-page.md).
proto-detail had to pin down the interaction decisions the plan left open: how a due date is
picked during quick-add, what happens to Actions under inactive Goals, and how Actions sort
inside a group.

## Decision
- **New module `actions`** — a derived surface (no new entities) consuming `useActions` /
  `useGoals` / `usePaths`; added to MODULES.md, GLOSSARY.md (`ActionsView`), ACTIONS.md and
  the nav table in UI-STRATEGY.md as the **5th nav entry** (`/actions`, order 2, next to Today).
- **Due dates reuse `Action.scheduledDate`** — one date concept app-wide; the quick-add
  popover (Today / Tomorrow / pick a date) shares the today module's date helpers and dialog
  logic. No separate due-date field.
- **Grouping**: Inbox group (conditional, on top, triage-locked) → one section per active
  Path in nav order → Goal groups in priority order with sub-Goals nested → standalone
  Actions after the Goal groups.
- **Sorting within a group**: **frog-first**, then Actions with `scheduledDate` ascending,
  then creation order. (Designer's explicit choice over scheduled-first — frogs must always
  lead the list.)
- **Inactive Goals (`achieved`/`abandoned`) with open Actions**: rendered collapsed and dimmed
  at the bottom of their section, header struck-through — open work never disappears, but
  doesn't shout either. Inactive Goals with no open Actions don't render.
- **Completed/abandoned Actions**: hidden by default; a "Show completed" toggle (view-local,
  not persisted in the prototype) renders them in place, struck-through.
- **Orphaned Actions** (missing Goal or Path): surfaced in a dimmed "Unassigned" fallback
  group under the Inbox — nothing silently vanishes while `useActions` self-heal runs.

## Impact
`docs/modules/actions.md` created (vision, flows, screens, actions, edge cases,
integrations). Shared docs updated: MODULES.md (7 modules, integration map, prototyping
order), ACTIONS.md (+4 planned view actions), UI-STRATEGY.md (5 nav entries), GLOSSARY.md
(+`ActionsView`, module row), ENTITY_MAP.md (derived-view note). proto-lofi builds
`/actions` + the nav slot next.
