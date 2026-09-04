# 0003 - Paths prototype hardened

**Date**: 2026-09-04
**Module**: paths
**Status**: Accepted

## Context

The `paths` prototype handled the happy paths but not the edge cases inventoried
in `docs/modules/paths-edgecases.md` (18 gaps, 🔴 3 · 🟡 9 · 🟢 6).

## Decision

Implemented 12 edge-case states and revised one behavior:

- **Persistence failures** — `useLocalStorage` now reports write failures and
  corrupt values to a shared `storage-health` store. A `StorageHealthBanner` in
  `AppShell` covers write failures / blocked storage on every screen; a dedicated
  `PathsDataUnreadable` recovery screen (distinct from the empty state) covers a
  corrupt stored value on all Paths routes.
- **Archive** — changed from the spec's "light confirm" to **immediate + an Undo
  toast** that restores the Path's exact prior state. Delete keeps its
  `AlertDialog` (now a real alert dialog, no outside-click dismiss) and gets a
  confirmation toast; no undo (permanent).
- **Feedback** — Undo toast for archive & reorder; confirmation toast for delete
  & unarchive. New lightweight `ToastProvider` / `Toaster` in `src/shared`.
- **Archived Path overview** — now read-only (restore banner + disabled
  Achievements section) until unarchived.
- **Create Path** — lands on the new Path overview; heading takes focus after
  post-delete navigation.
- **New Path modal** — dirty-form discard confirmation.
- **Smaller fixes** — cascade counts labelled as estimates until `goals` /
  `vision` exist; card title clamps to 2 lines; `achievedOn` preserved on
  re-tick; all-achieved done treatment; local-date (not UTC) day keys.

Deferred: input length limits, touch-reorder hint, async double-submit guard,
app-wide date-format convention (reasons in `paths-edgecases.md`).

## Impact

No change to `ACTIONS.md` / `ENTITY_MAP.md` — these are UI states, not model
changes. The one behavioral revision (Archive → undo toast) is recorded here and
reflected in `docs/modules/paths.md`. Every new state has a Storybook story.
Re-run `proto-edgecases` after further changes for a fresh baseline. The
estimated-cascade-counts gap closes for real when `goals` / `vision` are built.
