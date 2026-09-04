# 0011 - Today edge-case baseline

**Date**: 2026-09-04
**Module**: today
**Status**: Accepted

## Context

The `today` module's prototype (day view, Schedule/agenda view, Review
abandoned) handled its happy paths but had not been stress-tested for edge
cases.

## Decision

Audited into `docs/modules/today-edgecases.md`. 11 gaps found (0 🔴, 5 🟡, 6
🟢) — no blockers or data loss, but real gaps around Undo coverage
(Abandon), day-position persistence across a refresh, and a Path self-heal
that leaves stale `scheduledDate`/`completedAt` on a re-triaged Action. Top
priorities: clear stale schedule fields on self-heal, give Abandon an
Undo, put the viewed date in the URL.

## Impact

`proto-harden` will implement the priority list. Re-run `proto-edgecases`
after the prototype changes to get a fresh baseline.
