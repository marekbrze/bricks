# Goals

## Vision

`goals` is the execution layer under a `Path` — where a direction ("the sport
path") turns into concrete, workable commitments. A `Goal` is not the Vision
(no hard actions required) and not an `Achievement` (order-independent, no
work layer) — it is the thing that actually needs tasks done against it, in a
manual priority order the Owner controls, optionally racing a deadline.

Goals form a tree (sub-Goals nest under a parent Goal) but the tree is
shallow and pragmatic, not a project-management hierarchy — it exists so a
big Goal ("run a marathon") can be broken into a couple of concrete
sub-Goals ("build a 10k base", "survive a 20k long run") without inventing a
whole new entity. Priority order is manual, not automatic — the Owner
decides what's next, not a due-date sort.

This is the bridge module: Actions land here from `capture-triage`
(assigned or promoted), get worked in `today`, and completing/achieving them
feeds `winlog`. `goals` itself owns the tree, the ordering, the frog flag,
and the achieve/abandon lifecycle — it does not own Action scheduling or
completion (that's `today`) or the win history (that's `winlog`), only the
per-Goal progress rollup.

## User Flows

### View the Goal tree for a Path

1. Owner arrives at `/paths/:pathId/goals`, usually via **Open Goals** from
   the Path overview.
2. Sees a flat-looking list where sub-Goals render indented under their
   parent, each row in manual priority order within its level: name, frog
   flag (if set), deadline badge with days-remaining countdown (if set),
   lifecycle badge (only shown for `achieved`/`abandoned` — `active` is the
   unmarked default), and an Action count.
3. Clicking a row's name opens **Goal progress** for that Goal
   (`/paths/:pathId/goals/:goalId`); an overflow menu per row holds Edit /
   Add sub-Goal / Move / Achieve / Abandon / Delete.
4. A **New Goal** primary action at the top adds a top-level Goal under this
   Path.

### Create a Goal / sub-Goal

1. **New Goal** (top-level) or a row's **Add sub-Goal** opens the same
   dialog: name (required), description (optional, short), deadline
   (optional date picker).
2. Save → the Goal appears at the **end** of its priority level (top-level
   list, or under its parent), state `active`, no frog.
3. A sub-Goal always belongs to exactly one parent Goal, which itself
   belongs to the same Path — there's no separate "pick a Path" step for a
   sub-Goal, it inherits the parent's Path.

### Edit a Goal

1. Row overflow → **Edit** → the same dialog, prefilled, saves in place —
   name, description, deadline can all change. Removing a deadline clears
   the countdown.

### Reorder Goals (manual priority)

1. Each row has a drag handle; dragging reorders within its own level
   (top-level Goals reorder among top-level Goals; a sub-Goal reorders among
   its siblings under the same parent) — Goals don't jump levels by
   dragging, only via **Move**.
2. Keyboard-accessible move-up/move-down fallback in the overflow menu
   (WCAG 2.2 AAA).

### Move a Goal to another Path

1. Row overflow → **Move to Path** → a Path picker (same picker pattern as
   `capture-triage`'s Assign step).
2. Confirming re-parents the Goal to the **top level** of the destination
   Path (moving across Paths always lands top-level — a sub-Goal can't carry
   its old parent across, since the parent lives on the origin Path).
3. The Goal's entire subtree (sub-Goals) and all Actions under it move as a
   unit — nothing is left behind or orphaned by a move.

### Toggle frog

1. Row overflow (or an inline star icon) → toggle **frog** on a Goal.
2. Marking a Goal a frog immediately flags all of its current Actions as
   frogs too (one-time propagation at the moment of toggling, not a live
   constraint — an Action added to the Goal afterward is not auto-flagged).
3. Un-marking the Goal's frog does **not** un-flag its Actions — the
   propagation is one-directional, matching how a real "this whole thing is
   the frog" call plays out (see Edge Cases).

### Mark achieved / abandon / reactivate

1. Row overflow → **Mark achieved** → state `achieved`, stamped with today's
   local date; feeds `WinLog` / `ContributionGraph`. This is always a manual
   call — never automatic when all child Actions are done (PROJECT.md Open
   Question, resolved: manual, matching how `Achievement` already works in
   `paths`).
2. Row overflow → **Abandon** → state `abandoned`, an alternative outcome to
   achieving, not a failure state that blocks anything.
3. Either state → **Reactivate** → back to `active`. Reversible, matching
   the reversibility already established for `Achievement` un-marking —
   mistakes and re-opened goals happen.

### Delete a Goal (cascade)

1. Row overflow → **Delete** → an `AlertDialog` with a cascade summary,
   matching the `Path` delete pattern exactly:
   > Delete "Build a 10k base"? This permanently deletes: 2 sub-Goals, 7
   > Actions. This cannot be undone.
   > [Cancel] [Delete Goal]
2. Confirm → the Goal, its entire sub-Goal subtree, and every Action under
   any of them are removed. No undo — this mirrors Path delete, not the
   lightweight Achievement-delete or the Undo-backed Inbox discard, because
   a Goal can carry real work under it.
3. Deleting a Goal that has zero children skips the enumerated summary line
   (nothing to list) but still confirms, for consistency.

### View Goal progress

1. `/paths/:pathId/goals/:goalId` — header (name, deadline countdown if
   any, frog/lifecycle badges), a cumulative Action count toward this Goal,
   the per-Goal `ContributionGraph` (owned by `winlog`, embedded here), and
   the list of this Goal's own Actions plus its sub-Goals (each linking
   further in).
2. From here the Owner can jump into `today` for any schedulable Action, or
   drill into a sub-Goal's own progress view.

## Screens (rough)

- **Goal tree** (`/paths/:pathId/goals`): **New Goal** primary action;
  indented tree list (name, frog flag, deadline countdown badge, lifecycle
  badge for achieved/abandoned, Action count, drag handle, overflow menu:
  Edit / Add sub-Goal / Move to Path / toggle Frog / Achieve / Abandon /
  Reactivate / Delete). Empty state when the Path has no Goals yet.
- **New/Edit Goal dialog**: name (required) + description + deadline date
  picker, Cancel / Save. A dirty form confirms before discarding, same
  pattern as `NewPathDialog`.
- **Move to Path dialog**: Path picker (reuses the `capture-triage` picker
  pattern), warns that the whole subtree + its Actions move together.
- **Goal progress** (`/paths/:pathId/goals/:goalId`): header with
  badges/countdown, Action count, embedded `ContributionGraph`, this Goal's
  own Actions, its sub-Goals (linking further in).
- **Delete confirmation** (`AlertDialog`): cascade summary (sub-Goal +
  Action counts), Cancel / Delete Goal — same component as Path delete.
- **Data-unreadable recovery** (all `goals` routes): shown instead of
  content when the stored `goals` **or** `actions` value is corrupt —
  matches the `paths` pattern (distinct from the empty-tree state), offers
  a confirmed reset.
- **Archived-Path read-only** (both `goals` routes): a restore banner plus
  every mutation control (create/edit/reorder/move/frog/achieve/abandon/
  delete) hidden while the owning Path is archived — matches
  `PathOverviewPage`'s Achievements section exactly.

## Actions

| Action | Description in this module | Entity | Notes |
|--------|------------|--------|-------|
| Create Goal | Name + description + optional deadline, top-level under a Path | `Goal` | Appends to end of top-level priority order |
| Create sub-Goal | Same dialog, from a row's Add sub-Goal | `Goal` | Inherits the parent's Path; appends to end of sibling order |
| Edit Goal | Name, description, deadline | `Goal` | Clearing the deadline clears the countdown |
| Reorder Goals | Drag handle + keyboard move-up/down, within one priority level | `Goal` | Sub-Goals reorder among siblings only; crossing levels needs Move |
| Move Goal to another Path | Path picker; whole subtree + Actions move together | `Goal` | Always lands top-level on the destination Path |
| Toggle frog | Row control; propagates once to current child Actions | `Goal` | One-time propagation, not live; un-marking doesn't retract it |
| Mark achieved | Overflow → `achieved` + local date | `Goal` | Manual only — resolves PROJECT.md Open Question |
| Abandon Goal | Overflow → `abandoned` | `Goal` | Alternative outcome, not a failure/blocking state |
| Reactivate Goal | Overflow → back to `active` | `Goal` | Reversible from either achieved or abandoned |
| Delete Goal | Overflow → `AlertDialog` cascade summary | `Goal` | Cascades to sub-Goals and all their Actions — resolves PROJECT.md Open Question; no undo |
| View Goal progress | Action count + `ContributionGraph` + own Actions/sub-Goals | `Goal` | Graph rendered by `winlog` |

`docs/ACTIONS.md` already listed every one of these; this interview resolved
the two behaviors it flagged as open (manual achieve, cascade delete) rather
than adding anything new — no new entities or glossary terms.

## Edge Cases

Systematically audited in `docs/modules/goals-edgecases.md` and hardened
(proto-harden, 2026-09-04). Decided behaviors:

- **Path has no Goals yet**: tree screen shows an empty state explaining
  Goals live under Paths, with **New Goal** front and center.
- **Goal with no Actions**: progress view shows `0` cumulative count and an
  empty `ContributionGraph`, not an error.
- **Goal with an overdue deadline**: the countdown badge flips to an overdue
  treatment (still shows, doesn't block achieving/abandoning/editing it
  away).
- **Deleting a childless Goal**: confirmation dialog still appears (for
  consistency with every other Goal delete) but the cascade summary has
  nothing to enumerate.
- **Moving a Goal onto the Path it's already on**: a no-op, not an error;
  the dialog's Move button is disabled for it.
- **Move Goal to another Path**: now Undo-backed like every other
  structural change in this module — the toast reverts both the Goal
  subtree's `pathId` and the Actions that moved with it.
- **Deep sub-Goal nesting**: allowed structurally (a sub-Goal can itself
  have sub-Goals) — indentation is capped visually so deep trees don't run
  off-screen; further nesting still works, just renders at the max indent.
- **Frog toggled with zero current Actions**: the toggle still sets the
  flag on the Goal itself; there's simply nothing to propagate to yet.
- **Very long Goal name/description**: clamps to 2 lines with `break-words`
  in the tree row, matching `PathCard`'s treatment; wraps freely in the
  progress header and the dialog.
- **A Path is deleted while it still has Goals**: cascades from `goals`'
  own self-heal (mirrors `useActions`' Path self-heal) — Goals and their
  Actions under a vanished Path are removed on the next mount that reads
  them, not orphaned.
- **A Path is archived while it has Goals**: both `goals` routes go
  read-only — restore banner, every mutation control hidden — until the
  Path is unarchived, matching `paths`' own Achievements section.
- **Achieving/abandoning a Goal that still has Actions assigned to it**: the
  Actions are left untouched — no per-Action flag exists yet since Actions
  don't render anywhere outside this Goal's own page (the Goal's state
  badge, already visible wherever the Goal appears, is the signal for now).
  Revisit once `today` reads `goalId` off Actions.
- **Corrupt `goals` or `actions` storage on a Goals route**: a dedicated
  recovery screen distinct from the empty-tree state, matching `paths`.

Deferred (see `goals-edgecases.md` → Hardening status): no virtualization
on a very large Goal tree, no double-submit guard on Create/Edit (harmless
while creation is synchronous), and no confirm/nudge on Add-sub-Goal-under-
a-closed-parent or achieving/abandoning a Goal with open children (left
frictionless, matching the "manual, not automatic" philosophy behind
achieve/abandon).

## Integration Points

- **paths**: every Goal belongs to exactly one Path; the Path overview lists
  Goals in priority order with deadline countdowns and links to
  `/paths/:pathId/goals`. Deleting the Path cascades its Goals.
- **capture-triage**: an Inbox Action is assigned into an existing Goal, or
  promotes into a brand-new top-level Goal (the originating Action is
  discarded, per `capture-triage`'s ADR 0004).
- **today**: a Goal's Actions with a `scheduledDate` show up in the Today
  view, grouped under their Path.
- **winlog**: achieving a Goal creates a Win; the per-Goal `ContributionGraph`
  on the progress view is embedded from here.
