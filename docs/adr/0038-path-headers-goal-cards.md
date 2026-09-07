# [0038] - Actions views: Path as header, Goal as card

**Date**: 2026-09-07
**Module**: actions (shared with paths' Actions tab)
**Status**: Accepted

## Context

The Actions view (`/actions`) and a Path's Actions tab (`/paths/:pathId/actions`)
wrapped each Path in a bordered card (`rounded-xl border p-4`) with its Goals
rendered flat inside it. The result inverted the product's real hierarchy: the
Path — a label for a group of work — took the box, while the Goal — the
container the Owner actually files Actions into — read as loose rows floating
in the Path's frame. On the whole-app view the nested Path boxes also produced
a card-inside-the-page-inside-the-app double frame.

## Decision

Flip the vocabulary to match the hierarchy:

- **Path = typographic header** (`PathSection`): signpost glyph, name at
  `text-lg font-semibold`, "New goal" on the header row; no border, no fill.
  The page h1 stays the largest step (`text-xl`), Path headers one step below.
- **Goal = card** (`GoalGroup`): `rounded-xl border border-border bg-card p-3`
  — the `--card` surface, the one elevation step above canvas per DESIGN.md
  (white over canvas in light; lighter 0.21 over 0.16 in dark). Nested
  sub-Goals are cards inset by the parent card's padding — one card vocabulary
  at every depth, and the `depth` prop (formerly `border-l` indentation)
  became dead and was removed from `GoalGroup` / `useGoalGroups` /
  `PathActionsBody`.
- **Standalone block = card** (`PathActionsBody`): same surface as a Goal
  group — it is one more place work files into, and one row-group vocabulary
  keeps the column reading true.
- A Path's Actions tab drops its wrapper card (`PathActionsPage`): the page h1
  is already the Path header, Goals carry the boxes.

Interactions, data, and edge-case states unchanged: drop targets stay on the
Goal sections and the Standalone block, collapse persistence, quick-add, and
row actions are untouched. Dashed borders keep their "unfiled" semantics
(Inbox, Unassigned, quick-add rows, the closed-Goals separator).

## Impact

Both actions views read Path → Goals in one scan: headers name the sections,
cards carry the work, and the card surface distinguishes itself from the
canvas in both themes via tokens (no hardcoded color). `depth` plumbing is
gone from the Goal-group API. proto-polish remains the final pass.
