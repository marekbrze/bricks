# 0030 - Hi-fi design applied to winlog

**Date**: 2026-09-07
**Module**: winlog
**Status**: Accepted

## Context

The `winlog` module rode the neutral lo-fi: its ContributionGraph tinted cells
with `bg-primary/N` alpha steps (granite transparency — the graph read as a
monochrome density grid), win rows carried meaningless `text-primary` /
`text-muted-foreground` icons, and the accumulation total only appeared as a
small figcaption under the graph.

## Decision

Per `docs/DESIGN.md` (the one surface allowed hue at full strength):

- **ContributionGraph tone()** switched from granite-alpha steps to the
  win-green intensity ramp: `chart-1..4` for 1–4 wins, `bg-win` as the 5+
  ceiling, `bg-muted` empty, transparent future. `--chart-4` moved one step
  lighter than `--win` (0.62/0.66 light/dark) so the 5+ tier still reads as
  the ceiling — six tiers, five visible colors (edgecases #6 preserved).
- **WinRow** icons (CheckCircle2 for action wins, Trophy for goal wins) both
  `text-win` — the glyph differentiates kind, green carries the win.
- **LogPage** gained the accumulation counter: `totalWins` (same reduce the
  graph performs) as a 3xl tabular-nums figure beside "Log" — the visual
  weight the type ramp reserved for it. Not a hero-metric tile: one number,
  no card, the module's thesis stated once.

## Impact

Graph and history are on-brand in all three scopes (Log page, Path overview
embed, Goal progress embed) — they share the component. proto-polish is the
final pass.
