# Design Direction

> Captured by `proto-brand` on 2026-09-07 (ADR 0028). This document is the single
> source of visual truth. `proto-design` implements it per module; `proto-polish`
> enforces it at the end. Re-run `proto-brand` to evolve it — never drift from it
> silently.

## Register

**Product.** Bricks is a daily-use personal tool — design serves the task
(planning the day, closing wins, reading the log). The bar is earned familiarity:
a user fluent in Things 3 / Linear / Raycast trusts it immediately and the tool
disappears into the work. Distinctiveness is spent in exactly one place — the
win balance (ADR 0039), where the two counts *are* the content: small wins
rising, big wins rising slower.

## Scene

The Owner uses Bricks **all day, everywhere**: a phone during the day (break,
couch, commute — capture to the Inbox, tick off an Action) and a desktop in the
morning and evening (plan the day, close the evening review in the Log). There is
no single ambient light — so there is no single theme. Both themes are first-class:
**light is the canonical reference** (design reviews happen in light), **dark is a
built adaptation, not an inversion** (depth from surface lightness, never shadows).
Default follows the system; a manual override is a settings concern.

## Personality

**Spokojne, kamienne, wytrwałe — calm, stone-like, persevering.**

The surface speaks like a wall of stone laid brick by brick: it does not perform,
it does not cheer, it does not sparkle. Every win is one more brick — the emotion
is the *weight of accumulation*, and it lives in the Log, not in decoration. In
practice: calm spacing, disciplined alignment, near-neutral chrome, and hue spent
only where it means something.

## References

- **Things 3 — calm clarity**: hierarchy is built from light, space and weight,
  never from color or boxes. A list reads instantly; nothing competes with the
  tasks themselves. Bricks borrows this for every list surface (Today, Actions,
  triage).
- **Linear — precision and discipline**: tight vertical rhythm, narrow spacing
  scale, restrained near-monochrome chrome, keyboard-first interactions taken
  seriously. Bricks borrows this for structure: rows, dialogs, hover states,
  focus rings.
- **openloops — the win-kind balance**: two icons, two counts, nothing else —
  small wins (actions) and big wins (closed goals) side by side, honest zeros
  included. Bricks borrows this for the Log and every embedded win summary
  (ADR 0039).

## Anti-references

- **Habitica — infantile gamification**: badges, confetti, XP points, mascot
  characters, streak flames. Motivation-by-tchotchke insults the product's own
  thesis (accumulation is the reward). Nothing in Bricks may celebrate with
  confetti, award badges, or speak in game vocabulary.
- **Motivational-poster aesthetics**: big gradient slogans, emoji-fire on top of
  text, "YOU GOT THIS" energy. Energy comes from content and structure (the count
  going up, the wall filling in), never from decoration.
- **Griply — rigid structure as UI**: closed, over-chromed, every action behind
  a modal maze. (Functional anti-reference from PROJECT.md, restated here because
  its look — heavy chrome, colorful sections everywhere — is also wrong.)
- **Corporate SaaS dashboard**: identical card grids, KPI-tile wallpaper,
  gray-blue admin defaults.

## Color

**Strategy**: **Restrained** — granite-tinted neutrals carry ~100% of the chrome;
one accent at ≤10% of any surface; hue reserved for meaning. The win-green
appears only where a win *is*: icons and balance counts (the Log's one moment
of visual strength), never as decoration (ADR 0039).

**Seed hue**: granite — `oklch(0.52 0.05 260)`, the designer's explicit choice
(grafit/granit) over reflex hues. It reads as *material* — pencil graphite,
granite — not as "blue". At chroma ≤0.05 it is an accent barely off neutral;
the UI's visible color budget goes to semantics instead:

> **green = win / accumulation · amber = frog · red = destructive · granite =
> interactive. Nothing else in the app receives hue.**

| Role | Token | Light | Dark | Notes |
|------|-------|-------|------|-------|
| Canvas | `--background` | `oklch(0.985 0.004 260)` | `oklch(0.16 0.008 260)` | body bg, granite breath — NOT pure white / NOT pure black |
| Ink (body) | `--foreground` | `oklch(0.225 0.012 260)` | `oklch(0.92 0.006 260)` | body text, tinted toward seed |
| Card | `--card` | `oklch(1 0 0)` | `oklch(0.21 0.01 260)` | the one elevation step above canvas |
| Popover | `--popover` | `oklch(1 0 0)` | `oklch(0.23 0.01 260)` | |
| Muted fill | `--muted` | `oklch(0.955 0.006 260)` | `oklch(0.25 0.012 260)` | chips, day-group headers, secondary fills |
| Muted text | `--muted-foreground` | `oklch(0.48 0.016 260)` | `oklch(0.68 0.012 260)` | secondary text & placeholders — ≥4.5:1, no lighter |
| Secondary | `--secondary` | `oklch(0.95 0.007 260)` | `oklch(0.26 0.012 260)` | subtle buttons |
| Accent fill | `--accent` | `oklch(0.925 0.012 260)` | `oklch(0.28 0.014 260)` | hover/selected row tint |
| Primary | `--primary` | `oklch(0.29 0.018 260)` | `oklch(0.90 0.008 260)` | deep granite (light) / light granite (dark) |
| On-primary | `--primary-foreground` | `oklch(0.98 0.003 260)` | `oklch(0.20 0.012 260)` | |
| Border | `--border` | `oklch(0.91 0.008 260)` | `oklch(1 0 0 / 12%)` | hairlines only |
| Input edge | `--input` | `oklch(0.89 0.01 260)` | `oklch(1 0 0 / 16%)` | a hair darker than border |
| Focus ring | `--ring` | `oklch(0.52 0.05 260)` | `oklch(0.70 0.04 260)` | **the granite accent** — most saturated chrome token |
| Destructive | `--destructive` | `oklch(0.55 0.2 27)` | `oklch(0.68 0.17 25)` | delete / abandon-for-good only |
| Win | `--win` | `oklch(0.55 0.13 150)` | `oklch(0.72 0.12 150)` | win icons, the Log's balance numbers (large text) |
| Win deep | `--win-strong` | `oklch(0.45 0.11 150)` | `oklch(0.82 0.10 150)` | win text on soft tint, badge counts (≥4.5:1) |
| Win tint | `--win-soft` | `oklch(0.94 0.045 150)` | `oklch(0.30 0.05 150)` | "done" row wash, achievement states, close-goal badge |
| Frog | `--frog` | `oklch(0.60 0.13 70)` | `oklch(0.76 0.12 70)` | the frog glyph/star — ≥3:1 on canvas |
| Frog deep | `--frog-strong` | `oklch(0.48 0.11 70)` | `oklch(0.85 0.10 70)` | frog as text (≥4.5:1) |
| Frog tint | `--frog-soft` | `oklch(0.95 0.05 80)` | `oklch(0.32 0.05 75)` | frog row wash |

**Neutrals**: tinted chroma 0.004–0.016 toward hue 260 — the project's own stone,
NOT default-warm cream (`60`), NOT pure gray (chroma 0 is dead). 9-step working
range from canvas 0.985 to ink 0.225 (light), mirrored in dark.
**Dark mode**: depth from a surface-lightness scale — canvas 0.16 → card 0.21 →
popover 0.23 (higher = closer); same hue+chroma family as light; accents
desaturated slightly (chroma −0.01); body text relies on lightness, never weight
increases; `--border`/`--input` go translucent-white, not gray.
**Radius**: single value `--radius: 0.5rem` (chiseled, down from the shadcn
default 0.625rem); all variants computed from it (already wired in `@theme`).
**Focus ring**: granite (`--ring`), 2px, visible on every interactive element —
never suppressed.

## Typography

**Direction**: one well-tuned sans carries the whole UI — the product default.
**Family**: **Geist Variable** (already self-hosted via `@fontsource-variable/geist`).
It fits the three words precisely: geometric and engineered without coldness
(precyzyjne), quiet on the page (spokojne), built for daily reading at 14px
(wytrwałe). It rejects the reflex display-serif pairing ("stone ≠ serif") and any
second family — contrast comes from weight and size, not from typeface switching.
**Scale**: fixed rem steps, ×1.125 ratio:

| Step | rem | px | Role |
|------|-----|----|------|
| xs | 0.75 | 12 | meta only: timestamps, counts in chips, attribution — never body |
| sm | 0.875 | 14 | **default UI text**: rows, list items, buttons, inputs |
| base | 1 | 16 | descriptions, dialog body, iOS inputs (16px floor — existing rule) |
| lg | 1.125 | 18 | page titles |
| xl | 1.266 | 20 | section headers, Path names |
| 2xl | 1.424 | 23 | sub-counters |
| 3xl | 1.6 | 26 | the Log's win-balance counters (tabular-nums) |

Override Tailwind's `text-*` steps to this ramp in `@theme` (defaults 1.25/1.5/
1.875 are too loose for Linear-density lists).
**Weights**: three only — 400 body · 500 UI labels, chips, buttons · 600 headings
and counters. Variable font: set weight via `font-weight`, no axis games.
**Loading**: self-hosted variable woff2, `font-display: swap`, single file —
nothing to preload beyond the existing import; fallback `system-ui` stack.
**Details**: `tabular-nums` on every date, count and counter;
line-height 1.5 body / 1.2 headings; vision-note prose measure 65–75ch;
no letter-spacing games (no tracked uppercase eyebrows — banned below).

## Motion

**Functional only.** 150–250ms, state-only:

- 150ms — color/background/border/opacity transitions (hover, selected, checked)
- 200ms — overlays (dialogs, popovers, dropdowns): fade + 2–4px translate; no zoom
- press feedback: `scale(0.98)` on buttons is a *state*, allowed
- **no choreography**: no page-load staggers, no route transitions, no scroll
  animation, no entrance effects anywhere
- `prefers-reduced-motion: reduce` → all transitions off

The Log may *update* live (a balance count increments) but always as
a state change at 150ms — a brick is laid, not celebrated.

## Guardrails

**Absolute bans**:
- Side-stripe borders (`border-left/right > 1px` as colored accent) — full
  hairline borders, background tints, or leading glyphs instead
- Gradient text (`background-clip: text`) — solid color; emphasize with weight
- Glassmorphism — none
- Hero-metric template, identical card grids, tiny uppercase tracked eyebrows,
  `01/02/03` numbered scaffolding
- Text overflowing its container at any breakpoint

**Product bans**:
- Decorative motion that isn't state
- Inconsistent component vocabulary across screens (one row looks like one row
  in every module)
- Display fonts in UI labels, buttons, or data
- Reinvented standard affordances (custom scrollbars, bespoke form controls)
- Heavy accents on inactive states
- Modal-as-first-thought — inline first, dialogs only for commit/confirm/create

**Project bans** (the anti-references, made enforceable):
- Confetti, badges, XP, mascots, streak flames, game vocabulary
- Gradient slogans, emoji-fire, motivational-poster energy
- Hue anywhere the semantic map doesn't justify it (green=win, amber=frog,
  red=destructive, granite=interactive — nothing else)
- Percent-complete framing in the Log or any win summary — accumulation,
  not completion

**Contrast floor**: body text ≥4.5:1 · large text & UI components ≥3:1 ·
placeholders and muted text ≥4.5:1 (the muted tokens above are the *lightest*
allowed) · the frog glyph is the only amber allowed below 4.5:1, and only at
icon size — frog *text* uses `--frog-strong`.

## Hand-off to proto-design

**Token layer**: `src/index.css` — two layers, both already in place:
shadcn semantic custom properties on `:root` / `.dark` (replace the values above;
keep the token names so all eight shadcn primitives re-skin for free), plus the
Tailwind v4 `@theme inline` mapping — add `--color-win`, `--color-win-strong`,
`--color-win-soft`, `--color-frog`, `--color-frog-strong`, `--color-frog-soft`
so `text-win` / `bg-frog-soft` utilities exist, and override the `text-*` size
ramp to the ×1.125 scale. **First move**: lay the palette down in the shell
(`AppHeader`, `TopNav`, `BottomTabs`, `AppFooter`) — every module screen inherits
it instantly.

**Per-module order** (from MODULES.md priority, shell first):
1. **app-shell + today** — the token layer lands with the highest-daily-use
   surface; information hierarchy (per-Path sections, frog/valuable signalling)
   is the product's core design problem
2. **winlog** — the differentiator; the win balance gets the one allowed
   moment of visual strength
3. **capture-triage** — the most novel interaction; triage card needs the
   calmest possible frame around it
4. **paths** — hub screen; Path identity stays typographic (no per-Path colors —
   the semantic map forbids it)
5. **goals** — richest structure; tree + countdown + frog propagation in
   Linear-density rows
6. **actions** — wide but low-risk; inherit the row vocabulary from today
7. **vision** — the gallery breathes against the granite chrome; Unsplash
   imagery is the one place photos set the color
