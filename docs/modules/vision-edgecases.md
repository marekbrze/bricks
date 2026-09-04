# Vision — Edge Cases

## Coverage

- **Spec already captured** (`docs/modules/vision.md` → Edge Cases): empty
  board; Unsplash search with no results; very large uploaded image (flagged,
  "a real build would need a size guard"); Export with zero tiles; deleting
  the last tile returns to the empty state.
- **Already handled in code**:
  - Empty board → `VisionBoardPage.tsx` (dedicated empty state with the same
    `AddTileMenu`, so the first add is reachable from the state itself).
  - Unsplash no results → `UnsplashSearchDialog.tsx` ("No photos match …"
    message; query stays editable to retry). Empty query returns the full
    curated pool (browse-before-search).
  - Export with zero tiles → `VisionBoardPage.tsx` (Export button only
    rendered when `tiles.length > 0` — no empty-file download).
  - Deleting the last tile → plain list mutation; the next render hits the
    empty state. No special casing needed.
  - Unknown/deleted `pathId` in the URL → `PathNotFound` recovery screen
    (`VisionBoardPage.tsx`), mirroring the paths module.
  - Archived Path → read-only board: banner with Unarchive CTA, Add menu
    hidden, tile menus/drag/note editing disabled — Export stays available
    (`VisionBoardPage.tsx`).
  - Corrupt `visions` value → `VisionDataUnreadable` recovery screen on the
    board page; corrupt `paths` → `PathsDataUnreadable` (`VisionBoardPage.tsx:38-39`).
  - Path deleted while a Vision exists → `useVision` self-heal cascade-removes
    orphaned Visions (same pattern as `useGoals`/`useActions`).
  - Write failures (quota, private mode) → shared `useLocalStorageState` keeps
    the new value in memory and reports to `storage-health`; the app-wide
    `StorageHealthBanner` surfaces "changes aren't being saved" on every screen.
  - Cancelled file picker → `handleUploadFile(undefined)` no-ops; input value
    is reset so picking the same file twice still fires `onChange`.
  - Cancelling the Unsplash dialog → closes with no tile added; the query is
    reset for the next open (`UnsplashSearchDialog.tsx`).
  - Empty note submit → Save disabled while the draft is blank; `addNote` /
    `editNote` trim and ignore blank text (`use-vision.ts`).
  - Clearing a note's text in edit mode and blurring → the old text returns,
    edit mode closes silently (deliberate: delete is the explicit way to
    remove a tile; a blank save would otherwise destroy content on a stray
    keystroke). Documented here as the accepted behavior.
  - Reorder target out of range → `reorderTile` clamps into `[0, tiles.length-1]`.
  - A Path's first tile → the Vision row itself is created lazily
    (`mutateTiles`), so there is no "must create a Vision first" step to get wrong.
- **New gaps found**: 10
- **By severity**: 🔴 1 · 🟡 6 · 🟢 3
- **Hardened (proto-harden, 2026-09-04)**: 10 closed, 0 deferred — see "Hardening status" below.

## Inventory

| # | Severity | Category | Edge case | Behavior today | Suggested behavior | Where |
|---|----------|----------|-----------|----------------|--------------------|-------|
| 1 | 🔴 | Data states / Prototype-specific | One large upload silently breaks persistence for the whole app | An uploaded image is stored as a data URL. A phone photo (2–8 MB) becomes a ~3–11 MB base64 string — over the ~5 MB `localStorage` budget on its own. `useLocalStorageState` catches the quota throw and reports it, so the global banner appears, but from the Owner's view: the tile looks added, every *other* module also stops persisting from that moment, and after a reload the tile is gone while everything touched since the failed write is lost too. The spec explicitly flagged this ("a real build would need a size guard") and shipped without one. | Guard the picked file *before* reading it: reject files above a prototype-safe limit (e.g. 1.5 MB) with a toast explaining the LocalStorage budget, so the quota can't be blown in one step and the banner stays reserved for genuine browser-level failure. | `src/modules/vision/components/VisionBoardPage.tsx` (`handleUploadFile`) |
| 2 | 🟡 | Forms & input | A non-image file can still be turned into a tile | `accept="image/*"` only filters the picker's default view — on most OSes the Owner can switch to "All files" and pick a PDF/text/binary. `FileReader.readAsDataURL` happily encodes it; the board then renders a broken `<img>` and the Export carries a garbage data URL. | Check `file.type.startsWith('image/')` before reading; refuse anything else with a toast naming the accepted kinds. | `src/modules/vision/components/VisionBoardPage.tsx` (`handleUploadFile`) |
| 3 | 🟡 | Loading & async | `FileReader.onerror` is unhandled | Only `reader.onload` is wired. If the read fails (unreadable/corrupt file, permission hiccup), nothing happens at all: the menu has closed, no tile appears, no message — a dead interaction the Owner can't diagnose. | Add `reader.onerror` → error toast ("couldn't read that file"), keeping the Owner in control of the retry. | `src/modules/vision/components/VisionBoardPage.tsx` (`handleUploadFile`) |
| 4 | 🟡 | Feedback / integrity | Toasts fire for mutations that changed nothing | Dropping a tile back onto its own position still shows "Moved" + an Undo that restores an identical snapshot (from #4's sibling `handleReorder`), and `handleDelete` always toasts even if the tile id no longer resolves. The Owner is told lies about what happened. | `reorderTile`/`deleteTile` should report whether anything actually changed; the caller toasts only on a real change. | `src/modules/vision/hooks/use-vision.ts` (`reorderTile`, `deleteTile`), `VisionBoardPage.tsx` (`handleReorder`, `handleDelete`, `handleDropOn`) |
| 5 | 🟡 | Errors / recovery | Corrupt `visions` is invisible on the Path overview | The recovery screen lives on the board page only. `PathOverviewPage` calls `useVision` for the summary card but never checks `dataUnreadable`, so with a corrupt `visions` key the overview shows "No Vision yet — sketch out where this Path is going" — an invitation to type into storage the app has already declared unreadable, and the corruption is only discovered if the Owner happens to open the board. | The overview must route to the same recovery path as the board: check `visionUnreadable` where the summary data is read, and show the reset screen (or at minimum a pointer to it) instead of the empty state. | `src/modules/paths/components/PathOverviewPage.tsx`, `src/modules/vision/components/VisionSummaryCard.tsx` |
| 6 | 🟡 | Data states | A very long note breaks the board's rhythm | Notes have no length cap and the tile renders the full text (`whitespace-pre-wrap`, no clamp). A pasted 500-word fragment makes one tile several viewport-heights tall, blowing out the grid row and pushing every sibling into whitespace — the "small fragments, not a wall of text" premise of the module degrades silently. | Clamp the *displayed* note (e.g. `line-clamp` with a "show more" affordance or rely on click-to-edit for the full text); keep storage unclamped. A soft character hint in the editor is optional. | `src/modules/vision/components/VisionTileCard.tsx` (note render branch) |
| 7 | 🟡 | Forms & input | Double-activate on an Unsplash result adds it twice | The result button calls `onPick` per click; the dialog only closes via React state, so a double-click (or fast double-activate via keyboard) appends two identical tiles. Nothing dedupes — `addImage` generates a fresh id each call. | Close-and-disable on first pick (ignore re-entrant picks while the dialog is closing), or dedupe consecutive identical picks. | `src/modules/vision/components/UnsplashSearchDialog.tsx` (result `onClick`), `VisionBoardPage.tsx` (`handlePickUnsplash`) |
| 8 | 🟢 | Data states | Export filename mangles non-ASCII names | `visionExportFileName` slugs with `[^a-z0-9]`, so "Życie bez pośpiechu" downloads as `ycie-bez-po-piechu-vision.md` — valid but mangled; a Path named entirely of diacritics falls back to the bare `path`. | Fold-case first: `normalize('NFD')` + strip combining marks before slugging ("życie" → "zycie"). | `src/modules/vision/lib/export-markdown.ts` (`visionExportFileName`) |
| 9 | 🟢 | Accessibility (WCAG 2.2 AAA) | Drag-reorder is invisible to assistive tech | Reordering is native HTML5 drag on the `<li>` plus the keyboard path (Move up/Move down in the tile menu), so the AAA "dragging is never the only way" bar is met. But a drag itself produces no announcement — a screen-reader user co-driving a sighted mouse user hears nothing about the board changing; sighted users also get only the dimmed tile as feedback. | Announce moves via the existing toast (give it a polite `aria-live` / ensure the toast region announces "Moved"), so both the drag and menu paths report the new position. | `src/modules/vision/components/VisionBoardPage.tsx` (`handleReorder`), toast component |
| 10 | 🟢 | State transitions | Tile delete has no confirmation | One click on "Delete" removes the tile; safety rests entirely on the Undo toast. For a Goal this app demands a typed dialog; a Vision tile is a deliberately small fragment, so matching that weight would be overkill — but the asymmetry is a choice worth confirming in testing rather than a bug to fix. | Keep single-click delete *with* the Undo toast (the fragment-sized counterpart of Goal's confirm dialog); revisit only if user testing shows destructive misfires. Documented decision, not a change. | `src/modules/vision/components/VisionTileCard.tsx` (Delete item) |

**Forms & input**: covered above (#2, #3, #7; blank-note handling already in code).

**State transitions**: no further issues — lazy creation, archived read-only
mode, and the delete-last-tile → empty-state transition are all handled (see
Coverage); #10 documents the deliberate delete-confirmation asymmetry.

**Navigation & flow**: no issues found — unknown `pathId` lands on
`PathNotFound`, the back link uses the live Path name, and the board route
replaced the old placeholder wholesale.

**Errors**: covered above (#5); all other unreadable-storage paths already
route to the per-module recovery screens or the global banner.

**Loading & async**: covered above (#3) — the FileReader is the module's only
async step; everything else is synchronous LocalStorage.

**Prototype-specific (LocalStorage)**: covered above (#1) — quota pressure is
unique to `vision` among the modules (it is the only one storing binary-sized
payloads); the generic write-failure plumbing it relies on is already shared.

## Priority list

1. **#1 — Size guard on uploads.** The only gap in this module that destroys
   data beyond the board itself: one phone photo flips the entire app into
   "changes aren't being saved". Everything else on this list is polish
   against that backdrop.
2. **#4 — No more lying toasts.** Cheap, and it keeps the Undo affordance
   trustworthy — the one pattern the whole prototype leans on for safe
   destructive actions.
3. **#5 — Corrupt-data visibility on the overview.** Recovery exists but is
   hidden behind a screen the Owner has no reason to open; the overview
   actively invites writing into storage that can't be read.

## Hand-off to proto-harden

The top-priority gaps a harden pass should implement first:
- Add the upload size guard (#1) together with the file-type check (#2) and
  `reader.onerror` (#3) — they all live in the same `handleUploadFile` path.
- Make `reorderTile`/`deleteTile` report no-ops and silence their toasts (#4).
- Route the Path overview to Vision's recovery screen when `visions` is
  corrupt (#5).
- Real but lower-impact: note clamp (#6), Unsplash double-pick (#7), export
  filename fold-casing (#8), toast announcements for reorder (#9). #10 is a
  documented decision, no code change.
