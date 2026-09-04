# Vision

## Vision

Vision is the picture of the future for a Path — a Notion-like board of short
text notes and photo tiles, not one long document written in a single sitting.
The Owner drops in small fragments (how they want to feel, small things they
want) and photos (their own or pulled from Unsplash) whenever inspiration
hits, in any order. There's no "finish writing your vision" moment — the
board is always editable, grows over the life of the Path, and can be
exported as a single markdown document when the Owner wants to read it as one
piece (e.g. to print, or paste elsewhere).

It sits alongside the core value loop (capture → triage → do → log wins)
rather than inside it — it's not something the Owner touches daily, but it's
what the daily Actions are *for*. The Path overview shows a short Vision
summary so that connection stays visible without opening the full board.

## User Flows

### Open the Vision board

1. Owner opens a Path overview → sees a Vision summary card (first note or
   two, a strip of image thumbnails) with an "Open Vision board" link.
2. Owner clicks through → sees the full board: an ordered grid mixing note
   tiles and image tiles.
3. If this is the first time the Owner touches Vision for this Path, the
   Vision doesn't exist yet — it's created lazily on the first tile added
   (see Edge Cases).

### Add a note

1. Owner clicks the board's "+ Add" control → a small menu: "Add note" /
   "Upload image" / "Search Unsplash".
2. Picks "Add note" → an inline text tile opens in edit mode at the end of
   the board.
3. Types a short fragment, confirms (blur or explicit "Done") → tile is
   saved and rendered as a note card among the others.
4. Owner can click any existing note tile to edit it in place, or delete it
   from its tile menu.

### Upload an image

1. From the "+ Add" menu, picks "Upload image".
2. Native file picker opens → Owner selects a local image file.
3. Image is read and stored (as a data URL, since this prototype has no file
   server), appended as a new tile at the end of the board.

### Search and add from Unsplash

1. From the "+ Add" menu, picks "Search Unsplash" → a search panel opens
   with a text field and a results grid.
2. Owner types a query → results populate (see Decisions: the prototype
   mocks this against a bundled placeholder photo set — no live network
   call or API key needed to use the flow).
3. Owner clicks a result → it's added as an image tile at the end of the
   board, carrying its Unsplash attribution (photographer name, linked back
   in the export).
4. Owner can close the search panel without picking anything — no tile is
   added.

### Reorder the board

1. Owner drags a tile by its drag handle to a new position — notes and
   images reorder freely together, there's no separate ordering per type.
2. Keyboard-accessible alternative: each tile's overflow menu has "Move up"
   / "Move down", for Owners not using a mouse (WCAG AAA — dragging alone is
   never the only way to reorder). Same pattern already used for Achievement
   and Goal reordering.

### Export the Vision

1. Owner clicks "Export" on the board.
2. Tiles merge, in board order, into a single markdown document — notes as
   paragraphs, images as `![]()` markdown image tags with the Unsplash
   photographer credit as a caption line where applicable.
3. The file downloads immediately as `[path-name]-vision.md` — no
   intermediate preview screen. (Prototype default, chosen to match the
   board's own "keep it lightweight" spirit; revisit if user testing wants a
   preview.)

## Screens (rough)

- **Vision board** (`/paths/:pathId/vision`): the main surface. Ordered grid
  of note + image tiles, "+ Add" control, "Export" action. Empty state when
  no tiles exist yet.
- **Unsplash search panel**: opens over/beside the board (dialog or side
  panel) — query field + results grid. Doesn't navigate away from the board.
- **Vision summary** (embedded in Path overview, not its own route): first
  note(s) + thumbnail strip, "Open Vision board" link. Read-only here.

## Actions

| Action | Description | Entity | Notes |
|--------|------------|--------|-------|
| Open Vision board | Full board for a Path | Vision | Created lazily on first tile add |
| Add note | New short text tile | VisionNote | Inline edit on creation |
| Edit note | Change text in place | VisionNote | |
| Delete note | Remove tile | VisionNote | |
| Upload image | Add tile from local file | VisionImage | Stored as data URL in this prototype |
| Search Unsplash | Query + pick a result to add | VisionImage | Mocked against a bundled placeholder set (ADR 0016) |
| Remove image | Delete tile | VisionImage | |
| Reorder tile | Drag handle or Move up/down | VisionNote / VisionImage | Notes and images share one order |
| Export Vision | Merge board into one markdown file, download | Vision | No preview step |

## Edge Cases

(Rough during detailing; the systematic sweep lives in
`docs/modules/vision-edgecases.md` — all 10 gaps found there are closed as of
`proto-harden`.)

- **Empty board**: no notes or images yet → empty state prompting the first
  add (with the Add menu built in), not a blank grid.
- **Unsplash search, no results**: query matches nothing in the placeholder
  set → "no results" message, search field stays open to retry.
- **Very large uploaded image**: local file above 1.5 MB is refused *before*
  reading, with a toast explaining the local-storage budget — one phone
  photo can't blow the quota and stop the app from persisting. (Was
  "flagged, not solved" until `proto-harden`.)
- **Non-image upload**: a file that isn't an image (picker switched to "all
  files") is refused with a toast; a failed file read shows an error toast
  instead of doing nothing.
- **Export with zero tiles**: Export is hidden when the board is empty
  rather than downloading an empty file.
- **Deleting the last tile**: board returns to its empty state, doesn't
  error. Single-click delete stays — the Undo toast is the safety net, the
  fragment-sized counterpart of Goal's confirm dialog.
- **No-op mutations**: dropping a tile in place or deleting an
  already-gone tile shows no toast and no Undo — feedback is always true.
- **Very long note**: clamped to six lines on the board; the full text stays
  in storage and opens on click-to-edit.
- **Corrupt stored Vision data**: the recovery screen shows on the board
  *and* on the Path overview, not just where the corruption is discovered.

## Integration Points

- **paths**: one Vision per Path (confirmed — ADR 0016); Path overview
  embeds the Vision summary and links to the full board. Deleting a Path
  cascade-deletes its Vision.
- **app-shell**: none required for the prototype — Unsplash search is
  mocked locally, so no live settings/API-key screen is needed yet (see ADR
  0016). Revisit if/when a real Unsplash integration replaces the mock.
