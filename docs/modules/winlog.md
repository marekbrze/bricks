# WinLog

## Vision

`winlog` is the motivational payoff and the app's #1 differentiator vs
Griply — a place with no Griply equivalent at all. It answers the question
the rest of the app deliberately avoids asking in percent-complete terms:
"how much have I actually done?" A chronological history of completed
`Action`s and achieved `Goal`s, paired with a GitHub-contribution-graph-style
visualization of cumulative wins, exists specifically to counter negative
bias — the tendency to stare at what's left rather than the distance already
covered.

`winlog` owns no entity of its own. Every Win is derived, live, from
`Action.completedAt` and `Goal` achievement — there is nothing to create,
edit, or delete here directly. Un-completing an Action or reactivating a
Goal in `today`/`goals` removes its Win the same instant, since the log is
just a read of current state, not an append-only ledger of past events (see
Edge Cases and ADR 0013 for why this resolves the PROJECT.md open question
on deletion).

The module shows up in three places: a dedicated **Log** page (global view,
the full history), embedded on the **Path overview** (scoped to that Path),
and embedded on **Goal progress** (scoped to that Goal). Same
`ContributionGraph` component, three different scopes — the Owner never
has to context-switch to see "how am I doing on the sport path" while
already looking at it.

## User Flows

### Open the Log (global)

1. Owner opens **Log** from the primary nav.
2. Sees the global `ContributionGraph` at the top — one cell per day, color
   intensity by Win count that day (completed Actions + achieved Goals
   combined, across every Path), covering the trailing 12 months like
   GitHub's own graph.
3. Below it, a **Path filter** (All Paths, or one specific Path) and the
   chronological Win list — newest first — each row showing what was won,
   which Path/Goal it belonged to, and when.
4. Switching the Path filter re-scopes both the graph and the list together
   — one control, not two.

### Read a Win row

1. A completed-Action Win shows a checkmark-style icon, the Action's name,
   its Path (and Goal, if it had one), and the completion date.
2. An achieved-Goal Win shows a distinct icon (trophy-style, not the
   checkmark), the Goal's name, its Path, and the achieved date — visually
   distinguishable at a glance since achieving a Goal is a bigger deal than
   finishing one Action toward it.
3. Clicking an Action-Win row navigates to `today`'s day view for the
   Action's *current* `scheduledDate` when it still has one — a completed
   Action can be moved to another day afterward, so this can differ from the
   date shown on the row (which stays the day it was completed on) —
   falling back to the completed-on date when the Action has since been
   unscheduled. See ADR 0013 (harden pass, 2026-09-04).
4. Clicking a Goal-Win row navigates to that Goal's progress page in
   `goals` (`/paths/:pathId/goals/:goalId`).

### View a scoped ContributionGraph (embedded)

1. On a **Path overview**, the graph is pre-scoped to that Path (Actions
   standalone on it or under any of its Goals, plus that Path's own achieved
   Goals) — no filter control needed, the scope is the page.
2. On a **Goal progress** page, the graph is scoped further — that Goal's
   own Actions **plus every sub-Goal's Actions** (subtree-inclusive), plus
   an achieved event for the Goal itself and for any achieved sub-Goal.
   Matches the page's existing cumulative Action count, which is already
   subtree-inclusive (`cascadeCounts`) — the graph and the count next to it
   need to agree on what "toward this Goal" means.
3. Neither embedded graph links out anywhere further — they're a summary
   glance; the full drill-down chronological list only exists on the
   dedicated Log page.

## Screens (rough)

- **Log (global)** (`/winlog`, filter in `?path=` — survives a refresh):
  `ContributionGraph` (52-week, global or Path-scoped), Path filter chips
  (active **and** archived Paths, archived labeled), chronological Win list
  (icon, name, Path/Goal context, date) showing the first 50 with a "Load
  more" button, each row clickable per above.
- **ContributionGraph (embedded, Path-scoped)**: inside `PathOverviewPage`,
  same component, no filter, no row list — graph only.
- **ContributionGraph (embedded, Goal-scoped)**: inside the Goal progress
  view, same component, no filter, no row list — graph only.

No new screens beyond the graph component and the one dedicated Log page —
`winlog` intentionally stays thin.

## Actions

| Action | Description in this module | Entity | Notes |
|--------|------------|--------|-------|
| Open WinLog | Land on `/winlog` — global graph + filterable chronological list | Process | Primary nav entry |
| Open ContributionGraph | Render the graph, scoped global / Path / Goal | Process | Same component, three embed contexts |
| Filter WinLog by Path | Re-scope both the graph and the list on `/winlog` to one Path | Process | New — surfaced in this interview |

`docs/ACTIONS.md` already listed "Open WinLog" and "Open ContributionGraph"
under the derived-views table; this pass adds **Filter WinLog by Path** as a
new entry there. No new entities or glossary terms — `Win` was already
defined in `docs/GLOSSARY.md` as "a completed Action or an achieved Goal."

## Edge Cases

- **No Wins at all yet**: empty state on `/winlog` — no graph grid of empty
  cells and no filter control (nothing to filter), just a short message
  pointing at `today`/`goals` to close the first Win.
- **A Path has Wins but the currently-filtered Path has none**: the graph
  renders as all-empty cells (not hidden) and the list shows a scoped empty
  message — same "the app looked, there's nothing here" pattern as
  `today`'s per-Path empty section.
- **Un-completing an Action / reactivating an achieved Goal**: the Win
  disappears from the log immediately, since nothing is stored — `winlog` is
  a live read, not a ledger. Resolves the PROJECT.md open question on
  whether history survives deletion: it survives *state changes* not at all,
  by design (see ADR 0013).
- **The underlying Action or Goal is deleted**: its Win vanishes from the
  log on the next read, same mechanism as above — deletion isn't special-
  cased, it's just another way the derived data source stops including it.
- **Same day, many Wins**: the graph cell's color intensity scales across
  six tiers (`0`/`1`/`2`/`3`/`4`/`5+`) rather than capping visually at
  "1 = done" — a 5-Win day reads visibly more saturated than a 1-Win day,
  matching GitHub's own graph (hardened, 2026-09-04 — see
  `winlog-edgecases.md` #6).
- **Clicking an Action-Win whose Action has since been moved to another
  day**: the row links to the Action's *current* `scheduledDate` (falling
  back to the completed-on date if it has none), so the Owner lands on a
  day where the Action actually appears, not a stale one where it's
  invisible (hardened, 2026-09-04 — see `winlog-edgecases.md` #2). Moving a
  completed Action no longer un-completes it or drops its Win in the first
  place — see `winlog-edgecases.md` #1.
- **Very long Win history (months/years of daily use)**: the chronological
  list shows the first 50 Wins with a "Load more" button appending 50 more
  — the shipped mock data already produces ~150-250 historical Wins, so
  this wasn't deferrable (hardened, 2026-09-04 — see `winlog-edgecases.md`
  #7).
- **Goal achieved and one of its Actions completed the same day**: both
  rows appear separately in the list (they're two distinct Wins) and both
  count toward that day's graph cell — achieving a Goal doesn't absorb or
  hide the Action-level win that may have led to it.
- **No Paths at all**: a dedicated "No Paths yet" state (distinct from "No
  wins yet") points at creating a first Path, since neither completing an
  Action nor achieving a Goal is reachable without one yet (hardened,
  2026-09-04 — see `winlog-edgecases.md` #5).
- **An archived Path's Wins**: still count toward "All Paths" (global graph
  + history) and can also be isolated individually — the Path filter chips
  include archived Paths, labeled "(archived)" (hardened, 2026-09-04 — see
  `winlog-edgecases.md` #4).
- **The Path filter across a refresh or shared link**: lives in the URL
  (`?path=<id>`) rather than component state, so it survives a refresh and
  is shareable/bookmarkable — an unknown or stale id (e.g. a deleted Path)
  falls back to "All Paths" instead of erroring (hardened, 2026-09-04 — see
  `winlog-edgecases.md` #3).

## Integration Points

- **today**: completing an Action there is the primary Win source; an
  Action-Win row links back into `today`'s date-scoped view.
- **goals**: achieving a Goal there is the other Win source; a Goal-Win row
  links into Goal progress, which also embeds this module's Goal-scoped
  graph.
- **paths**: the Path overview embeds this module's Path-scoped graph.
