# Essentials

## Vision

Every `Path` has a handful of **Absolutely Necessary Deeds** — the few
repeatable, non-negotiable actions that keep that direction of life moving.
Arnold Schwarzenegger's autobiography is the reference: each area of life has a
small set of things you simply do, over and over. For a salesperson on an
earnings Path it's "call prospective clients" every day; for a body Path it's
"hang from a bar", "walk barefoot", "get on the floor and back up" (the primal,
everyday movement of Rafał Mazur's *Zen Jaskiniowca*).

An `Essential` is **not a Goal** (no end, no execution tree) and **not a Vision
achievement** (not a one-time "I can do X"). It is closer to a habit: a standing
instruction to yourself. The Owner defines a Path's Essentials once, then **logs
each time one is done** — many times a day if that's the deed. Logging opens a
short dialog for an optional comment and **creates an already-completed
`Action`**, so an Essential is a one-tap shortcut for "I did a necessary thing
today, here's a note about it". The **Essentials tab** is where deeds are defined
and logged; the **Path overview** shows how many the Owner has completed in total
for that Path — a count that only goes up, in the same accumulation spirit as the
win balance.

**Free tracking, deliberately.** No cadence targets (daily / 3×-a-week), no
streaks, no "you're on fire". The Essential shows today's completion count and
its all-time count — plain numerals. The reward is the accumulation, read on the
overview, not a decoration on the row.

## User Flows

### Define a Path's Essentials

1. User opens a Path → **Essentials** tab (`/paths/:pathId/essentials`).
2. First time: an **empty state** explains the concept ("The few things you must
   keep doing for this Path") with a prominent **Add your first Essential** and a
   few seed examples for inspiration (primal-movement set for a body Path; a
   sales set is mentioned in copy).
3. User clicks **New Essential** → **EssentialDialog**: a name field ("Hang from
   a bar — 60s total"), an optional one-line **detail** ("why / how — anytime
   across the day"). **Cancel / Create**.
4. The new Essential appears at the **end** of the list (manual order).
5. Row overflow menu: **Edit** (same dialog, prefilled), **Move up / Move
   down**, **Delete**.
6. User can drag a row by its handle to reorder; keyboard Move up/down is the
   accessible equivalent (WCAG 2.2 AAA). Each reorder shows an **Undo** toast.

### Log a completion

1. On the Essentials tab, each row has a primary **Log** button.
2. Click → **LogEssentialDialog**: the Essential's name is the title; one
   optional **comment** textarea ("How did it go? — optional"). **Cancel / Log
   it**.
3. Submit → an `Action` is created **already `done`**: `completedAt` = now,
   `scheduledDate` = null, `name` = the Essential's name, `note` = the comment
   (only when non-empty), `essentialId` = this Essential, `pathId` = the Path,
   `goalId` = null, `frog` = false.
4. A toast confirms — "Logged “Hang from a bar”" — with **Undo** (removes exactly
   that Action).
5. The row's counter updates — `3 today · 128 logged` (or `128 logged`
   when nothing today, `Not logged yet` at zero).
6. The Owner can log the same Essential again immediately — each log is its own
   Action with its own comment and its own Undo window.
7. The created Action is a normal completed Action: it shows in the **WinLog**
   under today as a small win and in the flat **Actions** view; it never appears
   in Today or Schedule (no `scheduledDate`).

### Read progress on the Path overview

1. User opens `/paths/:pathId` → below **Wins**, above **Goals**, an
   **Essentials** section.
2. It shows `N essentials · M logged` and, when today's count is
   above zero, `· K today`.
3. A Path with no Essentials shows a single line — "Define this Path's necessary
   deeds" — linking to the tab.
4. The section heading links into the Essentials tab.

### Edit / delete an Essential

1. Row overflow → **Edit** → EssentialDialog prefilled → save. A dirty form
   confirms before discarding.
2. Row overflow → **Delete** → **DeleteEssentialDialog** (`AlertDialog`): "Delete
   “Hang from a bar”? Its 128 logged completions are kept as wins. This removes
   the Essential only." **Cancel / Delete essential**. Undo toast after.
3. Deleting an Essential leaves its completion Actions intact (their `name`
   preserves what was done; their `essentialId` simply points at nothing and
   stops being counted).

### Archived Path

1. The Essentials tab on an archived Path renders **read-only**: a restore
   banner, no **Log**, no **New Essential**, no reorder, no row menu.
2. The overview's Essentials summary still shows its counts and the link still
   works — matching the Vision / Actions tab convention.

## Screens (rough)

- **Essentials tab** (`/paths/:pathId/essentials`): contextual header (Path name,
  back to Paths, `PathTabs` with the new **Essentials** entry) → **New
  essential** button → list of **EssentialRow** items. Each row: drag handle,
  name (clamped to 2 lines, `break-words`), optional detail (1 line, muted),
  a `today · logged` counter (plain numerals; right-aligned on `sm`+, stacked
  under the name below it), a
  primary **Log** button, an overflow menu (Edit, Move up, Move down, Delete).
  **Empty state** when the Path has none. **Read-only** banner + stripped
  controls when the Path is archived.
- **EssentialDialog** (`Dialog`): create / edit — name input (required, inline
  error when empty), optional detail input, Cancel / Create|Save. Dirty-form
  confirm on Cancel / Escape / backdrop.
- **LogEssentialDialog** (`Dialog`): title = the Essential's name, optional
  comment `Textarea`, Cancel / **Log it**. Dirty-form confirm only when the
  comment has text.
- **DeleteEssentialDialog** (`AlertDialog`): destructive confirm; states that
  logged completions are kept; Cancel / Delete essential.
- **EssentialsSummary**: the component `paths` embeds on the overview —
  `N essentials · M logged · K today`, or the "define this Path's
  necessary deeds" one-liner when empty. Exported from this module the way
  `winlog` exports `WinBalance`. Same section rhythm as **Wins**
  (`text-sm font-semibold` heading).
- **EssentialsDataUnreadable**: recovery screen shown instead of the tab content
  when the stored `essentials` value is corrupt — explains the data can't be
  read (distinct from the empty state) and offers a confirmed reset. Same
  pattern as `PathsDataUnreadable` / `ActionsDataUnreadable`.
- **Storage-failure banner** (app shell, inherited): a failed `essentials` write
  surfaces through the existing app-wide banner — edits stay in memory for the
  session.

## Actions

| Action | Description in this module | Entity | Notes |
|--------|---------------------------|--------|-------|
| Create Essential | **New Essential** → dialog: name (required) + optional one-line detail; lands at the end of the Path's manual order | `Essential` | Empty name blocked with an inline error |
| Edit Essential | Row overflow → dialog prefilled (name, detail) | `Essential` | Dirty-form confirm before discarding |
| Reorder Essentials | Drag handle + keyboard Move up / Move down; manual `order` within the Path | `Essential` | Undo toast per move; inert with a single Essential |
| Delete Essential | Row overflow → `AlertDialog`; logged completions are **kept** | `Essential` | Undo toast; a dangling `Action.essentialId` is inert |
| Log Essential completion | Primary **Log** on the row → dialog with an optional comment → creates an already-`done` `Action` | `Action` | `completedAt` = now, `scheduledDate` = null, `name` = Essential name, `note` = comment, `essentialId` set; Undo toast; feeds `WinLog` as a small win |
| View Essentials progress | Path overview **Essentials** section: `N essentials · M logged · K today` | `Essential` / `Action` | Counts derived by counting `Action`s with this Path's `essentialId`s |

`Action`-level effects of a log (owned by `capture-triage` / `today` /
`winlog`, unchanged here): the new Action can be renamed, rescheduled,
abandoned, deleted, or moved through the normal Actions-view surfaces; its
`note` is editable there (a follow-up, not MVP).

## Edge Cases

Systematically audited in `docs/modules/essentials-edgecases.md` and hardened
(proto-harden, 2026-09-10, ADR 0053 — 7 closed, 5 deferred). Decided behaviors:

- **No Essentials for the Path**: the tab shows a concept empty state +
  **Add your first Essential** + seed examples; the overview shows the "define
  this Path's necessary deeds" one-liner. Never looks broken.
- **Essential with zero completions ever**: `0 total`, no "today" line — a quiet
  not-started signal.
- **Many logs in one day**: expected; each is its own Action; today's count
  climbs; each has its own Undo window; no rate limit.
- **Undo a log**: removes exactly that Action (and its small win from `WinLog`).
- **Delete an Essential with completions**: completions survive as standalone
  `done` Actions under the Path; the confirm dialog says so; the per-Essential
  count stops including them.
- **Delete / archive the Path**: on delete, the Path's Essentials are wiped
  (self-heal) **and their logged-completion Actions are deleted with them** —
  `useActions`' orphan self-heal drops orphaned `done` + `essentialId` rows
  instead of resurrecting them in the Inbox (ADR 0053). The delete-confirm
  summary counts the Essentials ("N Essentials"). On archive, the tab is
  read-only and the overview summary still reads.
- **Two Essentials with the same name**: allowed (personal tool, no uniqueness);
  each keeps its own count because the link is by `essentialId`, not name.
- **Very long name / detail**: name clamps to 2 lines with `break-words`; detail
  to 1 line; the dialog `<input>`s accept long text (a hard length limit is
  deferred, matching `paths`).
- **Large all-time count**: thousands format without breaking the row layout.
- **Empty comment in the log dialog**: allowed — the comment is optional; the
  Action is created with no `note`.
- **Unsaved comment / unsaved dialog input**: a dirty form confirms before
  discarding on Cancel / Escape / backdrop (matches `NewPathDialog`).
- **`essentials` LocalStorage write fails**: the app-wide storage-failure banner
  covers it; edits stay in memory for the session.
- **`essentials` value corrupt**: `EssentialsDataUnreadable` on the tab — a
  confirmed reset, distinct from the empty state.
- **Deep-link to a deleted `:pathId`**: reuse `PathNotFound`.
- **Reorder with one Essential**: the drag handle and Move up/down are inert.
- **Timezone**: "today's count" uses the local calendar date (`todayLocalIso`),
  matching `overdueActions` and the win-day keys.
- **No-op reorder**: a drag that lands where it started returns no Undo and
  shows no toast (`reorderEssential` returns `null`) — the toast is also the
  screen-reader announcement, so it must reflect a real change.
- **Long deed text**: name clamps to 2 lines, detail to 1, both `break-words`
  and carry a `title` tooltip with the full text.
- **Narrow screens**: the per-row completion counter stacks under the deed name
  below the `sm` breakpoint so the name and the Log button both stay usable.
- **Overview vs win balance**: the Essentials summary reads "N logs on this
  Path" — a per-Path lens, deliberately worded to not look like a duplicate of
  the win balance's small-win count (both move when a deed is logged; ADR 0051).

## Integration Points

- **paths**: one Path owns many Essentials. `PathTabs` gains a 4th entry
  (**Essentials**, `Anchor` icon — calm and steadfast, not a streak flame). The
  Path overview embeds `<EssentialsSummary pathId={…} />` between the **Wins**
  and **Goals** sections. `DeletePathDialog`'s cascade summary gains an
  Essentials count; the Path-delete flow calls `deleteEssentialsForPath(pathId)`
  alongside `deletePath`. Archiving a Path makes the tab read-only.
- **capture-triage** (owns `Action`): `Action` gains `note?: string` and
  `essentialId?: string | null` (both optional, absent on every existing row, no
  migration). `useActions` gains `logEssentialCompletion({ pathId, essentialId,
  name, note })` — the single writer of the `actions` key for a log; `essentials`
  never touches that key directly (the same rule `vision` follows for
  achievements). The existing Path-deleted self-heal loop is unaffected — a
  `done` completion Action under a live Path is not orphaned; under a deleted
  Path it is wiped by the cascade like any other.
- **winlog**: **no code change.** A logged Essential is a `done` `Action`, so it
  appears in the `WinLog` under its completion day and bumps the Path's small-win
  count in every `WinBalance` / `WinKindBadges` scope (PathCard, Path overview,
  the Log). This is **accepted, not suppressed** (ADR 0051): an Essential done is
  a genuine small win, it keeps `winlog` derivation-only, and it is consistent
  with "accumulation is the reward" (DESIGN.md). The Essentials-tab counter and
  `WinBalance` answer different questions — this specific deed vs everything done
  — so both standing counts is correct, not a duplicate.
- **today**: no integration. Completion Actions carry `scheduledDate = null`, so
  they never enter the Today or Schedule views. (A future "Essentials strip in
  Today" is explicitly deferred — see `docs/changes/essentials.md` → Later.)
- **actions**: the flat Actions view shows Essential-completion Actions like any
  other completed Action (under their Path, standalone, behind **Show
  completed**). Editing the `note` happens there, later.
- **app-shell**: one nested route `/paths/:pathId/essentials` registered via
  `essentialsRoutes` spread into `src/App.tsx` (same handoff as
  `visionRoutes` / `goalsRoutes`, replacing any `NestedModulePlaceholder`). No
  top-level nav slot — the 5 primary destinations are unchanged.
