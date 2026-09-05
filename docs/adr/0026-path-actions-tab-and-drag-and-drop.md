# [0026] - Path Actions tab, and dragging Actions between Goals
**Date**: 2026-09-05
**Module**: paths, actions, capture-triage
**Status**: Accepted

## Context
Two gaps, one shape. A Path's page was a hub of links: its Goals lived one click away in the
Goal tree, its Actions two clicks away and only ever as the whole-app list, and the overview
itself carried a lone "Actions without a goal" section that duplicated a slice of that list.
So "what am I actually working on inside this Path" had no single screen.

And nothing could re-file an Action. Assignment happened once, in triage; after that the only
way to correct it was to delete the Action and retype it under the right Goal — losing its
`createdAt`, its schedule, and its completion history.

## Decision

**A Path is a set of tabs, not a page with links.** `PathTabs` — Overview · Actions · Goals ·
Vision — renders on all four screens (the tab bar lives in `paths`, the Goals and Vision
screens import it). They stay separate routes with plain `NavLink`s rather than an ARIA
tablist, so browser back/forward and "open in a new tab" keep working; `aria-current` carries
which tab is showing.

**The new Actions tab (`/paths/:pathId/actions`) is the Actions view scoped to one Path.**
Not a lookalike: `PathActionsBody`, `useGoalGroups` and `useActionRowActions` are shared by
both screens, so the grouping rules, the row menu, the dialogs and the collapse memory
(`actions-group-visibility`, now shared across both) cannot drift. The overview keeps its
summary role — the standalone-Actions section moved into the tab, and the Goals stub became
one "Goals and Actions" pointer to it.

**Actions drag between Goals, and across Paths.** A row is a drag source; a Goal group and a
Path's Standalone block are drop targets. Native HTML5 drag-and-drop, matching what the Goal
tree and the Vision board already do — no new dependency. Nesting is handled by stopping
propagation, so a drop on a sub-Goal never also lands on its parent.

- **`moveActionToGoal` is a new mutation, not `assignAction`.** Triage's `assignAction`
  forces `state: 'assigned'` — right for leaving the Inbox, wrong for a move, which would
  silently un-complete a `done` row. The move preserves `state`, `scheduledDate` and
  `completedAt`: which Goal owns an Action is independent of whether it's done or which day
  it sits on.
- **A no-op returns null**, so dropping a row back where it started stays silent. The toast
  is also the screen-reader announcement, so it has to describe a real change.
- **Every move is undoable** from its toast, whole-list snapshot, like every other mutation
  in `useActions`.
- **The keyboard path is the row menu's "Move to…"**, a searchable list of every active Path
  and its Goals, with the current home shown disabled. This is the same rule the Goal tree
  follows (drag to reorder, menu to Move up/down): the pointer affordance is never the only
  way to perform the operation.
- **An archived Path renders no drag provider at all** — read-only means no grips and no drop
  targets, not a drag that silently fails.

## Impact
Re-filing an Action is now a first-class, reversible operation instead of a delete-and-retype.
The Path gains a real work surface, and the Actions view gained nothing it has to maintain
separately — the two screens are the same components with a different scope. `Action` itself
is unchanged; no new storage key.

Follow-ups deliberately not taken: dragging to *reorder* within a group (the sort is derived —
frog, date, creation — so there is nothing to persist yet), dragging Inbox items straight onto
a Goal (triage owns that decision, card by card, per ADR 0004), and touch drag on mobile,
where "Move to…" is the practical path.
