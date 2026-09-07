# 0034 - Hi-fi design applied to actions

**Date**: 2026-09-07
**Module**: actions
**Status**: Accepted

## Context

The Actions view is the wide derived surface — it introduces no entities and
rides the other modules' hooks, so the token layer carried most of it. Two
vocabulary gaps against DESIGN.md remained.

## Decision

- **Done-row wash** (`border-win/25 bg-win-soft`) applied to `ActionRowItem`,
  matching today's `ActionRow` — one row looks like one row in every module
  (product ban: inconsistent component vocabulary). Abandoned rows keep
  muted opacity — abandonment is not a win, no green.
- **Uppercase eyebrow removed**: the "Closed goals with open actions"
  fallback header was `text-xs uppercase tracking-wide` — the exact
  banned "tiny uppercase tracked eyebrow" pattern, and the only
  sentence-case violation in the app's section headers. Now
  `text-sm font-medium text-muted-foreground`, matching the app-wide
  header vocabulary.

## Impact

Row vocabulary is now uniform across today/actions/paths. proto-polish is
the final pass.
