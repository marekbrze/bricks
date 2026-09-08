# [0043] - Goals list folded into the Path overview

**Date**: 2026-09-08
**Status**: Accepted

## Context

The Path overview (`/paths/:pathId`) showed a Vision summary, a stub "Goals and
Actions" blurb, and a win balance, then linked out to a separate **Goals** tab
(`/paths/:pathId/goals`, `GoalTreePage`) for the actual Goal tree. Opening a
Path to see its Goals meant a second click to a tab that added nothing the
overview couldn't hold. ADR 0026 put Overview / Actions / Goals / Vision on one
tab bar; in practice the Goals tab was pure indirection.

## Decision

Planned in `docs/changes/goals-onto-path-overview.md`. The Path overview becomes
three stacked sections: **Vision** (`VisionSummaryCard`, unchanged) → **Wins**
(per-Path `WinBalance`) → **Goals** (the full tree, inline). A short counts row
(Goal / achieved / Action) was tried above the balance and cut as noise.

- The Goal tree moves out of `GoalTreePage` into a `goals`-owned embeddable
  component, `PathGoalsSection` — the same pattern `vision` uses for
  `VisionSummaryCard`. It keeps the list, drag-and-drop + keyboard reorder, the
  per-row lifecycle menu, "New Goal", the empty state, and the archived-Path
  read-only rendering.
- `GoalTreePage` and its stories are deleted. The `/paths/:pathId/goals` route
  is removed. `GoalProgressPage` (`/paths/:pathId/goals/:goalId`) stays; its
  back-link and self-delete navigation repoint to `/paths/:pathId`.
- `PathTabs` drops the Goals entry. Tabs are now **Overview · Actions · Vision**.
- The corrupt-`goals` / corrupt-`actions` recovery screens move onto
  `PathOverviewPage`, alongside its existing Paths / Vision guards.

This supersedes the Goals-tab part of ADR 0026 (the Actions tab and its
drag-and-drop are unchanged).

## Impact

Affects `paths` (overview re-composed, `PathTabs` trimmed, `ModuleStubSection`
deleted) and `goals` (new `PathGoalsSection`, `GoalTreePage` deleted,
`GoalProgressPage` / `GoalNotFound` back-links repointed). No new entities,
actions, or states — every moved surface was already hardened. Docs updated:
`docs/modules/paths.md`, `docs/modules/goals.md`, `docs/UI-STRATEGY.md`,
`docs/MODULES.md`. All work is direct edits; no `proto-lofi` / `harden` pass
needed. Re-run `proto-feature` if the overview grows a real stats surface.
