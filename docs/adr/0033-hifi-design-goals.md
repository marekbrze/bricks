# 0033 - Hi-fi design applied to goals

**Date**: 2026-09-07
**Module**: goals
**Status**: Accepted

## Context

Goals is the structurally richest module (self-referential tree, priority
order, frog propagation, achieve/abandon lifecycle, deadlines). The token
layer (ADR 0029) carried the base; two vocabulary pieces still spoke the old
neutral language, and the tree page's stories were among the ones broken by
the `useParams` refactor (fixed in ADR 0032, default route added here for
`withGoals`).

## Decision

- **StateBadge "Achieved"** switched from granite (`bg-primary/10
  text-primary`) to the win pair (`bg-win-soft text-win-strong`) — the
  semantic map says green = achieved/won; "Abandoned" stays muted.
- **Goal progress counter** got the same treatment as the Log's: cumulative
  Actions as a 3xl tabular-nums figure with a muted label, replacing the
  inline text sentence. One number, no card chrome — accumulation stated
  once per scope (global Log / Path / Goal share the pattern, not the pixel
  position).
- Deadline pills unchanged (destructive when overdue, muted otherwise,
  tabular-nums); tree indent, drag states, and frog flames already carried
  by earlier passes.

## Impact

The tree, the row, and the progress page now all speak the same vocabulary.
proto-polish is the final pass.
