# 0005 - Capture-triage edge-case baseline

**Date**: 2026-09-04
**Module**: capture-triage
**Status**: Accepted

## Context

The `capture-triage` lo-fi prototype (quick capture, Inbox, card-by-card
triage) handled its happy paths but had not been stress-tested for edge
cases, following the same process already run for `paths`.

## Decision

Audited into `docs/modules/capture-triage-edgecases.md`. 11 gaps found (🔴 1 ·
🟡 7 · 🟢 3). Top priorities: Path deletion orphaning assigned Actions, the
corrupt-data recovery screen missing on the `/capture-triage/triage` route,
and the no-Paths dead end losing triage session progress.

## Impact

`proto-harden` will implement the priority list. Re-run `proto-edgecases`
after the prototype changes to get a fresh baseline.
