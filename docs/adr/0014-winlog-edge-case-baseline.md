# 0014 - WinLog edge-case baseline

**Date**: 2026-09-04
**Module**: winlog
**Status**: Accepted

## Context

The `winlog` prototype handled its happy path (global Log, embedded graphs)
but had not been stress-tested for edge cases.

## Decision

Audited into `docs/modules/winlog-edgecases.md`. 8 gaps found: 🔴 1 · 🟡 4 ·
🟢 3. Top priorities: (1) "Move to another day" on a completed Action
silently drops its Win from the log (root cause in `capture-triage`'s
`scheduleAction`, surfaced by `winlog`'s live-derived model); (3) the Path
filter isn't URL-addressable, unlike `today`'s `/today/:date`; (5) the
empty state doesn't handle the no-Paths-yet case.

## Impact

`proto-harden` will implement the priority list. Re-run `proto-edgecases`
after the prototype changes to get a fresh baseline.
