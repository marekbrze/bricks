# Paths

## Vision

`Path` is the container the whole app hangs off — a never-ending life direction
(the sport path, the earnings path), not a project with an end. The `paths` module
owns three things: the **list of Paths** (the entry point to everything), the
**Path overview** (the hub screen that pulls Vision, Goals, Achievements and the
contribution graph into one place), and **Achievements** — the order-independent
"along the way" items ("I can do a pull-up", "muscle-up", "100 push-ups") that
hang directly off a Path and are not tasks.

The mental model has to land here first: a Path is a direction, Achievements are
things you'll be able to do one day (no concrete task required), Goals are the
execution layer, Vision is the picture of the future. Everything else in the app
surfaces *through* the Path overview.

The list is a **card grid** — each card is a rich at-a-glance summary (name, Goal
and Achievement counts, a mini contribution graph, a Vision snippet) so opening
`/paths` already tells the Owner where their energy is going. Archived Paths are
out of the way on their own screen; the main list is only active directions.

## User Flows

### Create a Path

1. User is on `/paths` → clicks **New Path** (primary action, top of the screen).
2. A **single modal** opens: a name field, plus a dynamic list of Achievement text
   rows with **+ add another** and a remove (✕) per row. Vision is not touched here.
3. User types a name, fills one or more Achievement rows (all optional except the
   name), clicks **Create**.
4. Modal closes → the new Path card appears at the **end** of the grid → user lands
   on (or the card links to) the new Path overview.
5. Empty Achievement rows are ignored on submit. Submitting with an empty name is
   blocked (see Edge Cases).

### Browse Paths and open one

1. User opens `/paths` → sees the card grid of active Paths in manual order.
2. Each card shows: name, `N goals · M achievements`, a mini `ContributionGraph`
   for that Path, a short Vision snippet (first note, truncated).
3. User clicks a card → **Path overview** (`/paths/:pathId`).

### Path overview (the hub)

1. User opens `/paths/:pathId` → contextual header with the Path name and a
   **back to Paths** affordance, plus an overflow menu (Rename, Archive, Delete).
2. Sections, top to bottom:
   - **Vision summary** — a condensed read-only view of the Vision board (a few
     notes / thumbnails) + **Open Vision board** → `/paths/:pathId/vision`
     (owned by the `vision` module).
   - **Goals** — the Path's Goal list in priority order, each with its
     days-remaining countdown if it has a deadline + **Open Goals** /
     add-Goal entry → `/paths/:pathId/goals` (owned by the `goals` module).
   - **Achievements** — checklist with an `X/Y achieved` counter (see flow below).
   - **Contribution graph** — the full per-Path `ContributionGraph` (owned by the
     `winlog` module, embedded here).
3. From here the user branches into `vision`, `goals`, or `winlog`; `paths` itself
   only fully owns the Achievements section and the Path-level actions.

### Manage Achievements

1. On the Path overview, the **Achievements** section shows a checklist:
   header `Achievements · 3/8 achieved`, then the items.
2. **Add**: an inline **+ add achievement** row at the bottom — type text, Enter /
   blur commits, stays in `open` state.
3. **Edit**: click the item text → it becomes editable inline → Enter / blur saves.
4. **Mark achieved**: tick the checkbox → state `achieved`, today's date is
   stamped and shown next to the item; it feeds `WinLog` / `ContributionGraph`.
5. **Un-mark**: untick → back to `open`, the date is cleared (mistakes happen —
   this is deliberately reversible).
6. **Delete**: a remove control on the row (hover / focus) → item is gone
   immediately (lightweight; no cascade, no heavy confirm — see Edge Cases).
7. Order is not meaningful — Achievements are order-independent. New items append.

### Reorder Paths

1. On `/paths`, each card has a **drag handle**.
2. User drags a card to a new position → the manual order updates and persists.
3. This order drives the sectioning in the Today view.
4. Keyboard-accessible alternative is required (WCAG 2.2 AAA) — move-up / move-down
   via the card's overflow menu or a roving control.

### Rename a Path

1. Path overview → overflow menu → **Rename** → inline edit or a small dialog with
   the current name prefilled → save.

### Archive / unarchive a Path

1. Path overview → overflow menu → **Archive** → a light confirm ("Archive
   “Sport”? Its contents are kept and you can restore it anytime.") → the Path
   leaves the active grid.
2. `/paths` shows a **View archived** link (footer of the list) → `/paths/archived`.
3. `/paths/archived` lists archived Paths (name + counts, muted) with an
   **Unarchive** action per row → the Path returns to the end of the active order.

### Delete a Path (cascade)

1. Path overview → overflow menu → **Delete** (also reachable from
   `/paths/archived`).
2. A **confirmation dialog with a summary** of exactly what will be destroyed:
   > Delete “Sport”? This permanently deletes: 1 Vision board, 5 Achievements,
   > 3 Goals, 12 Actions. This cannot be undone.
   > [Cancel] [Delete Path]
3. Confirm → the Path and everything under it (Vision, VisionNotes, VisionImages,
   Achievements, Goals, sub-Goals, Actions) is removed → user returns to `/paths`.
4. Counts in the dialog are computed live from the actual contents.

## Screens (rough)

- **Paths list** (`/paths`): primary **New Path** button; responsive **card grid**
  of active Paths (name, `N goals · M achievements`, mini contribution graph,
  Vision snippet, drag handle, overflow menu); **View archived** link at the end.
  Empty state when there are no Paths.
- **New Path modal**: name input + repeatable Achievement rows (+ add another / ✕),
  Cancel / Create. Name required.
- **Path overview** (`/paths/:pathId`): contextual header (name, back, overflow:
  Rename / Archive / Delete); stacked sections — Vision summary (+ open board),
  Goals list (+ open goals), Achievements checklist (inline add/edit/check/delete,
  `X/Y achieved` header), per-Path contribution graph.
- **Archived Paths** (`/paths/archived`): muted list of archived Paths with
  Unarchive / Delete per row; back to `/paths`. Empty state when nothing archived.
- **Delete confirmation dialog**: destructive summary with live counts, Cancel /
  Delete Path.
- **Rename**: inline edit or small dialog.

## Actions

| Action | Description in this module | Entity | Notes |
|--------|---------------------------|--------|-------|
| Create Path | Single modal: name + initial Achievement rows; Vision untouched | `Path` | Name required; empty Achievement rows dropped |
| Rename Path | Overflow menu → inline / small dialog | `Path` | |
| Add Achievements on create | Repeatable rows in the New Path modal | `Achievement` | Seeded in `open` state |
| Reorder Paths | Drag handle on cards + keyboard move-up/down fallback | `Path` | Drives Today view section order |
| Archive Path | Overflow menu → light confirm; contents kept | `Path` | Reversible |
| Unarchive Path | From `/paths/archived`; returns to end of active order | `Path` | |
| Delete Path | Overflow menu / archived list → confirmation dialog with live cascade counts | `Path` | Cascades to Vision, Achievements, Goals, Actions |
| View Path overview | The hub screen: Vision summary + Goals + Achievements + graph | `Path` | Vision / Goals / graph rendered by other modules |
| Add Achievement | Inline **+ add achievement** row on the overview | `Achievement` | Appends; order not meaningful |
| Edit Achievement | Click text → inline edit | `Achievement` | |
| Mark achieved | Tick checkbox → `achieved` + today's date | `Achievement` | Feeds `WinLog` / `ContributionGraph` |
| Un-mark achieved | Untick → `open`, date cleared | `Achievement` | Deliberately reversible |
| Delete Achievement | Row remove control | `Achievement` | Lightweight, no heavy confirm |

No new actions, entities, or glossary terms were discovered in this interview —
everything maps to existing `docs/ACTIONS.md` and `docs/ENTITY_MAP.md`.

## Edge Cases

Captured here as they came up; the systematic audit is `proto-edgecases`.

- **No Paths at all**: `/paths` shows an empty state explaining the Path concept in
  one or two lines + a prominent **Create your first Path**. The rest of the app
  (Today, Inbox, Log) has nothing to group by until a Path exists.
- **Path with no Achievements**: the Achievements section shows its own empty state
  ("Nothing along the way yet") with the inline add row still present. Counter
  reads `0/0` or is hidden.
- **Path with no Goals / empty Vision**: each section renders its own empty state
  and its "add / open" affordance; the overview never looks broken.
- **All Achievements achieved**: counter reads `8/8`; consider a subtle done
  treatment (not blocking).
- **Create Path with empty name**: Create is disabled / shows an inline error;
  never create an unnamed Path.
- **Duplicate Path name**: allowed (personal tool) — no uniqueness constraint, but
  maybe a soft hint.
- **Very long Path or Achievement text**: cards and rows must truncate gracefully;
  no breadcrumbs anywhere (per UI-STRATEGY) so headers wrap rather than clip.
- **Deleting the last active Path**: allowed; drops the user back to the `/paths`
  empty state.
- **Archiving the last active Path**: same — active grid goes to empty state, but
  `/paths/archived` now has content.
- **Unmark achieved after it fed the graph**: the win is removed from
  `WinLog` / `ContributionGraph` (consistent with un-completing an Action).
- **Reorder with only one Path**: drag handle is inert / hidden.
- **LocalStorage unavailable or corrupt**: the Paths list is the first screen that
  needs persisted data — needs a readable failure state rather than a blank grid.
- **Deep-link to a deleted / archived `:pathId`**: `/paths/:pathId` for a missing
  or archived Path needs a not-found / "this Path was archived" state.

## Integration Points

- **vision**: one `Vision` per Path. The overview embeds a read-only Vision
  summary and links to `/paths/:pathId/vision`. Deleting the Path cascades the
  Vision and all its tiles.
- **goals**: every `Goal` belongs to exactly one Path. The overview lists the
  Path's Goals (priority order, deadline countdowns) and links to
  `/paths/:pathId/goals`. Goals are created under a Path; deleting the Path
  cascades its Goals and their Actions.
- **winlog**: the per-Path `ContributionGraph` is embedded on the overview; the
  card grid shows a mini version. `Achievement` mark-achieved events and
  Goal/Action completions under the Path feed it.
- **today**: the Today view sections are grouped by Path and ordered by the manual
  Path order set here (drag-to-reorder).
- **capture-triage**: a triaged `Action` can be assigned standalone directly to a
  Path (no Goal); such Actions are scoped by the Path and cascade on delete.
- **app-shell**: `/paths` is nav item #2; the overview's nested routes
  (`/paths/:pathId/vision`, `/paths/:pathId/goals`) are registered by those
  modules under the shell's router.
