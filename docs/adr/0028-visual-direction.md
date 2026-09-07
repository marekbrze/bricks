# 0028 - Visual direction captured

**Date**: 2026-09-07
**Module**: app-shell (cross-cutting)
**Status**: Accepted

## Context

All seven core modules are past `proto-harden` on neutral shadcn defaults —
pure-gray OKLCH tokens (chroma 0), Geist at Tailwind's default type ramp, radius
0.625rem. The prototype works but looks like scaffolding. Entering the visual
phase, nothing recorded what Bricks should *look like*, so every styling decision
would have been re-litigated per screen.

## Decision

Ran `proto-brand`; direction committed to `docs/DESIGN.md`:

- **Register**: product — design serves the daily task; earned-familiarity bar.
- **Scene**: used all day, everywhere (phone by day, desktop morning/evening) →
  both themes first-class; light is the canonical reference, dark is a built
  adaptation (surface-lightness depth, not inversion).
- **Personality**: calm, stone-like, persevering (spokojne, kamienne, wytrwałe).
- **Color strategy**: Restrained. Seed hue **granite** `oklch(0.52 0.05 260)` —
  the designer's explicit choice over the clay/terracotta recommendation; hue is
  spent only on meaning: green = win/accumulation, amber = frog, red =
  destructive, granite = interactive. The ContributionGraph is the one surface
  allowed color at full strength.
- **Typography**: single sans (Geist Variable, already loaded), ×1.125 fixed
  rem ramp, three weights, tabular-nums on all data.
- **Motion**: functional only — 150ms states, 200ms overlays, no choreography,
  reduced-motion fallback.

Anti-references made enforceable as bans: no gamification tchotchkes
(Habitica), no motivational-poster energy (gradients, emoji-fire), no Griply
heavy chrome, no SaaS-dashboard card wallpaper.

## Impact

`proto-design` implements this per module — shell + today first, then winlog,
capture-triage, paths, goals, actions, vision. `proto-polish` is the final pass.
The shadcn token names stay, so the eight existing primitives re-skin for free;
new `win`/`frog` tokens join the `@theme` layer. Re-run `proto-brand` to evolve
the direction deliberately — never drift from DESIGN.md silently.
