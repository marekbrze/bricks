# 0017 - Vision edge-case baseline

**Date**: 2026-09-04
**Module**: vision
**Status**: Accepted

## Context

The `vision` prototype shipped its happy path (board, unified add flow,
mocked Unsplash, export) but had not been stress-tested for edge cases.

## Decision

Audited into `docs/modules/vision-edgecases.md`. 10 gaps found: 🔴 1 ·
🟡 6 · 🟢 3. Top priorities: (1) a single large upload blows the
LocalStorage quota and silently stops *every* module from persisting — the
spec's flagged-but-unbuilt "size guard"; (4) "Moved" / "Tile deleted" toasts
fire even when the mutation changed nothing; (5) a corrupt `visions` value
is invisible on the Path overview, which shows the empty state and invites
writing into storage the app can't read.

## Impact

`proto-harden` will implement the priority list. Re-run `proto-edgecases`
after the prototype changes to get a fresh baseline.
