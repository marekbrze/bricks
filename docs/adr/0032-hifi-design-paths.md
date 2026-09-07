# 0032 - Hi-fi design applied to paths (+ story-routing repair)

**Date**: 2026-09-07
**Module**: paths
**Status**: Accepted

## Context

The paths module was token-clean lo-fi; the ADR 0029 token layer carried most
of the visual transformation. Two remaining defects:

1. **Contrast**: `PathCard`'s "No Vision yet" placeholder used
   `text-muted-foreground/70` — muted at 70% opacity fails the 4.5:1 floor
   (DESIGN.md: the muted tokens are the *lightest* allowed).
2. **Broken stories (pre-existing)**: commit 10ce4b2 moved `PathOverviewPage`
   (and `GoalProgressPage` shares the pattern) to `useParams`, but the story
   decorators render inside a bare `MemoryRouter` with no `<Routes>` — every
   param reads empty, so `paths-pathoverviewpage--with-data` rendered
   `PathNotFound`. Discovered during this pass's screenshot verification.

## Decision

- Dropped the `/70` opacity from the placeholder text.
- `Providers` in both `paths` and `goals` story-helpers accept an optional
  `route` pattern; `withPaths`/`withGoals` pass it through, and param-bearing
  stories (`/paths/:pathId`, `/paths/:pathId/goals/:goalId`) now mount the
  story under a matching `<Route>` so `useParams` populates. Deep-linked
  stories render their real pages again.
- Everything else inherits the granite token layer; Path identity stays
  typographic (no per-Path colors), per DESIGN.md.

## Impact

No app-code behavior changes — the routing fix is story-layer only, but it
re-arms visual verification for the Path overview and Goal progress pages
used by every later pass.
