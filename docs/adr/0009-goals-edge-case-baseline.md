# 0009 - Goals edge-case baseline

**Date**: 2026-09-04
**Module**: goals
**Status**: Accepted

## Context

The `goals` prototype (proto-lofi) handled its happy paths and several
edge cases proactively during the build, but had not been systematically
stress-tested.

## Decision

Audited into `docs/modules/goals-edgecases.md`. 11 gaps found, all 🟡/🟢 (no
🔴 blockers). Top priorities: Goals under an archived Path stay fully
mutable instead of read-only like Achievements; corrupt `actions` storage
isn't checked on either Goals route; achieving/abandoning a Goal doesn't
touch or flag its own Actions; Move Goal to another Path has no Undo unlike
every other structural change in the app.

## Impact

`proto-harden` will implement the priority list. Re-run `proto-edgecases`
after the prototype changes to get a fresh baseline.
