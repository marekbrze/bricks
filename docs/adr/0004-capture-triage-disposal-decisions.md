# 0004 - Capture-triage disposal decisions

**Date**: 2026-09-04
**Module**: capture-triage
**Status**: Accepted

## Context

`docs/ACTIONS.md` already listed "Promote Action to Goal" and "Discard item"
but left two things unresolved: what happens to the originating Inbox
`Action` once it's promoted into a `Goal`, and whether discard needs a
confirmation step. Both came up while detailing the `capture-triage` module
and needed a decision before lo-fi screens could be designed.

## Decision

- **Promote Action to Goal**: the originating Inbox `Action` is discarded
  once the new `Goal` is created. Its idea now lives as the Goal itself —
  it does not survive as a leftover Inbox item or get auto-added as the
  Goal's first child Action.
- **Discard item**: stays a lightweight, immediate action with no blocking
  confirmation dialog (triage has to stay fast), but is backed by a
  short-lived Undo toast — the same reversibility pattern already used for
  Path archive.

## Impact

`docs/ACTIONS.md` Notes column updated for both actions. No new entities,
states, or glossary terms. `docs/modules/capture-triage.md` documents the
full flows these decisions sit inside.
