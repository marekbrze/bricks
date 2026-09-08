# Module Breakdown

## Overview

Bricks splits into **7 design modules** plus a generic app shell — and, added later, the infrastructure module `data-sync` (optional Dexie Cloud push/pull, ADR 0023). Everything hangs off `Path` (the `paths` module), so it is the foundation. The core value loop runs across four modules — capture an idea (`capture-triage`), decide where it belongs (`capture-triage` → `goals`/`paths`), schedule and do it (`today`), and watch the wins accumulate (`winlog`). `vision` is a rich, mostly self-contained surface that sits alongside the loop rather than inside it. `actions` is the flat whole-app task list — a Todoist-style aggregation and quick-add surface over the entities the loop modules own.

Six of the seven modules are **Core** — this is a focused personal tool with almost no infrastructure surface beyond persistence and navigation.

## Modules

### paths
**Type**: Core
**Description**: The container layer. Create and manage never-ending life directions (the sport path, the earnings path) and see the per-Path hub screen that pulls together the Vision summary, the Goal list, and the win balance. Archiving and cascade-delete (with confirmation) live here. Achievements are Vision tiles now (ADR 0037) — `paths` no longer owns them.
**Entities**: `Path`
**Key Actions**: Create Path (+ seed achievement tiles onto its Vision), rename, reorder, archive/unarchive, delete (cascade), view Path overview.
**Connects to**: `vision` (Path overview embeds Vision summary — including achievement progress; "open Vision board"; Path creation seeds achievement tiles through `useVision`); `goals` (Path overview embeds the Goal tree inline via `PathGoalsSection` — ADR 0043; Goals are created under a Path); `winlog` (Path overview embeds the Path's win balance; PathCard shows the win line); `today` (Today view groups Actions by Path); `capture-triage` (an Action can be assigned standalone to a Path).
**Design priority**: High — it is the hub screen every other module surfaces through, and the mental model (the "Path") has to land here first.

---

### vision
**Type**: Core
**Description**: A Notion-like board per Path — an ordered mix of short text notes, photo tiles, and achievement tiles (ADR 0037) rather than one long document. Photos come from local upload or an Unsplash search; achievements are the "along the way" things you can achieve, ticked in place. The whole board exports to a single merged markdown document.
**Entities**: `Vision`, `VisionNote`, `VisionImage`, `VisionAchievementTile`
**Key Actions**: Open Vision board, add/edit/delete/reorder note, upload image, fetch from Unsplash, remove/reorder image, add/edit/delete/reorder achievement, mark/un-mark achieved, export Vision.
**Connects to**: `paths` (one Vision per Path; Path overview shows a Vision summary — with achievement counts — and links in; Path creation seeds achievement tiles); `app-shell` (Unsplash API key lives in settings).
**Design priority**: Medium — highest craft effort (block editor + gallery + external image source + export), but independent of the core value loop, so it can be prototyped after the loop is proven.

---

### goals
**Type**: Core
**Description**: The execution layer under a Path. A tree of `Goal`s and sub-`Goal`s in manual priority order, each with an optional deadline and days-remaining countdown. Goals are marked achieved manually (or abandoned), can be flagged as a frog (which propagates to their Actions), and can be moved between Paths. A per-Goal progress view shows the cumulative action count and the win balance toward that Goal.
**Entities**: `Goal`
**Key Actions**: Create Goal / sub-Goal, edit, reorder by priority, move to another Path, toggle frog, mark achieved, abandon, reactivate, delete, view Goal progress, quick-add an Action from the Goal progress view, manage and reorder the Goal's own Actions there (full row vocabulary + manual order — ADR 0042).
**Connects to**: `paths` (every Goal belongs to exactly one Path; the Goal tree renders inline on the Path overview via `goals`-owned `PathGoalsSection` — ADR 0043); `capture-triage` (Actions get assigned to Goals; an Action can be promoted into a Goal; the progress view's quick-add writes through `useActions().createAction`); `today` (a Goal's scheduled Actions show up in Today); `winlog` (achieving a Goal creates a Win); `actions` (the progress view reuses the Actions view's `QuickAddActionRow` verbatim — ADR 0041).
**Design priority**: Medium-High — the tree + priority ordering + frog propagation + achieve/abandon lifecycle is structurally the richest entity, and it is the bridge between the container and the daily work.

---

### capture-triage
**Type**: Core
**Description**: The front door for actions and the antidote to decision paralysis. Capture an `Action` idea with just a name into the Inbox without deciding anything. Later, enter a dedicated card-by-card review mode (DoItDone / AutoWork pattern) that steps through Inbox items one at a time: assign to a Path or Goal, mark standalone, discard, or promote to a Goal if the item turns out to need many actions.
**Entities**: `Action` (states `inbox` → `assigned`)
**Key Actions**: Capture to Inbox, open Inbox review, process next item, assign to Path/Goal, mark standalone, promote Action to Goal, discard item, move Action between Goals/Paths.
**Connects to**: `goals` (assign to / promote into a Goal); `paths` (assign standalone to a Path); `today` (triaged Actions become schedulable).
**Design priority**: High — the card-by-card processing flow is the most novel interaction in the app and central to the "deliberate action without paralysis" promise. `PairwisePrioritization` is deferred but this is where it will land.

---

### today
**Type**: Core
**Description**: The daily execution surface and the app's landing screen. Sections per Path, each listing that day's scheduled Actions — the focus for today. Frogs and high-value items are visually called out. Day navigation steps forward and back; a separate agenda / schedule view lays out day-header + tasks down a list. Scheduling an Action to a day and completing / un-completing it happen here.
**Entities**: `Action` (`scheduledDate`, `completedAt`, `done`/`abandoned`)
**Key Actions**: Open Today view, navigate days, open Schedule view, schedule/unschedule Action, complete/un-complete Action, abandon Action, review abandoned Actions, delete Action.
**Connects to**: `paths` (grouping is by Path); `goals` (Actions belong to Goals); `capture-triage` (Actions arrive from triage; frog flag set upstream); `winlog` (completing an Action creates a Win).
**Design priority**: High — highest daily-use impact. The information hierarchy (what's valuable vs what's a frog, per-Path sectioning, day focus vs full list) is the core of the product experience.

---

### winlog
**Type**: Core
**Description**: The motivational payoff and the #1 differentiator vs Griply. A day-grouped history of completed Actions (small wins) and achieved Goals (big wins), headed by a two-kind win balance — global, per Path, and per Goal. Emphasis on accumulation ("how much I've already done"), not percent-complete, as a deliberate counterweight to negative bias. The contribution graph was removed by designer decision (ADR 0039).
**Entities**: none stored — derived from `Action.completedAt` and `Goal` achievement.
**Key Actions**: Open WinLog, read the win balance (global / per Path / per Goal), filter the Log by Path.
**Connects to**: `today` (completed Actions feed it); `actions` (closing a Goal lands a big win — ADR 0039); `goals` (achieved Goals feed it; per-Goal balance shown in Goal progress); `paths` (per-Path balance shown in Path overview, win line on PathCard).
**Design priority**: High — it is the reason the app exists over alternatives. The design risk is emotional: making the accumulating "bricks" genuinely rewarding to look at.

---

### actions
**Type**: Core
**Description**: The flat whole-app task list — a Todoist/Things-style view of every Action, grouped Path → Goal (sub-Goals nested) → Actions, with an Inbox group on top and standalone Actions after each section's Goal groups. Quick-add rows create Actions (assigned to a Goal, or standalone, with an optional due date via a Today/Tomorrow/pick-date popover) and Goals right from the list. Rows complete/un-complete, schedule, rename and frog-toggle in place; done/abandoned hide behind a "Show completed" toggle. No new entities — a derived surface over `Action`, `Goal`, `Path`.
**Entities**: none stored — reads and writes `Action`, `Goal`, `Path` through the owning modules' hooks.
**Key Actions**: Open Actions view, quick-add Action (to Goal / standalone, optional `scheduledDate`), quick-create Goal (top-level), complete/un-complete, schedule/unschedule, rename, toggle frog, show completed.
**Connects to**: `capture-triage` (consumes `useActions`; Inbox group deep-links to triage); `goals` (consumes `useGoals` for the tree and quick-create); `paths` (consumes `usePaths` for sections and order); `today` (shared `scheduledDate` semantics and schedule dialog); `winlog` (completing a row moves its Win).
**Design priority**: Medium — wide surface but low structural risk: it introduces no entities and every write rides an existing hook. The design work is scannability (grouping, sorting, date chips) and frictionless quick-add.

---

### app-shell
**Type**: Generic
**Description**: Navigation between modules, the composed landing screen, the Dexie / LocalStorage persistence layer, and settings (Unsplash API key, export). Single role — `Owner` — no auth.
**Entities**: none
**Key Actions**: Navigate, configure settings.
**Connects to**: every module (hosts them).
**Design priority**: Low — mostly handled by `proto-highlevelui` and `proto-devsetup` before module design starts. No novel design problem beyond choosing the navigation pattern.

---

### data-sync
**Type**: Infrastructure (added after the original 7 — ADR 0023)
**Description**: Optional cross-device data movement via Dexie Cloud (the same service + addon as the `dopadone` project). LocalStorage stays the app's source of truth; a Dexie mirror of the four entity collections is the sync transport. Sync is manual and directional — the user explicitly picks push (overwrite the server with this device's data) or pull (overwrite this device with the server's); nothing merges. Email-OTP sign-in, no passwords.
**Entities**: none stored of its own — mirrors `Path`, `Goal`, `Action`, `Vision` rows in the `bricks` Dexie DB.
**Key Actions**: Connect a database URL, disconnect, sign in via OTP, sign out, push to server, pull from server.
**Connects to**: every entity-owning module (reads their LocalStorage collections wholesale — `paths`, `goals`, `actions`, `visions`); `app-shell` (footer secondary-nav entry, route `/data-sync`).
**Design priority**: Low — settings-level surface, one page; the design risk is honest destructive-action communication (both directions lose data), handled with explicit confirm dialogs.

---

## Integration Map

```mermaid
graph LR
    PATHS[paths] -->|embeds Vision summary + achievement counts; seeds achievement tiles| VISION[vision]
    PATHS -->|lists / hosts Goals| GOALS[goals]
    PATHS -->|embeds WinBalance / WinKindBadges| WINLOG[winlog]
    CAPTURE[capture-triage] -->|assign / promote to Goal| GOALS
    CAPTURE -->|assign standalone| PATHS
    CAPTURE -->|triaged Actions become schedulable| TODAY[today]
    GOALS -->|scheduled Actions| TODAY
    GOALS -->|achieving a Goal creates a Win| WINLOG
    TODAY -->|completing an Action creates a Win| WINLOG
    TODAY -->|sections grouped by Path| PATHS
    ACTIONS[actions] -->|reads/writes via useActions| CAPTURE
    ACTIONS -->|reads Goals, quick-create| GOALS
    ACTIONS -->|reads Paths + order| PATHS
    ACTIONS -->|completing a row creates a Win| WINLOG
    VISION -->|Unsplash key| SHELL[app-shell]
    SHELL -->|hosts + navigates| PATHS
```

## Prototyping Order

1. **paths** — everything else attaches to `Path`; nothing is usable without it. Establishes the container model and the hub screen. Lowest dependency, highest downstream leverage. (Originally also established `Achievement`s; those moved into `vision` as board tiles — ADR 0037.)
2. **capture-triage** — the entry point for every `Action`. Introduces the `Action` entity and its assignment logic. Relatively self-contained and testable in isolation.
3. **goals** — needs `Path`. Completes the "where does this belong" picture that triage feeds into; Actions become properly homed.
4. **today** — needs Actions that are homed and schedulable. This is the heart of daily use and where the completion flow is born.
5. **winlog** — needs real completed Actions / achieved Goals to show anything meaningful. Build once the completion flows in `today` and `goals` exist.
6. **vision** — rich but independent of the value loop. Slot in last so craft effort doesn't delay proving the core.
7. **actions** — planned via proto-feature after the loop shipped (docs/changes/actions-page.md). Depends on all entity-owning modules existing; adds no entities, so it slots in cleanly once the hooks it consumes are stable.

`app-shell` is set up by `proto-devsetup` + `proto-highlevelui` before step 1.

## Priority Areas

- **today**: The information hierarchy is the product. Per-Path sectioning, "what's valuable" vs "what's a frog" signalling, day-focus vs full-list — get this wrong and the daily ritual doesn't stick. Most design attention.
- **winlog**: The differentiator. The win balance and the framing of accumulating wins must feel genuinely rewarding, not like a stats page. Emotional design risk.
- **capture-triage**: The most novel interaction — card-by-card processing to escape decision paralysis. No obvious reference in mainstream goal apps. Also the future home of `PairwisePrioritization`, so leave room for it.
- **goals**: Structurally the most complex module — self-referential tree, manual priority ordering, frog propagation, achieve/abandon/reactivate lifecycle, move-between-Paths. High risk of an over-complicated UI.
- **vision**: Highest raw craft effort (block editor + gallery + Unsplash + export), but lower risk to the core loop. Budget time, not worry.

## Open strategic questions

- ~~Whether `WinLog` history survives deletion of the underlying Action~~
  Resolved (proto-detail, winlog, 2026-09-04): it does not — `WinLog` is a
  live derived read with no stored ledger, so deleting (or un-completing) the
  source Action/Goal removes its Win immediately. See ADR 0013.
- **Unresolved from `proto-deepen`**, carried forward: exact `Action` fields
  beyond name; `PairwisePrioritization` scope (Goals-in-Path vs Actions); how
  "openness / API" manifests in a local prototype.
- `app-shell` navigation pattern (sidebar of Paths? top-level tabs for Today / Paths / Inbox / Log?) is deferred to `proto-highlevelui`.
