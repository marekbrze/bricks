# 0031 - Hi-fi design applied to capture-triage

**Date**: 2026-09-07
**Module**: capture-triage
**Status**: Accepted

## Context

The triage module rode the neutral lo-fi tokens. Its surfaces were
token-clean, so the token layer (ADR 0029) already carried most of the
transformation. One direction violation remained: the "Inbox zero" empty
state used lucide's `PartyPopper` — literally a confetti glyph, which
DESIGN.md's project bans (anti-Habitica: "nothing celebrates with confetti")
rule out.

## Decision

- `PartyPopper` replaced with calm, meaning-bearing glyphs: `CheckCheck` in
  `text-win` when items were processed this session (an "all clear", not a
  celebration), `Inbox` in muted when there was nothing to triage at all.
- Everything else inherits the granite token layer unchanged — the triage
  card is deliberately the calmest frame in the app (DESIGN.md hand-off
  note), and the lo-fi already achieved that structurally.

## Impact

No behavior or flow changes. proto-polish is the final pass.
