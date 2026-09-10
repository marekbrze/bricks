# 0054 - Hi-fi design applied to essentials

**Date**: 2026-09-10
**Module**: essentials
**Status**: Accepted

## Context
`essentials` was built (proto-lofi, ADR 0051) and hardened (ADR 0053) after the
project's design direction (`docs/DESIGN.md`, ADR 0028) and token layer
(ADR 0035–0036) were already in place. The module was authored against the
existing hi-fi `goals` / `actions` components, so it landed largely on-brand.

## Decision
No new token or type work — the OKLCH `@theme` layer, Geist type scale, light/dark
theming and 150–250ms state-only motion are project-wide and already carry here.
Register: **product**.

This pass verified `essentials` against `DESIGN.md` and aligned its row
vocabulary to the canonical `ActionRowItem` / `GoalRow`:
- `EssentialRow`: `gap-3`, `-ml-1` grip inset, `transition-colors` — identical
  row shell to `ActionRowItem`.
- Completion counter stays **granite-neutral** (`text-muted-foreground
  tabular-nums`), today's number in `font-medium text-foreground` — **no
  win-green, no badge, no flame**. A logged deed feeds the win balance
  (ADR 0051); the per-row counter is a plain count like `GoalRow`'s "N Actions",
  not a second trophy. This honours the project ban on gamified rows while the
  Log still carries the one moment of win-green.
- `EssentialsSummary` matches `VisionSummaryCard` structure; count reads
  "N logs on this Path" — accumulation framing, no percent-complete.
- Empty state: `Anchor` glyph, dashed `bg-card` frame, `py-16` — matches
  `PathGoalsSection`'s empty state.
- Dialogs (`EssentialDialog` / `LogEssentialDialog` / `DeleteEssentialDialog`)
  are already the `GoalDialog` / `DeleteGoalDialog` vocabulary verbatim.
- Slop test: no hardcoded colors, no side-stripe borders, no gradient text, no
  glassmorphism, no uppercase eyebrows, no `01/02/03` scaffolding. All chrome is
  granite-tinted neutral; hue only where the semantic map allows.

## Impact
`essentials` is high-fidelity and on-brand with zero token changes. `tsc` +
`eslint` + `npm run build` + 141 story tests green. `proto-polish essentials` is
the final pass (contrast sweep, every interaction state, the last 5%).
