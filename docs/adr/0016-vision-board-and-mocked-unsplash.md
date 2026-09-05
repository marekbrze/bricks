# 0016 - Vision board interaction model and mocked Unsplash search

**Date**: 2026-09-04
**Module**: vision
**Status**: Accepted — the mocked-Unsplash part is superseded by ADR 0027
(live Unsplash API search); every other decision here still stands.

## Context

During `proto-detail` for `vision`, several open points needed a decision
before lo-fi screens could be built: whether a Path can have more than one
Vision (open question in `docs/PROJECT.md` since `proto-init`), how adding
notes vs. images works as an interaction, how Unsplash search behaves in a
prototype with no backend/API key infrastructure, and how reordering mixed
note/image tiles should work given the accessibility bar (WCAG 2.2 AAA)
already set for this project.

## Decision

- **One Vision per Path, confirmed.** `docs/ENTITY_MAP.md` already modeled
  it this way ("Instances per user: One per Path"); this closes the open
  question carried since `proto-init`.
- **Unified "+ Add" control** with a type menu (Add note / Upload image /
  Search Unsplash), rather than three permanently separate entry points.
  Notes and images land in one ordered list.
- **Unsplash search is mocked in the prototype**: query against a bundled
  placeholder photo set, no live network call or API key required. This
  keeps the module's richest external dependency out of the critical path
  for a local-only prototype, matching the project's existing pattern of
  deferring real integrations (see `PROJECT.md` "Openness / API" open
  question). A real Unsplash key/settings screen is deferred, not designed
  here.
- **Reordering** uses the same pattern already established in `goals` and
  `paths`: a drag handle (native HTML5 drag) plus keyboard-accessible
  Move up / Move down actions in each tile's menu, applied uniformly across
  note and image tiles since they share one order.
- **Export downloads directly** (no preview screen) — merges tiles in board
  order into a single markdown file, images as `![]()` tags with Unsplash
  attribution as a caption line.

## Impact

- `docs/PROJECT.md`: "Vision: one or many per Path?" open question marked
  resolved.
- `docs/modules/vision.md` created with the full module spec.
- No changes to `docs/ACTIONS.md` / `docs/ENTITY_MAP.md` / `docs/GLOSSARY.md`
  — the entities, actions, and terms they already captured for `vision`
  matched this decision as-is.
