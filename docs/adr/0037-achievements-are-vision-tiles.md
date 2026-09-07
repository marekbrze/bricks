# 0037 - Achievements are Vision tiles

**Date**: 2026-09-07
**Status**: Accepted

## Context

Achievements ("I can do a pull-up", "100 push-ups") were a checklist embedded
on the `Path` record and rendered as a dedicated section on the Path overview —
a separate surface from the Vision board that holds the same Path's notes and
photos of the wanted future. The designer's call: an achievement is not a
Path-level construct, it is simply another type of element *in the Vision* —
one you can achieve. The overview section must move into the Vision view.

## Decision

`Achievement` becomes a third `VisionTile` type (`type: 'achievement'`) stored
inside the Path's Vision:

- One shared board order — achievement tiles reorder with notes and images.
- The board's Add menu gains "Add achievement"; a tile is ticked/unticked in
  place (reversible, the original `achievedOn` survives a mistaken un-tick —
  the rule ADR-era `use-paths.ts` already implemented, ported), edited inline,
  deleted with the tile menu's Undo, exported as a markdown task-list item.
- The Path overview loses its Achievements section; the Vision summary card
  reports `X/Y achievements` instead. `PathCard`, the archived list, and the
  Delete-Path cascade summary read their counts from the Vision tiles.
- Creating a Path can still seed achievements: the New Path dialog keeps its
  rows, and the caller writes the created titles onto the new Path's Vision
  (`usePaths` grows no dependency on `vision`).
- A one-time, idempotent migration converts legacy `Path.achievements` into
  achievement tiles and strips them from the `paths` key.
- The doc-drift claim that marking an achievement feeds `WinLog` /
  `ContributionGraph` is removed — the code never did this; actually feeding
  WinLog is deferred as a separate product decision.

## Impact

`vision` owns achievements end to end; `paths` shrinks to Paths + the hub
screen. Cascade-delete of achievement tiles rides the existing orphan-Vision
self-heal. Consequences: the `achievements` field disappears from stored
`Path` rows (migration handles old data), and anything that wants achievement
progress reads it through `useVision`, not `usePaths`. Plan:
`docs/changes/achievements-as-vision-tiles.md`.
