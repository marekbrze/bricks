# 0055 - Polish pass on essentials

**Date**: 2026-09-10
**Module**: essentials
**Status**: Accepted

## Context
`essentials` was designed (ADR 0054), hardened (ADR 0053), and functionally
complete. Final pre-ship pass.

## Decision
Quality bar: **flagship** (this is a design-led prototype).

**Design-system alignment** — the module was authored against hi-fi
`goals`/`actions`, so drift was minimal. Resolved:
- **Copy drift (conceptual)**: the entity noun was inconsistently cased
  ("essential" vs `Essential`). The project treats `Goal` / `Path` / `Action`
  as proper nouns in UI copy — `Essential` now follows: "New Essential",
  "No Essentials yet", "Add your first Essential", "Delete Essential",
  "Edit Essential".
- **One-off wording (overview summary)**: `EssentialsSummary` said "N logs on
  this Path" / a variant link label ("Set them up"). Unified to "N logged"
  (matching the per-row counter) and a single stable link "Open Essentials"
  (matching `VisionSummaryCard`'s "Open Vision board").
- **Form label**: the create/edit name field was labelled "Deed" — swapped to
  "Name" to match `GoalDialog`; the placeholder carries the meaning.

**Polish dimensions:**
- **Contrast**: counter and summary use `text-muted-foreground` (≥4.5:1 per
  DESIGN token spec) with emphasised numbers in `text-foreground`; no gray on a
  colored surface.
- **Interaction states**: Log button, overflow menu, drag handle, dialog fields
  all inherit the shadcn/token state set (hover / focus ring / active / disabled)
  — verified, none suppressed.
- **Alignment**: `EssentialRow` shell matched to `ActionRowItem` (`gap-3`,
  `-ml-1` grip); mobile stacked counter `mt-1`.
- **Copy**: `LogEssentialDialog` description tightened to an accumulation-framed
  one-liner ("counts as a small win for this Path"); empty-state seed intro made
  Path-type-neutral ("A few examples to get you started").
- **Responsiveness**: counter stacks under the deed name below `sm`; `<h1>`
  wraps; no horizontal scroll at 360px.
- **Dark mode**: semantic tokens only — no component-level overrides needed.
- **Code**: no `console`/TODO/debug; no hardcoded colors; shared components
  throughout (no one-offs).

## Impact
`essentials` ships. `tsc` + `eslint` + `npm run build` + 141 story tests green.
Deferred (from ADR 0053, unchanged): #6 input-length limits (project-wide), #7
counter memoisation (real-build), #9 Path-aware seed sets, #10/#11 minor. Re-run
`proto-audit` later for a fresh baseline on evolved code.
