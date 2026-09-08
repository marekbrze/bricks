# Design-system alignment: bordered elements sit on `bg-card`

## Type
Designer directive (2026-09-08), applied as a one-rule sweep. Not a feature.

## The directive
"Elementy które mają bordery powinny wyróżniać się od tła — najlepiej jeśli
mają białe tło" (elements with borders must stand out from the background —
ideally white). Named examples: Actions on the Goal progress view, elements on
the Path views. "Jest dużo elementów które powinny się wyróżnić" — the problem
was app-wide, not local.

## Root cause
Rows and framed boxes used `bg-background` — the *same token as the page
canvas* — so the only separation was the hairline (`--border` 0.91 on canvas
0.985 in light): nearly invisible, and in dark mode the box was literally the
same color as the page. Meanwhile `Card`, `GoalGroup`, `PathActionsBody` and
`VisionBoardPage` tiles already used `bg-card` — the vocabulary existed and
was under-applied.

## The rule (now in docs/DESIGN.md → Color → Surfaces)
**A drawn box is a card.** Anything that draws its own border sits on
`bg-card` (light: pure white — the requested "białe tło"; dark: 0.21, the one
elevation step above canvas 0.16). Never `bg-background` on a bordered box.
Dashed borders keep signalling "empty/placeholder" via the dash, not via a
transparent fill. Exceptions: full-width chrome bars (`AppHeader`,
`BottomTabs`), semantic tints (win wash `bg-win-soft`, muted notice banners
`bg-muted/40`, destructive error boxes, `Kbd`), and overlays already on
`bg-popover`.

## Applied (bg-background / transparent → bg-card)
- **Primitives**: `button` outline variant, `checkbox`, `input`;
  `dialog`/`alert-dialog` popups `bg-background` → `bg-popover` (they are
  floating boxes — the DESIGN.md elevation scale puts them at popover 0.23,
  closest to the viewer; `bg-background` made dark-mode dialogs sink *below*
  the page).
- **Rows** (the named examples): `ActionRowItem` (Goal progress + Actions
  views), `GoalRow` (Goal trees on Path views), today `ActionRow`,
  `InboxGroup` rows, `ReviewAbandonedPage` rows, `AddToTodayDialog` options.
- **Containers**: read-only Action list (Goal progress), Inbox list,
  Log history, Archived Paths list, `MoveActionDialog`/`AssignPicker`
  listboxes, `WinBalance` (the Log's central block).
- **Dashed frames**: `QuickAddActionRow`, `InboxGroup`, both "Unassigned"
  sections, every empty-state section (`TodayPage` ×2, `SchedulePage`,
  `ReviewAbandonedPage`, `ActionsPage` ×2, `PathActionsPage` ×2,
  `TriagePage`, `InboxPage`, `GoalTreePage`, `PathsPage`,
  `ArchivedPathsPage`, `LogPage` ×2, `GoalProgressPage` sub-Goals,
  `today/PathSection`, `ModuleStubSection`, `VisionSummaryCard`,
  `VisionBoardPage`), plus `VisionSummaryCard`'s snippet box and
  `DataSyncPage`'s push/pull choice buttons + interaction box.
- **Textareas**: `GoalDialog` description, `VisionTileCard` note editor,
  `VisionBoardPage` new-note editor.

## Left alone (deliberately)
`AppHeader`/`BottomTabs` (canvas-toned chrome bars), tinted notice banners
(`bg-muted/40` archived-Path notices), `bg-muted/40` hint boxes
(`UnsplashSearchDialog`), error boxes, `Kbd`, `WinKindBadges.stories` demo
frame, `TriageCard`'s inner picker frame (it already sits on a white `Card`).
