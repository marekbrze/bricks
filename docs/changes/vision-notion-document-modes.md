# Feature: Vision as a Notion-style document with view/edit modes

## Type
Feature (planned by proto-feature)

## User goal
The Vision board should read and feel like a Notion page, not a card wall.
On desktop the 3-column tile grid makes the Vision a mosaic; the Owner wants
their vision to read like an article — blocks stacked one under another on a
reading measure — with a separate editing mode instead of everything being
editable all the time.

## MVP scope
- **Single column everywhere**: tiles stack vertically at the DESIGN.md prose
  measure (65–75ch) on all breakpoints. The `sm:grid-cols-2 lg:grid-cols-3`
  grid goes away.
- **View mode (default)**: the board renders as an article — notes as prose
  paragraphs, images as figures with their attribution caption, achievements
  as to-do checklist rows. No drag handles, no per-tile menus, no inline
  text editing. Achievement checkboxes stay tickable in place (ADR 0037 —
  "it came true" happens while reading).
- **Edit mode**: the same single-column stack, each block as a card with the
  editing affordances — drag handle, Move up/down + Delete menu, click-to-edit
  notes/achievements, "+ Add" menu, and the new-note / new-achievement inline
  forms at the end of the stack.
- **Mode toggle** in the page header: Edit → (edit mode) → Done. Ephemeral
  component state; view mode is the default on every visit.
- **Archived Paths**: stay in view mode, read-only as today — the Edit toggle
  is hidden entirely.
- **Empty board**: keeps its Add menu; picking an add action enters edit mode
  with that draft form open.

Deferred to "Later":
- Hover-revealed chrome / per-block "+" inserts between blocks (full Notion
  editing grammar).
- Drag-to-reorder in view mode, section headers, block-level commenting.

## Impact map
- **New module?**: no — extends `vision`.
- **Modules affected**: `vision` only (board page + tile components). The Path
  overview's Vision summary is untouched — it reads the same data.
- **Cross-module integration**: none — no entity, storage, or route changes.
- **Shared-doc additions**: ACTIONS.md (Enter/finish editing Vision),
  GLOSSARY.md (`Wizja` entry reframed: authored as tiles, *reads* as one
  document), `docs/modules/vision.md` (flows + screens re-specified around the
  two modes).

## Per-module changes

### vision
- **Data**: none. Tiles remain one flat ordered list of note / image /
  achievement tiles; view mode is a different rendering of the same order,
  not a re-structure. Mode itself is ephemeral UI state (not persisted).
- **Actions**: new `Enter edit mode` / `Finish editing` (Owner) — gates every
  mutating tile action except achievement ticking, which stays available in
  view mode.
- **Screens & flows**: `/paths/:pathId/vision` — same route, two renderings:
  - **View (default)**: document column (`max-w-prose`, centred) — notes as
    un-chromed prose (full text, no clamp — an article reads in full; the
    single column cannot blow out a grid row), images as full-measure figures
    with the photographer caption, achievements as checklist rows (win wash +
    strike-through + date when achieved). Export stays in the header.
  - **Edit**: same column, blocks as cards with drag handle + overflow menu
    (Move up / Move down / Delete), click-to-edit inline drafts, "+ Add" menu
    in the header, inline new-note / new-achievement forms at the end.
  - Drag & drop and Move up/down exist only in edit mode; the keyboard
    alternative (menu items) therefore also only in edit mode.
- **States**: no new empty/error states. Empty board unchanged (its Add menu
  now routes through edit mode); corrupt-data and archived read-only states
  render in view mode.
- **Edge cases**: mode switch while a tile draft is open — blur commits the
  draft (existing behavior); no-op drag/drop and Undo toasts unchanged;
  read-only Path never offers edit; board with only images (or only
  achievements) reads fine as an article — no section required.
- **Design**: obeys the committed direction (DESIGN.md) — prose measure
  65–75ch is already specified for vision notes; granite canvas, hairline
  borders, no side-stripe accents; photos remain the one place color appears.
  View mode drops card chrome from notes (prose on the canvas), edit mode
  keeps the white-card vocabulary.

## Routing — which proto skill builds what
| Step | Skill | Target | What it does |
|------|-------|--------|--------------|
| 1 | (direct edit) | vision | Spec + shared docs, then the re-layout itself — a re-rendering of an existing hardened screen with no new entities or states; the full detail→lofi→edgecases→harden chain adds nothing here |
| 2 | (direct edit) | vision | Storybook stories: view-mode variants + a new edit-mode story; verify a11y (checkbox labels, menu labels unchanged) |
| 3 | proto-polish | vision | Only if the re-layout drifts from DESIGN.md — contrast/measure/state sweep on the new surfaces |

## Residual — direct edits not covered by a proto skill
- **`src/modules/vision/components/VisionBoardPage.tsx:203`** — now: one
  `<ul className="grid ... sm:grid-cols-2 lg:grid-cols-3">` rendering
  `VisionTileCard` for every tile plus the inline draft forms. change to: a
  `mode` state (`'view' | 'edit'`, default `'view'`); view renders
  `VisionBlock`s in a prose column, edit renders the existing card stack +
  draft forms; header gains the Edit/Done toggle; empty state's Add actions
  switch to edit mode first.
- **new `src/modules/vision/components/VisionBlock.tsx`** — now: does not
  exist. change to: view-mode block — note prose (full, `whitespace-pre-wrap`),
  image figure with attribution caption, achievement checklist row with a
  live checkbox (win wash / strike-through / date when achieved). why: view
  and edit renderings share almost nothing; two small components beat one
  mode-branched monster.
- **`src/modules/vision/components/VisionTileCard.tsx`** — now: card assumes
  grid context; note clamp `NOTE_CLAMP` + "click to read" title. change to:
  keep as the edit-mode card (drag, menu, click-to-edit), drop the display
  clamp (single column reads full text in both modes), keep all a11y labels.
- **`docs/modules/vision.md`, `docs/ACTIONS.md`, `docs/GLOSSARY.md`** —
  re-specify flows/screens around the two modes; add the editing-mode action;
  reframe `Wizja` ("not one long document" is about authoring — view mode
  *reads* as one).
- **`src/modules/vision/components/VisionBoardPage.stories.tsx`** — update
  stories for view-by-default, add `EditMode`; `LongNoteClamped` becomes the
  article-reads-in-full case.

## Later (deferred)
- Between-block insert affordances, section grouping, persisted last-used mode.

## Hand-off
The residual direct edits above are the implementation — apply in order
(docs → page → block component → card tweaks → stories), then verify with
`pnpm lint`, `pnpm build`, and the Storybook stories.
