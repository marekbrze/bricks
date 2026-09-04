# Domain Glossary

Terms and concepts specific to this project. Used across all project skills to
maintain consistent language. **The project — code, UI, and docs — is written in
English.** The first column keeps the original Polish term as it came up in the
interview, so the mapping stays traceable; everything the product ships uses the
Code Name.

| Term (PL, from interview) | Code Name | Definition | Avoid saying |
|---|---|---|---|
| Droga | `Path` | Top level of the hierarchy — a long-term direction in life (e.g. the sport path, the earnings path). Holds one Vision, a list of execution Goals, and assigned Actions. | "project", "category", "area" as a separate entity |
| Wizja | `Vision` | The picture of the future for a Path: a container of short notes and image tiles (Notion-like), not one long document. One Vision per Path. Export merges the tiles into a single markdown document. | "goal", "Path description", "one document" |
| Notatka wizji | `VisionNote` | A short text block in the Vision (how I want to feel, small things). Deliberately small — no editing one giant wall of text. | "description", "vision document" |
| Kafelek zdjęcia | `VisionImage` | A photo tile on the Vision board — a separate entity from notes, forming a gallery. From upload or fetched from Unsplash. | "note attachment" |
| Rzecz po drodze / osiągnięcie | `Achievement` | Something to reach along a Path — order-independent, not a task and not requiring hard actions (e.g. "I can do a pull-up", "muscle-up", "100 push-ups"). Hangs directly off the Path. State `open` ↔ `achieved` is reversible. | "milestone" (sounds sequential), "execution goal", "task" |
| Cel egzekucyjny | `Goal` | A concrete sub-goal with an execution layer — contains tasks and needs concrete actions. Always one Path, a tree of sub-goals, manual priority order, optional deadline with a days-remaining countdown. Achieved manually. States: `active` / `achieved` / `abandoned`. | "vision", "achievement", "dream" |
| Zadanie / działanie / akcja | `Action` | An atomic thing to do. Lives in the Inbox, under one `Goal` (max 1), or standalone directly under a `Path`. Movable between Paths / Goals. States: `inbox` / `assigned` / `done` / `abandoned`. `scheduled` = presence of `scheduledDate`. Can be promoted to a `Goal` during triage. | "goal", "project"; don't conflate with `Achievement` |
| Inbox | `Inbox` | A place to quickly capture Action ideas before deciding where they belong. | "task list", "goal backlog" |
| Przegląd inboxa | `Triage` | A dedicated mode for processing the Inbox one item at a time (DoItDone / AutoWork pattern): assign to a Path/Goal or mark standalone, set priority, optionally schedule or discard. | "browsing a list", "sorting" |
| Priorytetyzacja parami | `PairwisePrioritization` | Deferred: pair-by-pair comparisons by `Leverage`. Scope undecided (Goals within a Path vs Actions). Skipped in the first version. | "sorting", "setting importance" |
| Właściciel | `Owner` | The sole user. Full access to everything. No guest / read-only / sharing mode. | "admin", "user" as a separate role |
| Unsplash | `Unsplash` | External photo source for Vision image tiles — search and fetch. Needs an API key; images carry attribution. | — |
| Zwrot z czasu i energii | `Leverage` | Estimated value of an Action relative to the time and energy invested; the basis for prioritization. | "importance", "difficulty", "ROI" without context |
| Żaba | `Frog` | A valuable, unpleasant Action/Goal that must be done to unblock progress ("eat the frog first"). A toggle (star-like) on a `Goal` or `Action`; a frog on a Goal propagates to its Actions. | "hard task", "blocker" |
| Widok Dziś | `TodayView` | The landing screen: sections per Path, each listing Actions with `scheduledDate = today`. A distinct view, not a list. Day navigation (tomorrow, day after, back). | "dashboard", "task list" |
| Widok akcji | `ActionsView` | The flat whole-app task list (Todoist/Things style): every Action grouped Path → Goal → Actions, Inbox group on top, standalone Actions after each section's Goal groups. Quick-add rows create Actions (optional due date) and Goals right from the list. Done/abandoned hidden behind a "Show completed" toggle. Sort within a group: frog-first, then scheduled ascending, then creation order. | "task list", "to-do list", "outliner" |
| Widok harmonogramu | `ScheduleView` | Agenda: day header + tasks, next day header + tasks. Likely its own module later (calendar). | "calendar" (for now) |
| Plan tygodnia | `WeeklyPlan` | Deferred: a soft week-ahead selection of Actions. Not in the first version — `TodayView` + day navigation + `ScheduleView` cover it for now. | "sprint", "deadline" |
| Log / historia małych zwycięstw | `WinLog` | An append-only history of completed Actions and achieved Goals. The main motivational fuel — a counterweight to negative bias. | "journal", "report", "stats" |
| Małe zwycięstwo | `Win` | A single entry in the log: a completed `Action` or an achieved `Goal`. | "task", "event" |
| Wykres kontrybucji | `ContributionGraph` | A GitHub-contribution-graph-style visualization — cumulative wins toward a Goal / Path over time. Emphasis on accumulation, not percent-complete. | "% progress chart", "stats", "burndown" |

**Code Name** is the English name used in code (folders, components, entities,
endpoints) — and, since the whole project is English, in UI copy and docs as well.
The interview is conducted in Polish; nothing Polish reaches the product.

## Design modules

Module names (folder / code namespace) — see `docs/MODULES.md`.

| Module | Role | Scope |
|---|---|---|
| `paths` | Core | Paths + Achievements + the Path hub screen |
| `vision` | Core | Vision board (notes + gallery + Unsplash + export) |
| `goals` | Core | Goal tree, priorities, frog, achieve/abandon |
| `capture-triage` | Core | Inbox + card-by-card review + Action→Goal promotion |
| `today` | Core | Today view per Path, schedule, planning, complete |
| `winlog` | Core | `WinLog` + `ContributionGraph` |
| `actions` | Core | `ActionsView` — flat grouped task list + quick-add |
| `app-shell` | Generic | Navigation, home page, Dexie/LocalStorage, settings |
