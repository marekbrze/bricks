# 0024 - Triage: seamless one-screen assign + single-letter shortcuts

**Date**: 2026-09-05
**Module**: capture-triage
**Status**: Accepted

## Context

`capture-triage`'s card had four separate resolution controls (Assign,
Promote to Goal, Discard, Skip) and Assign itself needed a Path chip pick, a
Goal chip pick, then a separate **Assign** button press to confirm.
Promoting an Action into a new Goal opened a whole modal dialog (name, Path
picker again, a dirty-discard guard on Cancel/Escape/backdrop) layered on
top of the card. For a mode whose whole premise is a fast, repeatable
card-by-card loop (see the module vision), that's a lot of clicking and
context-switching for what's usually a two-second decision, and there was no
way to drive it from the keyboard beyond Tab.

## Decision

- **Path is one step, Goal is a search.** `AssignPicker` now has exactly two
  steps: pick a `Path` (unchanged chip list), then a live-filtered search
  over that Path's `Goal`s. There's no third "Assign" button — picking a row
  (an existing Goal, "Standalone (no Goal)", or a new "Create Goal '…'" row)
  resolves the card immediately, the same way Discard already did.
- **Promote to Goal moved into that same search**, as the "Create Goal '…'"
  row shown when the typed query doesn't exactly match an existing Goal.
  `PromoteToGoalDialog` is deleted — its only job (name + required Path) is
  now just typing into a field that's already scoped to the chosen Path.
  Disposal semantics (originating Action discarded, Undo restores it) are
  unchanged from ADR 0004; only the entry point moved.
- **Single-letter shortcuts** for the two remaining card-level actions:
  `D` (Discard), `S` (Skip). `A` refocuses the Goal search once a Path is
  picked. `1`-`9` jump straight to a Path by position (shown as small `Kbd`
  hints on the first nine chips — a new `shared/components/Kbd` primitive).
  All of these are ignored while a text field has focus, so they never steal
  a literal letter or digit out of a name being typed.
- The Goal search is a real keyboard combobox: `↑`/`↓` moves a highlighted
  row, `Enter` commits it, `Escape` clears the query (or backs out of the
  Path pick if the query's already empty), `Backspace` on an empty query
  also backs out — so the whole flow (Path → Goal → resolved) can run
  without touching the mouse.

## Impact

- `AssignPicker` absorbs what `AssignPicker` + `PromoteToGoalDialog`
  used to split across two components; `TriageCard` drops its local
  `selection`/`promoting` state entirely — `AssignPicker` calls
  `onAssignExisting` / `onCreateGoal` directly, and `TriagePage`'s existing
  `handleAssign`/`handlePromote` (Undo toasts included) are unchanged.
- `PathPicker` gained an opt-in `shortcuts` prop (number-key pick + `Kbd`
  badges) used only from triage — `MoveGoalDialog`'s use of the same
  component is untouched.
- The dirty-form-discard guard from ADR 0006 (#6) is retired along with the
  dialog it protected — there's no multi-field form left to lose; typing an
  unsent Goal name and navigating away just loses that one field, same as
  any other abandoned search box.
- `docs/modules/capture-triage.md` updated: flows, screens, the Actions
  table, and the edge cases it changes (no-Paths fallback, the now-
  structurally-impossible "Promote without a Path", picker keyboard
  semantics, plus a new keyboard-shortcuts table).
- Visual polish (a11y contrast pass, motion, the on-brand look) stays a
  later `proto-design`/`proto-polish` concern — this is an interaction
  redesign of an already-hardened prototype module.
