# 0002 - Paths edge-case baseline

**Date**: 2026-09-04
**Module**: paths
**Status**: Accepted

## Context

The `paths` prototype (proto-lofi) handled the happy paths and several edge cases
named in the module spec, but had not been systematically stress-tested.

## Decision

Audited the whole module into `docs/modules/paths-edgecases.md`. 18 new gaps
found (🔴 3 · 🟡 9 · 🟢 6). Top priorities:

1. Silent LocalStorage failures — a full quota or a corrupt stored value is
   currently indistinguishable from "all good" / "no data".
2. The delete-cascade confirmation is computed from mock Goal/Action/Vision
   counts, so the one irreversible action is confirmed against wrong numbers.
3. The save-failure banner only shows on `/paths`; Archive has no confirm; no
   undo/feedback on archive, reorder, or delete.

## Impact

`proto-harden` implements the priority list. Re-run `proto-edgecases` after the
prototype changes to refresh the baseline. The mock-count gap (#3) closes for
real when the `goals` and `vision` modules are built.
