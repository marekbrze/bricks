# WinLog

## Vision

`winlog` is the motivational payoff and the app's #1 differentiator vs
Griply — a place with no Griply equivalent at all. It answers the question
the rest of the app deliberately avoids asking in percent-complete terms:
"how much have I actually done?" A day-grouped history of completed
`Action`s and achieved `Goal`s, headed by a two-kind win balance, exists
specifically to counter negative bias — the tendency to stare at what's left
rather than the distance already covered.

The module's language is the win vocabulary (ADR 0039, after `openloops`):
a **small win** is a completed Action (`CheckCircle2`), a **big win** is an
achieved Goal (`Trophy`). Both always appear as a pair — icon plus count —
in the `WinBalance` block and in the `WinKindBadges` inline pair; green only
when non-zero, zeros shown honestly. The former contribution graph was
removed by designer decision; the counts and the day-grouped accumulation of
rows carry the emotional payload now.

`winlog` owns no entity of its own. Every Win is derived, live, from
`Action.completedAt` and `Goal` achievement — there is nothing to create,
edit, or delete here directly. Un-completing an Action or reactivating a
Goal in `today`/`goals`/`actions` removes its Win the same instant, since the
log is just a read of current state, not an append-only ledger of past events
(see Edge Cases and ADR 0013 for why this resolves the PROJECT.md open
question on deletion).

The module shows up in four places: a dedicated **Log** page (global view,
the full history), embedded on the **Path overview** (scoped to that Path,
`WinBalance sm`), embedded on **Goal progress** (scoped to that Goal's
subtree, `WinBalance sm`), and a `WinKindBadges` win line on each **PathCard**
— one vocabulary everywhere, different scopes.

## User Flows

### Open the Log (global)

1. Owner opens **Log** from the primary nav.
2. Sees the **win balance** at the top — small wins and big wins, each with
   its count, for the current scope (all Paths, or one Path).
3. Below it, a **Path filter** (All Paths, or one specific Path) and the
   day-grouped history — newest day first — each day headed by its label
   ("Today", "Yesterday", a date) and its `WinKindBadges` counts, each row
   showing what was won, which Path/Goal it belonged to, and (for Actions)
   the time of day.
4. Switching the Path filter re-scopes the balance and the history together —
   one control, not two.

### Read a Win row

1. A completed-Action Win shows the checkmark icon, the Action's name, its
   Path (and Goal, if it had one), and the time it was completed.
2. An achieved-Goal Win shows the trophy icon, the Goal's name, its Path, and
   a "Goal achieved" suffix — distinguishable at a glance since achieving a
   Goal is a bigger deal than finishing one Action toward it.
3. Clicking an Action-Win row navigates to `today`'s day view for the
   Action's *current* `scheduledDate` when it still has one — a completed
   Action can be moved to another day afterward, so this can differ from the
   day group the row sits in (which stays the day it was completed on) —
   falling back to the completed-on date when the Action has since been
   unscheduled. See ADR 0013 (harden pass, 2026-09-04).
4. Clicking a Goal-Win row navigates to that Goal's progress page in
   `goals` (`/paths/:pathId/goals/:goalId`).

### Close a Goal that produces a big win

1. Closing happens from the **Actions screens** (ADR 0039): each Goal group
   header carries a lifecycle menu — *Mark achieved* opens the celebration
   dialog ("Goal achieved — it lands in the Log as a big win"), and only its
   confirm writes the state; *Abandon* / *Reactivate* write immediately.
2. The Goal's Win appears in the Log the moment the state lands — stamped
   with today's date (`achievedOn`, ADR 0007) — and the day group for today
   gains one trophy row.
3. Reactivating the Goal (from the same menu, or the Goals screens) removes
   the big win again, same mechanism as every other derived read.

### View a scoped win summary (embedded)

1. On a **Path overview**, a `WinBalance sm` is pre-scoped to that Path
   (Actions standalone on it or under any of its Goals, plus that Path's own
   achieved Goals) — no filter control needed, the scope is the page.
2. On a **Goal progress** page, the balance is scoped further — that Goal's
   own Actions **plus every sub-Goal's Actions** (subtree-inclusive), plus a
   big win for the Goal itself and for any achieved sub-Goal. Matches the
   page's existing cumulative Action count, which is already
   subtree-inclusive (`cascadeCounts`) — the balance and the count next to it
   need to agree on what "toward this Goal" means.
3. On a **PathCard**, the win line (`WinKindBadges`) reports both counts at a
   glance — the same two icons, no block.
4. Neither embedded summary links out anywhere further — they're a summary
   glance; the full drill-down history only exists on the dedicated Log page.

## Screens (rough)

- **Log (global)** (`/winlog`, filter in `?path=` — survives a refresh):
  `WinBalance lg` (global or Path-scoped), Path filter chips (active **and**
  archived Paths, archived labeled), day-grouped history (day header with
  `WinKindBadges`, rows with icon, name, Path/Goal context, time) showing the
  first 14 days with a "Load more (n more days)" button, each row clickable
  per above.
- **WinBalance sm (embedded, Path-scoped)**: inside `PathOverviewPage`,
  same component, no filter, no row list — balance only.
- **WinBalance sm (embedded, Goal-scoped)**: inside the Goal progress view,
  same component, no filter, no row list — balance only.
- **WinKindBadges (embedded)**: the win line on every `PathCard`.

No new screens beyond the two win components and the one dedicated Log page —
`winlog` intentionally stays thin.

## Actions

| Action | Description in this module | Entity | Notes |
|--------|------------|--------|-------|
| Open WinLog | Land on `/winlog` — global balance + filterable day-grouped history | Process | Primary nav entry |
| Read the win balance | See small/big counts for the current scope | Process | Log, Path overview, Goal progress, PathCard |
| Filter WinLog by Path | Re-scope the balance and the history on `/winlog` to one Path | Process | |

Closing the Goals that produce big wins is an `actions`-module action now
(ADR 0039) — see `docs/modules/actions.md`. No new entities — `Win` stays
defined in `docs/GLOSSARY.md`, now split into the small/big kinds.

## Edge Cases

- **No Wins at all yet**: empty state on `/winlog` — no balance block and no
  filter control (nothing to filter), just a short message pointing at
  `today`/`actions`/`goals` to close the first Win.
- **A Path has Wins but the currently-filtered Path has none**: the balance
  reads honestly `0 · 0` (honest zeros — the app looked, there's nothing
  here) and the list shows a scoped empty message — same pattern as
  `today`'s per-Path empty section.
- **Un-completing an Action / reactivating an achieved Goal**: the Win
  disappears from the log immediately, since nothing is stored — `winlog` is
  a live read, not a ledger. Resolves the PROJECT.md open question on
  whether history survives deletion: it survives *state changes* not at all,
  by design (see ADR 0013).
- **The underlying Action or Goal is deleted**: its Win vanishes from the
  log on the next read, same mechanism as above — deletion isn't special-
  cased, it's just another way the derived data source stops including it.
- **Same day, many Wins**: one day group with all of them — the header's
  `WinKindBadges` count both kinds separately, and the group's rows appear
  in the list order (Actions by time, the Goal's big win closing the day).
  Achieving a Goal doesn't absorb or hide the Action-level win that may have
  led to it.
- **Clicking an Action-Win whose Action has since been moved to another
  day**: the row links to the Action's *current* `scheduledDate` (falling
  back to the completed-on date if it has none), so the Owner lands on a
  day where the Action actually appears, not a stale one where it's
  invisible (hardened, 2026-09-04 — see `winlog-edgecases.md` #2). Moving a
  completed Action no longer un-completes it or drops its Win in the first
  place — see `winlog-edgecases.md` #1.
- **Very long Win history (months/years of daily use)**: the history shows
  the first 14 day groups with a "Load more" button appending 14 more days
  — paging by whole days so a page never splits one (ADR 0039; re-hardened
  from the row-based paging in `winlog-edgecases.md` #7).
- **A Goal achieved on a day it has no Action win**: it forms its own day
  group with `0 · 1` badges — a big win stands alone.
- **No Paths at all**: a dedicated "No Paths yet" state (distinct from "No
  wins yet") points at creating a first Path, since neither completing an
  Action nor achieving a Goal is reachable without one yet (hardened,
  2026-09-04 — see `winlog-edgecases.md` #5).
- **An archived Path's Wins**: still count toward "All Paths" (global
  balance + history) and can also be isolated individually — the Path filter
  chips include archived Paths, labeled "(archived)" (hardened, 2026-09-04 —
  see `winlog-edgecases.md` #4).
- **The Path filter across a refresh or shared link**: lives in the URL
  (`?path=<id>`) rather than component state, so it survives a refresh and
  is shareable/bookmarkable — an unknown or stale id (e.g. a deleted Path)
  falls back to "All Paths" instead of erroring (hardened, 2026-09-04 — see
  `winlog-edgecases.md` #3).

## Integration Points

- **today**: completing an Action there is the primary small-win source; an
  Action-Win row links back into `today`'s date-scoped view.
- **actions**: closing a Goal from a Goal group (ADR 0039) is the primary
  big-win source on the work surface; `goals`' menus do the same from the
  tree.
- **goals**: an achieved Goal is a big win; a Goal-Win row links into Goal
  progress, which also embeds this module's Goal-scoped balance.
- **paths**: the Path overview embeds this module's Path-scoped balance, and
  every PathCard carries its win line.
