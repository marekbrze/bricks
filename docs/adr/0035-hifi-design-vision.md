# 0035 - Hi-fi design applied to vision (+ story-routing repair)

**Date**: 2026-09-07
**Module**: vision
**Status**: Accepted

## Context

The Vision board was token-clean lo-fi; photos legitimately carry their own
hue, so the granite chrome needed nothing more (DESIGN.md: "Unsplash imagery
is the one place photos set the color"). The module's stories, however, were
also broken by the `useParams` refactor (ADR 0032): the board page reads
`useParams().pathId`, the decorators render in a bare `MemoryRouter`, so
every board story rendered `PathNotFound`.

## Decision

- Same story-layer repair as paths/goals: `Providers` accepts a `route`
  pattern, and `withVision` defaults to `/paths/:pathId/vision` — board
  stories render their real pages again.
- No visual changes: the board already reads as DESIGN.md intends — white
  tiles on the granite canvas, hairline borders, muted attribution lines,
  photos setting their own color.

## Impact

Vision verification is re-armed for proto-polish. No app-code behavior
changes.
