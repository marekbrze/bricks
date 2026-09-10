# 0050 - Feature Essentials (per-Path necessary deeds) planned

**Date**: 2026-09-10
**Module**: essentials (new), paths, capture-triage
**Status**: Accepted

## Context
A feature request on the living system: every `Path` should carry a small set of
**Absolutely Necessary Deeds** — repeatable, non-negotiable actions (Arnold
Schwarzenegger's autobiography; a salesperson's "call clients" every day). The
Owner wants to define them per Path, log each time one is done (many per day),
attach a comment, and see how many they've completed in total for that Path.
Needed impact scoping before implementation.

## Decision
Planned in `docs/changes/essentials.md`. Name chosen: **Essentials** (entity
`Essential`; "ANDs" is the origin acronym, not the shipped name). Free tracking —
**no cadence targets** (deferred).

- **New module `essentials`**, nested under a Path like `vision` — own entity,
  `useEssentials` hook, `essentials` LocalStorage key, nested route
  `/paths/:pathId/essentials`, no top-level nav slot.
- **Essentials tab** (4th in `PathTabs`: Overview · Actions · Vision ·
  Essentials) — define / edit / reorder / delete Essentials and **Log** each
  completion via a dialog with an optional comment.
- Logging creates an already-`done` `Action` (`completedAt` = now,
  `scheduledDate` = null) named after the Essential, with a new optional
  `Action.note` and a soft `Action.essentialId` back-reference. It is a one-tap
  shortcut for creating a done Action.
- **Path overview** embeds an Essentials summary — `N essentials · M completed
  all-time · K today`.
- Per-Essential completion counts are **derived** by counting tagged Actions —
  no completion data stored on the `Essential`.
- Path delete cascades the Path's Essentials; the delete-confirm summary gains an
  Essentials count.

Riskiest integration point: the `Action` extension + `logEssentialCompletion` in
`capture-triage`. Essential completions are real `done` Actions, so they surface
in `WinLog` and `WinBalance`. Decision (recommended, for `proto-detail` to
ratify): **accept** — an Essential done is a small win; no `winlog` code change.

MVP scoped; 7 items deferred (cadence targets, Today-view strip, streaks,
comment editing, WinLog filter, cross-Path moves, Path-creation seeding).

## Impact
Routes to: proto-detail(essentials) → `capture-triage` residual edits →
proto-lofi(essentials) → `paths` / `app-shell` residual edits →
proto-edgecases(essentials) → proto-harden(essentials) →
proto-design(essentials) → proto-polish(essentials). 6 residual direct-edits
listed in the change doc. Re-run proto-feature if scope changes.
