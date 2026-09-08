# 0044 - Bug: second Unsplash photo can't be added — diagnosed

**Date**: 2026-09-08
**Status**: Accepted

## Context
Bug report: on a Vision board, after adding one photo from Unsplash the picker stops adding any further photos until the page is reloaded. Needed a root-cause diagnosis before fixing.

## Decision
Diagnosed in `docs/changes/vision-unsplash-second-pick-locked.md`. Root cause: logic error — the `pickLock` ref in `UnsplashSearchDialog` (a double-pick guard) is only cleared inside the Radix `onOpenChange` handler, which never fires on open because the dialog is fully controlled (parent opens/closes via `setSearchOpen`, no `DialogTrigger`). The lock stays `true` for the life of the mounted component, so every pick after the first no-ops. Severity: 🔴 high (primary flow broken after first use). Routes to a direct edit — replace the `onOpenChange`-driven resets with an `useEffect` keyed on the `open` prop. Regression sites: the double-click guard, the `apiKey` refresh on open, and the Escape/X close propagation (3).

## Impact
Fix applied in the same pass: `UnsplashSearchDialog` now drives its per-open reset off the `open` prop via `useEffect`, not the never-firing `onOpenChange(true)`. A parent-controlled regression story (`PicksRepeatedlyWhenParentControlsOpen`) was added and confirmed to fail on the pre-fix code. Lint, types, 106 story tests, and the production build all pass.
