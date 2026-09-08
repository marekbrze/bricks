# Bug: Second Unsplash photo can't be added

## Type
Bug (diagnosed by proto-bug)

## Severity
🔴 high — a primary flow of the Vision board (add imagery to a board) is broken after the first use; the fix is a one-line lifecycle correction but the symptom fully blocks repeat adds until the page is reloaded.

## Reproduction
1. Open a Path's Vision board → Add → **Search Unsplash**.
2. Search, click a photo → tile is added, dialog closes. ✅
3. Open **Search Unsplash** again → search → click any photo → **nothing happens**, dialog stays open, no tile added.
4. Every subsequent open behaves the same until the page is reloaded.

**Expected**: each pick adds an image tile and closes the dialog, repeatably.
**Actual**: only the first pick per page load works; later picks are silently ignored.
**Reliability**: every time, deterministic. Independent of live API vs. sample pool (same pick handler). Resets only on full remount (page reload / route away and back).
**Location**: `src/modules/vision/components/UnsplashSearchDialog.tsx:95` (the `pickLock` ref) and `:187-194` (`handlePick`), with the reset wired at `:210-213`.

## Root cause
**Class**: logic error (component lifecycle / stale ref).

**Cause**: `handlePick` sets `pickLock.current = true` on the first pick to guard against a double-activate firing `onPick` twice (`UnsplashSearchDialog.tsx:187-189`). The lock is only ever cleared in the `Dialog` `onOpenChange` handler's `else` branch, which runs "when the dialog opens" (`:210-213`). But this dialog is **fully controlled** — the parent opens it with `setSearchOpen(true)` from the Add menu (`VisionBoardPage.tsx:161`) and closes it with `setSearchOpen(false)` inside `handlePickUnsplash` after a pick (`VisionBoardPage.tsx:154`). Radix `onOpenChange` fires only for the dialog's *own* close affordances (Escape, the X, overlay click) — it is **not** called when the parent flips the `open` prop. There is no `DialogTrigger`. So `onOpenChange(true)` never fires in the real app, the `else` branch never runs, and `pickLock.current` stays `true` for the life of the mounted component. Every pick after the first hits `if (pickLock.current) return` and no-ops.

The `UnsplashSearchDialog` function component stays mounted across open/close cycles (the parent always renders it at `VisionBoardPage.tsx:364`), so the ref persists.

**Evidence**:
- `src/modules/vision/components/UnsplashSearchDialog.tsx:95` — `const pickLock = useRef(false)` persists across close/reopen because the component never unmounts.
- `src/modules/vision/components/UnsplashSearchDialog.tsx:188` — `if (pickLock.current) return` swallows the 2nd+ pick.
- `src/modules/vision/components/UnsplashSearchDialog.tsx:206-214` — reset (`pickLock.current = false`) and `resetToClosed()` both hang off `onOpenChange`, which the controlled open/close path never triggers.
- `src/modules/vision/components/VisionBoardPage.tsx:154` / `:161` — open and post-pick close are both programmatic (`setSearchOpen`), bypassing `onOpenChange`.
- Spec (intent): `docs/modules/vision.md` — the board supports adding multiple image tiles from Unsplash; nothing says the picker is single-use.

Same-root-cause side effect: `resetToClosed()` is also skipped on the programmatic (post-pick) close, so `query` and `photos` state linger and a stale search re-runs on the next open.

## Fix plan
**Change**: Stop routing lifecycle resets through `onOpenChange`; drive them off the `open` prop directly.

In `UnsplashSearchDialog.tsx`, add an effect keyed on `open`:
```ts
useEffect(() => {
  if (open) {
    pickLock.current = false
    setApiKey(getUnsplashKey())
  } else {
    resetToClosed()
  }
}, [open])
```
Then simplify the `Dialog`'s `onOpenChange` to just `onOpenChange={onOpenChange}` (or keep it calling `onOpenChange(o)` only) — the effect now owns the reset for both the controlled and the affordance-driven paths. Keep `handlePick`'s `pickLock` guard as-is; it still protects against a same-tick double-click, it just gets reliably cleared on every reopen now.

Watch: `resetToClosed` is defined after this effect in source order — it's a stable function expression referenced at call time, fine, but if lint flags exhaustive-deps, wrap `resetToClosed` in `useCallback` or inline the reset into the effect.

**Spec impact**: none — this restores the intended behavior.

## Regression scope
- `pickLock` / double-pick guard: verify a fast double-click on one photo still adds exactly one tile (the guard clears only on reopen, so within a single open it still holds). Story: `UnsplashSearchDialog.stories.tsx`.
- `setApiKey(getUnsplashKey())` on open: must be preserved — it picks up a key saved elsewhere between opens. The new effect keeps it.
- `resetToClosed()` now also runs on programmatic close: confirm the next open starts with an empty query and no stale grid (this is an improvement, but check the samples-only and key-panel states re-render cleanly).
- `onOpenChange` consumers: parent passes `setSearchOpen` directly (`VisionBoardPage.tsx:364`); the X / Escape path still needs to propagate `o` up so `searchOpen` goes false. Keep `onOpenChange(o)` being called.
- Other callers of `addImage`: `VisionBoardPage.tsx:134` (upload path) — unaffected, different entry point.
- Related edge cases: none new. The upload and Unsplash paths both funnel through `useVision.addImage` which is sound.

## Routing
| Step | Skill / action | Target | What |
|------|----------------|--------|------|
| 1 | (direct edit) | `src/modules/vision/components/UnsplashSearchDialog.tsx:95-213` | now: `pickLock` + `resetToClosed` cleared only via `onOpenChange` (never fires on controlled open); change to: an `useEffect([open])` that clears `pickLock.current`, refreshes `apiKey`, and calls `resetToClosed()` on close; why: controlled dialog never triggers `onOpenChange` on open, so the lock is permanent after pick 1 |
| 2 | (verify) | `UnsplashSearchDialog.stories.tsx` + manual | double-click one photo adds one tile; reopen → pick again works; Escape-close still closes |

No `proto-harden` / `proto-polish` needed — this is a pure logic fix.

## Hand-off
**Fixed and verified in this pass.**
- `src/modules/vision/components/UnsplashSearchDialog.tsx`: `resetToClosed` is now a `useCallback`; a new `useEffect([open, resetToClosed])` clears `pickLock.current`, refreshes `apiKey` on open, and calls `resetToClosed()` on close. The `Dialog`'s `onOpenChange` is now just `onOpenChange={onOpenChange}` — the effect owns every reset, on both the controlled and the affordance-driven close path.
- Regression test added: `UnsplashSearchDialog.stories.tsx` → `PicksRepeatedlyWhenParentControlsOpen` — a parent-controlled harness that opens, picks, closes, reopens, picks again, and asserts two picks land. Verified it **fails on the pre-fix code** (stops at "Picks: 1") and passes after.
- Full suite: `lint` clean, `tsc` clean, 106 story tests pass, `npm run build` succeeds.
