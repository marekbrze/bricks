# Feature: Achievements as Vision tiles

## Type
Feature (planned by proto-feature)

## User goal
"Move the achievements function into Vision — an achievement is just a separate
type of element on the Vision board, one you can achieve." The Owner manages
their "along the way" list on the Vision board itself, next to the notes and
photos that describe the same future, instead of in a separate checklist
section on the Path overview.

## MVP scope
- `Achievement` becomes a third Vision tile type (`type: 'achievement'`) with
  `title`, `state: 'open' | 'achieved'`, `achievedOn: string | null` — stored
  inside the Path's Vision, reordered with all other tiles in the one shared
  board order.
- The Vision board is the single home for achievements: add via the Add menu,
  tick/untick in place (reversible, original date kept on re-tick), edit title
  inline, delete from the tile menu (Undo toast), reorder by drag or Move
  up/down — the same vocabulary every other tile has.
- The Path overview's **Achievements section is removed**; the Path tab bar is
  unchanged (Vision is where achievements live now). The Vision summary card
  on the overview gains an `X/Y achievements` line so the hub still reports
  progress at a glance.
- Counts move with the data: `PathCard`, `ArchivedPathsPage`, and the
  Delete-Path cascade summary all read achievement tiles from the Vision.
- Creating a Path can still seed achievements — the New Path dialog keeps its
  rows, and the created titles land on the new Path's Vision as achievement
  tiles (the Vision is created eagerly when titles are given).
- One-time idempotent migration: legacy `Path.achievements` embedded in the
  `paths` storage key are converted to achievement tiles on that Path's Vision
  and stripped from the Path.
- Export includes achievements as markdown task-list items.

Deferred to "Later":
- Feeding `WinLog` / `ContributionGraph` from achieved achievement tiles
  (the docs claimed this fed WinLog, but the code never did — the doc drift is
  fixed, the integration is a separate product decision).
- Input length limits on achievement titles (paths-edgecases #13, unchanged).
- Distinct "all achieved" celebration treatment on the board (the counter
  treatment moves as-is; a board-level treatment is new-design territory).

## Impact map
- **New module?**: no — extends `vision`, trims `paths`.
- **Modules affected**:
  - `vision` (primary) — new tile type, board UI, export, summary counts.
  - `paths` (trim) — loses the `Achievement` entity, the overview section, the
    achievement mutations in `usePaths`, and the seed write in `createPath`.
  - `capture-triage` (thin) — `PathPicker`'s inline New Path flow must seed
    the created titles onto the new Path's Vision via `useVision`.
- **Cross-module integration**: the New Path flow now writes two stores —
  `paths` (the Path) and `visions` (the seeded tiles) — orchestrated by the
  calling component (`PathsPage`, `PathPicker`), not by `usePaths`, which must
  not grow a dependency on `vision`. The existing `useVision` self-heal
  (orphaned Vision removal on Path delete) already covers cascade-delete.
- **Shared-doc additions**: ACTIONS.md (Achievement actions move under Vision;
  Path's "Add Achievements on create" note updated), ENTITY_MAP.md (ERD edge
  `PATH ||--o{ ACHIEVEMENT` replaced by `VISION ||--o{ VISION_ACHIEVEMENT_TILE`;
  Achievement entity rewritten as a Vision tile), GLOSSARY.md (Achievement now
  "a Vision tile type"), MODULES.md (paths/vision descriptions, entity lists,
  integration map).

## Per-module changes

### vision
- **Data**: `VisionAchievementTile { id, type: 'achievement', title, state:
  'open' | 'achieved', achievedOn: string | null }` added to the `VisionTile`
  union in `src/modules/vision/types/vision.ts:40`; notes and images keep
  their shape; one shared board order stays.
- **Actions**: add achievement tile (`useVision.addAchievement`), edit title
  (`editAchievement`), toggle achieved/un-achieved (`setAchievementAchieved` —
  reversible, preserves the original `achievedOn` on re-tick, same rule
  `use-paths.ts:203` implements today), delete + reorder via the existing
  generic `deleteTile` / `reorderTile`; `addAchievements(pathId, titles)` for
  the Path-creation seed; `achievementCountsForPath` reader for summaries.
- **Screens & flows**: board (`/paths/:pathId/vision`) — Add menu gains "Add
  achievement"; new tile card branch with checkbox, title, achieved date, done
  treatment (`--win-soft` per DESIGN.md "done row wash, achievement states");
  export renders task-list items; Vision summary card (embedded in Path
  overview) gains the `X/Y achievements` line. No new routes.
- **States**: empty board unchanged (achievements are just tiles); archived
  Path renders tiles read-only (checkbox disabled, no edit/delete/reorder) —
  the existing `readOnly` pipeline covers it once the new branch respects it.
- **Edge cases**: un-tick keeps the original date (already-decided behavior,
  ported); re-ordering/dragging treats achievement tiles like any other;
  export with zero tiles still hides Export; migration is idempotent
  (deterministic tile ids from legacy ids, skip-if-present).
- **Design**: the new tile uses the existing tile vocabulary + `--win-soft`
  win tint; no new tokens. Storybook coverage: board with achievements,
  all-achieved, archived read-only.

### paths
- **Data**: `Achievement` type and `Path.achievements` removed from
  `src/modules/paths/types/path.ts`; `PathCascadeCounts.achievements` stays
  (callers source it from `useVision`).
- **Actions**: `usePaths` loses `addAchievement` / `editAchievement` /
  `setAchievementState` / `deleteAchievement`; `createPath(name)` drops its
  `achievementTitles` parameter and returns the new id as before.
- **Screens & flows**: Path overview — `AchievementsSection` removed
  (`src/modules/paths/components/PathOverviewPage.tsx:114`); New Path dialog
  keeps its rows but the titles are handed to the caller
  (`src/modules/paths/components/PathsPage.tsx:138`,
  `src/modules/capture-triage/components/PathPicker.tsx:66`), which seeds them
  onto the new Vision; `PathCard.tsx:31` and `ArchivedPathsPage.tsx:45` read
  counts via `useVision().achievementCountsForPath`.
- **States**: none new.
- **Edge cases**: cascade-delete of achievement tiles is already covered by
  `useVision`'s orphan-Vision self-heal; the delete-dialog count simply reads
  the other module.
- **Design**: `AchievementsSection` and its stories are deleted; the counter's
  done treatment moves to the board tile vocabulary.

### capture-triage
- **Data**: none.
- **Actions**: `PathPicker`'s inline create passes seed titles to `useVision`
  after `createPath` (cross-module hook usage is the established pattern —
  Path overview already mounts `useVision`).
- **Screens & flows**: none.

## Routing — which proto skill builds what
| Step | Skill | Target | What it does |
|------|-------|--------|--------------|
| 1 | proto-detail | vision | spec update: tile type, flows, edge cases, shared docs |
| 2 | (direct edit) | — | the implementation below — a data move + one tile type in an already-designed module; no new screens, so the residual plan carries it |
| 3 | proto-design → polish | vision | the new tile already obeys DESIGN.md tokens; verified in the implementation pass |

## Residual — direct edits not covered by a proto skill
- **`src/modules/vision/types/vision.ts`** — add `VisionAchievementTile`, extend the union.
- **`src/modules/vision/hooks/use-vision.ts`** — achievement mutations + counts reader + one-time migration effect (legacy `paths[].achievements` → tiles, strip, idempotent by tile id).
- **`src/modules/vision/components/AddTileMenu.tsx`** — "Add achievement" menu item.
- **`src/modules/vision/components/VisionTileCard.tsx`** — achievement branch (checkbox, inline title edit, date, done treatment, shared tile menu).
- **`src/modules/vision/components/VisionBoardPage.tsx`** — add-achievement draft flow, wire new callbacks, export unchanged.
- **`src/modules/vision/lib/export-markdown.ts`** — task-list items for achievement tiles.
- **`src/modules/vision/components/VisionSummaryCard.tsx`** — `X/Y achievements` line.
- **`src/modules/paths/types/path.ts`** — remove `Achievement` + `Path.achievements`.
- **`src/modules/paths/hooks/use-paths.ts`** — remove the Achievement section; `createPath(name)`.
- **`src/modules/paths/components/AchievementsSection.tsx` (+ stories)** — delete.
- **`src/modules/paths/components/PathOverviewPage.tsx`** — drop the section + the four achievement callbacks.
- **`src/modules/paths/components/NewPathDialog.tsx`** — keep rows; copy updated ("they'll land on this Path's Vision board").
- **`src/modules/paths/components/PathsPage.tsx`**, **`src/modules/capture-triage/components/PathPicker.tsx`** — seed via `useVision.addAchievements` after `createPath`.
- **`src/modules/paths/components/PathCard.tsx`**, **`ArchivedPathsPage.tsx`**, **`DeletePathDialog` callers** — counts from `useVision`.
- **Mocks/scenarios** — `MOCK_PATHS` lose `achievements`; `MOCK_VISIONS` gain achievement tiles (seed dates preserved); `mockVisionTileCount` updated to match.
- **Stories** — PathOverviewPage / PathDialogs / ActionsPage stories updated; VisionBoardPage stories gain achievement coverage.

## Shared-doc updates (done in the same pass)
- **MODULES.md** — paths: drop Achievements from description/entities/actions; vision: add the achievement tile type to description/entities/actions; integration map edge; prototyping-order note.
- **ENTITY_MAP.md** — ERD edge + relationship notes + Achievement rewritten as `VisionAchievementTile` under Vision.
- **ACTIONS.md** — Achievement action table moves under the Vision section; Path's "Add Achievements on create" row updated; the false "Feeds WinLog" note removed.
- **GLOSSARY.md** — Achievement entry: "a Vision tile type you can achieve".
- **docs/modules/paths.md**, **docs/modules/vision.md** — flows, screens, actions tables, edge cases.
- **docs/modules/paths-edgecases.md** — rows 5/11/12/13/15/18 note the move.
- **docs/adr/0037-achievements-are-vision-tiles.md** — the decision record.

## Later (deferred)
- Achievement tiles feeding `WinLog` / `ContributionGraph` (product decision + winlog module change).
- Board-level "all achieved" celebration treatment.
- Achievement title length limits.

## Hand-off
The plan is fully executed by the residual direct edits + spec/doc updates in
this same pass (no proto-detail/lofi run needed — no new screens). This doc is
the record; ADR 0037 is the decision.
