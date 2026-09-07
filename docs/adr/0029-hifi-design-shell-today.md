# 0029 - Hi-fi design applied to app-shell + today

**Date**: 2026-09-07
**Module**: app-shell, today
**Status**: Accepted

## Context

The prototype was a neutral lo-fi (pure-gray OKLCH shadcn defaults, no theme
mechanism). `docs/DESIGN.md` (ADR 0028) defined the visual direction — granite
Restrained palette, Geist ×1.125 ramp, functional motion, both themes first-class.

## Decision

Applied the direction through the project's own token layer (Tailwind v4
`@theme inline` + shadcn semantic custom properties in `src/index.css`):

- **Tokens**: replaced `:root`/`.dark` values with the DESIGN.md palette —
  granite-tinted neutrals (hue 260, chroma 0.004–0.016), single radius 0.5rem,
  brand focus ring. Added semantic tokens beyond shadcn's set: `win`/`win-strong`
  /`win-soft`, `frog`/`frog-strong`/`frog-soft`, `granite` (interactive text/
  icon tone, same value as `--ring`). Repurposed `chart-1..5` as the
  ContributionGraph intensity ramp (q1–q4 win-green + empty).
- **Type**: Geist retained; `text-*` ramp overridden to fixed rem ×1.125 steps
  (0.75 → 1.6rem); contrast carried by weight (400/500/600), not size noise.
- **Theming**: dark mode wired at boot — inline `index.html` script applies
  `.dark` from `prefers-color-scheme` before first paint (no flash) and follows
  live system changes; `color-scheme` set per theme so native widgets follow.
  A manual override is a settings concern, deliberately not built yet.
  Resolved DESIGN.md ambiguity: the designer's "granite = interactive" map had
  no text-safe accent token mid-ramp — `--granite` (the `--ring` value exposed
  as a color) fills that gap; active nav uses it.
- **Component vocabulary**: checked checkbox = green (`bg-win`, glyph on canvas
  — completion/achievement semantics, global); frog `Flame` recolored from
  destructive-red to amber (`text-frog`) in all six modules where it appeared —
  the semantic map (red = destructive only) is direction-level, so it was fixed
  project-wide in one pass; header glass (`backdrop-blur`) replaced with solid
  background; active nav (TopNav pill + BottomTabs) uses granite; done Action
  rows get the `win-soft` wash (a visibly accumulated day).
- **Motion**: global `prefers-reduced-motion` fallback kills
  transitions/animations; 150ms `transition-colors` on state-bearing rows.

## Impact

The token layer is project-wide — every module screen and all eight shadcn
primitives re-skinned at once; remaining modules elevate on top of it in their
own passes (winlog, capture-triage, paths, goals, actions, vision).
`proto-polish` is the final pass. Verified: `pnpm build` + `pnpm lint` clean,
light/dark screenshots of Today (desktop + phone) read as DESIGN.md intends.
