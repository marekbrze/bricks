# [0039] - Win-kind balance replaces the contribution graph; Goals close from Actions

**Date**: 2026-09-07
**Module**: winlog (primary), actions, paths, goals
**Status**: Accepted

## Context

The Log's only summary was a total-win counter over a GitHub-style
contribution graph (`ContributionGraph`, six-tier day cells) — a
visualization the designer now wants gone ("rezygnuję z grafu ala git"). Two
kinds of Wins already existed in the data (`Win.kind`: completed Action vs
achieved Goal) but the UI summed them into one number, so closing a Goal —
the bigger deal — read the same as ticking one Action. Closing a Goal was
also only reachable from the Goals tree/progress overflow menus, far from
where the work on a Goal actually happens (the Actions screens), and with no
ceremony at all. The `openloops` project (same designer) speaks this exact
vocabulary better: small wins = finished actions, big wins = closed threads,
each kind an icon with its own count, and closing is a celebrated, deliberate
step.

## Decision

**One win vocabulary, everywhere.** `CheckCircle2` = small win (completed
Action), `Trophy` = big win (achieved Goal) — always a pair, each with its
count, green only when non-zero (honest zeros). Two components carry it:

- `WinBalance` — the block form (two tiles, one hairline): `lg` on the Log,
  `sm` embedded (Path overview, Goal progress). Numbers on the ramp's counter
  steps (3xl / 2xl).
- `WinKindBadges` — the inline form (`✓ n · 🏆 n`): day-group headers and the
  PathCard win line.

**The graph is removed entirely** — component, stories, the `--chart-1..5`
tokens, and every embed. DESIGN.md's carve-outs ("distinctiveness lives in
the graph", the GitHub reference, the graph's full-strength green) are
updated in the same pass; the win-green budget moves to the balance, badges,
and win rows. Counting funnels through one helper (`winKindCounts`) so no two
surfaces drift; the hook's day-map helpers (`winDays*`) died with the graph.

**The Log reads by day.** History groups into day groups (newest first): a
day header (`formatDayLabel` + `WinKindBadges`) over that day's rows, rows
showing time-of-day instead of the redundant date. Pagination moves from
rows (50) to whole days (14) — a page never splits a day.

**Goals close from Actions.** Each `GoalGroup` header carries a slim
lifecycle menu (`GoalLifecycleMenu`): *Mark achieved* opens the celebration
dialog (`CloseGoalDialog` — trophy badge, the Goal's name, "closing is a
decision, not a checkbox") and only its confirm writes
`setGoalState('achieved')`; *Abandon* and *Reactivate* write immediately with
toasts, matching the Goals-tree menu's behavior. The menu renders on both
Actions screens (shared `useGoalGroups`), disappears on read-only (archived
Path) surfaces, and the Goals-tree/progress menus stay unchanged. Achieving
stamps `achievedOn` = today (ADR 0007 unchanged), which is the day the big
win shows on.

`winlog` stays a derived read (ADR 0013 unchanged) — no ledger, no new
entities; un-completing an Action or reactivating a Goal still removes its
Win on the next render.

## Consequences

- The app's single strongest color surface is gone by designer decision; the
  Log's emotional payload now rides on the two counts and the day-grouped
  accumulation of rows. DESIGN.md no longer promises a graph.
- `WinBalance`/`WinKindBadges` are the only places win kinds may be
  visualized — new surfaces reuse them instead of inventing counters.
- Closing a Goal gains one confirmation step on Actions (deliberate; the
  Goals-tree menu keeps its one-click achieve for bulk triage).
- Old ADRs (0013, 0015, 0030) keep their historical graph references; this
  ADR supersedes the visual ones.
