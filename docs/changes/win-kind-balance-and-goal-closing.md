# Feature: Win-kind balance replaces the contribution graph; goals close from Actions

## Type
Feature (planned by proto-feature)

## User goal
"Przerobić logikę logu: da się zamykać cele (mark achieved); zwycięstwa
rozdzielone na małe (wykonana akcja) i większe (zamknięty cel); rezygnacja
z grafu ala git; zamiast niego — jak w openloops — dwa rodzaje ikon pucharów
symbolizujących zwycięstwa, przy każdym liczba tych zwycięstw."

Designer decisions (asked, answered):
1. **Goal closing lives on Actions** — on each Goal group (menu), not on the
   Log (which stays a read) and not only in the Goals-tree overflow menu where
   it was buried. Celebration dialog in the `openloops` close-loop spirit.
2. **The graph goes everywhere** — Log, Path overview, Goal progress, and the
   PathCard mini-graph all lose it; the two-trophy counters replace it in all
   four spots, so the app speaks one win language.
3. **History groups by day** — openloops journal style: a day header with the
   two kind badges + counts, entries under it.

## Vocabulary (the core of the change)
- **Small win** — a completed `Action` (icon `CheckCircle2`, green when > 0).
- **Big win** — an achieved `Goal` (icon `Trophy`, green when > 0).
- Both derived live, exactly as today (ADR 0013 unchanged — `winlog` stays a
  read of `Action.completedAt` / `Goal.achievedOn`, no ledger).
- `Win.kind` already carries this split; the change is that it becomes the
  primary axis of the UI instead of a per-day sum feeding a heat grid.

## MVP scope
- **`WinBalance`** (winlog component): one bordered block, two tiles divided
  by a hairline (openloops `week-balance` pattern, bricks tokens): icon +
  label ("Small wins" / "Big wins") + hint ("actions completed" / "goals
  achieved") + big tabular number. Honest zeros (ADR openloops-0017 spirit):
  an empty scope shows `0 · 0` with muted icons — it does not cheer, and it
  does not hide. Variants: `lg` (Log) and `sm` (embedded scopes).
- **`WinKindBadges`** (winlog component): inline `✓ n · 🏆 n` pair with
  per-kind `aria-label`s — used in day headers and on `PathCard`.
- **LogPage reworked**: header → Path filter → `WinBalance` (path-scoped) →
  day-grouped history. Day header: `formatDayLabel` + `WinKindBadges` for that
  day; rows underneath show kind icon + name + context + time-of-day (the day
  is the group's). Today's group gets the `today` chip. Pagination moves from
  rows to days (14-day pages, "Load more (n more days)") — a page break never
  splits a day.
- **Graph removed everywhere**: `ContributionGraph` + its stories deleted;
  `LogPage`, `PathOverviewPage`, `GoalProgressPage`, `PathCard` re-hosted;
  the now-unused `--chart-1..5` tokens removed from `index.css` and DESIGN.md.
  Embeds become: Path overview → `WinBalance sm` (path-scoped); Goal progress
  → `WinBalance sm` (subtree-inclusive, matching `cascadeCounts`); PathCard →
  `WinKindBadges` line.
- **useWinLog**: `daysMap`/`winDays*` helpers go; adds `winsForGoal` and a
  `winKindCounts(wins)` helper (`{ small, big }`) so every scope counts the
  same way.
- **Goal closing on Actions**: `GoalGroup` header gains a lifecycle menu
  (shared by ActionsPage and the Path Actions tab through `useGoalGroups`):
  active Goal → "Mark achieved" (opens **celebration dialog** — trophy badge,
  "Goal achieved", "…lands in the Log as a big win. Open Actions don't stand
  in the way — closing is a decision about the goal." → `setGoalState('achieved')`
  + toast) and "Abandon" (immediate + toast, as in Goals); inactive-but-rendered
  Goal → "Reactivate". The Goals-tree/progress menus keep working unchanged.
- **Copy**: empty states updated — no "graph below" references; "No wins yet"
  points at completing Actions / closing Goals.

Deferred to "Later":
- Time-of-day precision on goal wins (`achievedOn` is a date, not a timestamp
  — goal entries sort by day only, fine for a day-grouped log).
- Achieved-Vision-tiles feeding the win log (still a separate product decision,
  unchanged from achievements-as-vision-tiles.md).
- Week/month rollups over the win kinds (the balance is global-scope only for
  now, like the old counter was).

## Impact map
- **New module?**: no.
- **Modules affected**:
  - `winlog` (primary) — LogPage, new components, hook, delete graph.
  - `actions` (extend) — GoalGroup menu + goal lifecycle hook + celebration
    dialog; shared by ActionsPage and PathActionsPage via `useGoalGroups`.
  - `paths` (trim) — PathCard mini-graph → badges; PathOverviewPage graph →
    `WinBalance sm`.
  - `goals` (trim) — GoalProgressPage graph → `WinBalance sm`; no data-layer
    change (`setGoalState` already exists, ADR 0007).
- **Design docs**: DESIGN.md loses the ContributionGraph carve-outs (register,
  references, color strategy, chart tokens) — the win-green budget moves to the
  balance/badges; new ADR 0039.
- **Shared-doc additions**: GLOSSARY.md (Small win / Big win), ACTIONS.md,
  ENTITY_MAP.md (graph is a view, not an entity — note the derived-view change),
  modules/winlog.md (+ edgecases), modules/actions.md (+ edgecases),
  modules/paths.md, modules/goals.md.

## Risks / open questions
- DESIGN.md calls the graph "the one surface allowed to carry visible color at
  full strength" — resolved by the designer's explicit call to drop the graph;
  the docs are updated in the same pass so no silent drift.
- "Achievements" (Vision tiles) vs "Big wins" (achieved Goals) coexist on
  PathCard — badges say "wins", the meta row keeps "achievements", per
  GLOSSARY.
