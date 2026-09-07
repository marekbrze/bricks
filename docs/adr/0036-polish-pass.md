# 0036 - Polish pass on the whole app

**Date**: 2026-09-07
**Module**: all (shell + today, winlog, capture-triage, paths, goals, actions, vision)
**Status**: Accepted

## Context

Every module had its proto-design pass on the granite system (ADR 0028–0035).
Pre-ship polish walked the real interaction paths (complete/undo, day nav,
overflow menus, dialogs, triage keyboard loop, data-sync forms, schedule and
abandoned views) in light + dark, desktop + phone, with screenshot evidence.

## Decision

Functional-first fixes, then vocabulary/code-quality:

- **Touch hit areas** (phone is a first-class surface, WCAG 2.5.5): small
  icon-only buttons (`size-6/7/8`) and the checkbox keep their visual size but
  grow their interactive area to ~44px on `pointer: coarse` via invisible
  `::after` hit regions. Verified by hit-testing 6px outside the visual box —
  the button answers; 10px out (beyond the zone) correctly doesn't.
- **Row vocabulary consistency**: today's `ActionRow` showed the frog flame on
  completed rows while the actions module hides it — aligned to hide (`frog &&
  !done`). The win wash tells the story; the flag is a call to act.
- **Z-index scale**: the Toaster's arbitrary `z-[10000]` became `z-60` as the
  documented top of the scale (sticky/dropdown 40, modal 50, toast 60).

Verified clean: `pnpm build`, `pnpm lint`, copy sweep (sentence case, Action /
Goal / Path terminology), empty-state shape consistency across pages, focus
rings (granite, visible), reduced-motion fallback, dark-mode surface depth.

## Impact

Quality bar: flagship for a daily-use prototype. The app does everything it
did before — only more precise. Nothing deferred; re-run proto-audit later for
a fresh baseline on evolved code.
