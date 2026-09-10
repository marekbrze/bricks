# Feature: Essentials

## Type
Feature (planned by proto-feature)

## User goal
Every Path has a handful of **Absolutely Necessary Deeds** — the small set of
repeatable actions that, done consistently, move that direction of life forward
(Arnold Schwarzenegger's autobiography: every area has a few non-negotiable
things; for a salesperson it's "call clients" every day). The Owner wants to
**define these per Path**, **track them**, and **log each time one is done** —
many times a day if needed. Logging a deed opens a short dialog for a comment and
creates an already-completed `Action`, so an Essential is a **one-tap shortcut
for creating a done Action**. The Path overview shows **how many Essentials the
Owner has completed in total** for that Path; a dedicated **Essentials tab** is
where they're defined and logged.

Chosen name: **Essentials** (entity `Essential`). "AND / absolutnie niezbędne
działanie" from the interview maps to this Code Name.

## MVP scope

Must work:
- **New `essentials` module**, nested under a Path — same pattern as `vision`
  (own entity, own `useEssentials` hook, own `essentials` LocalStorage key, own
  nested route, no top-level nav entry).
- **Essentials tab** on the Path (`/paths/:pathId/essentials`), 4th entry in
  `PathTabs` (Overview · Actions · Vision · **Essentials**):
  - list of `Essential` rows in manual order — each shows its name, an optional
    one-line "why / how" detail, **today's completion count**, and its
    **all-time completion count**;
  - each row has a primary **Log** button → opens **LogEssentialDialog**;
  - header **New essential** (name + optional detail);
  - row overflow: **Edit**, **Move up / Move down** (+ drag), **Delete**;
  - **empty state** explaining the concept, a prominent **Add your first
    essential**, and a few seed examples for inspiration (see "Seed examples").
  - **archived Path → read-only**: no logging, no add, no reorder — a restore
    banner, matching the Vision / Actions tab convention.
- **LogEssentialDialog**: title is the Essential's name; a single optional
  **comment** textarea; **Cancel / Log it**. On submit it creates an `Action`
  that is **already `done`** (`completedAt` = now, `scheduledDate` = null),
  `name` = the Essential's name, `note` = the comment (when non-empty),
  `essentialId` = this Essential. A **toast with Undo** follows ("Logged
  “<name>”").
- **Path overview**: a compact **Essentials** line/section (pattern like the
  **Wins** section) — `N essentials · M completed all-time` (and `· K today`
  when > 0) — linking into the Essentials tab. When the Path has no Essentials
  the section shows a one-line "Define this Path's necessary deeds" link.
- **Cascade**: deleting the Path already removes every `Action` with that
  `pathId` (existing `use-actions` behaviour) — the plan adds the same wipe for
  the Path's `Essential` rows, and the delete-confirmation cascade summary gains
  an **"N Essentials"** count.
- **Storage recovery**: a corrupt `essentials` key shows a dedicated recovery
  screen on the Essentials tab (distinct from the empty state), with a confirmed
  reset — every other module does this.
- **Undo** on log, delete, and reorder (snapshot-restore pattern, as everywhere).

Deferred to "Later":
- **Cadence / targets per Essential** (daily, N×/week) with progress against the
  target — explicitly rejected for now; free tracking only.
- **Essentials in the Today view** — a per-Path daily strip to tick deeds off
  from the daily surface. Out of scope; Essentials live on their own tab.
- **Streaks / a completion heatmap / calendar** per Essential.
- **Editing or deleting a past completion's comment** from the Essentials tab
  (the created `Action` is still editable through the Actions view as normal).
- **Distinguishing Essential completions in the WinLog** (a filter or a badge) —
  MVP lets them count as ordinary small wins.
- **Reordering Essentials across Paths / moving an Essential to another Path.**
- **Seeding Essentials during Path creation** (like the New Path dialog's
  achievement rows) — add later if the empty-state flow proves too slow.

## Impact map
- **New module?**: **yes — `essentials`** (Core). New entity family (`Essential`),
  new per-Path screen, own hook + storage key. Doesn't fit `goals` (execution
  tree + lifecycle) or `paths` (container/hub only); mirrors how `vision` is its
  own module despite living inside a Path.
- **Modules affected**:
  - `essentials` (new) — the entity, the hook, the tab screen, the log dialog,
    the overview summary component it exposes for `paths` to embed.
  - `paths` — `PathTabs` gains a 4th tab; `PathOverviewPage` embeds the
    Essentials summary; `DeletePathDialog` cascade summary gains an Essentials
    count; the Path-delete flow triggers the Essentials wipe.
  - `capture-triage` — `Action` gains `note?: string` and
    `essentialId?: string | null`; `useActions` gains `logEssentialCompletion`.
  - `app-shell` — one nested route `/paths/:pathId/essentials`; `UI-STRATEGY.md`
    updated (PathTabs list + route table).
  - `winlog` — **no code change**, but its derived output changes: Essential
    completions are `done` Actions, so they appear as small wins in the Log and
    in every `WinBalance` scope that covers the Path. Called out below.
- **Cross-module integration** (the risky connection point): the `Action`
  extension in `capture-triage` and `logEssentialCompletion`. Every logged
  Essential is a real completed `Action`, which means:
  - it shows in `WinLog` grouped under today, and bumps the Path's small-win
    count in `WinBalance` / `WinKindBadges` (PathCard, Path overview, Log).
  - **Decision for `proto-detail`**: accept this (an Essential done *is* a small
    win — honest, and the tab's own counter is just a filtered view) **or**
    exclude `essentialId`-tagged Actions from the `useWinLog` derivation.
    Recommended: **accept** — no code in `winlog`, consistent with "accumulation
    is the reward" (DESIGN.md), and the two counters answer different questions
    (WinBalance = everything done; the tab counter = this deed specifically).
  - the created Action has `scheduledDate = null`, so it never appears in the
    Today or Schedule views — only in the Log and the flat Actions view.
  - a dangling `essentialId` (Essential deleted, Action kept) is harmless — the
    Action's own `name` preserves what was done; nothing reads `essentialId`
    except the per-Essential count, which simply stops counting it.
- **Shared-doc additions**:
  - `ENTITY_MAP.md` — new entity **`Essential`**; `PATH ||--o{ ESSENTIAL`;
    soft link `ESSENTIAL ||--o{ ACTION : "logged as"` (via `Action.essentialId`,
    nullable, not a hard FK); note `Action` now also carries `note`.
  - `ACTIONS.md` — new **Essential** section (Create, Edit, Reorder, Delete,
    **Log completion**); `Action` table gains "Log an Essential completion (with
    an optional comment)".
  - `GLOSSARY.md` — **`Essential`** row (PL "AND / absolutnie niezbędne
    działanie / niezbędny czyn"; the ANDs acronym is the origin, `Essential` is
    what ships); mention the seed-example inspiration (Rafał Mazur,
    zenjaskiniowca.pl — primal / natural movement).
  - `UI-STRATEGY.md` — `PathTabs` now Overview · Actions · Vision · Essentials;
    nested route `/paths/:pathId/essentials` in the module route table.

## Per-module changes

### essentials (new module)
- **Data**: new entity **`Essential`** (`extends BaseEntity`):
  - `pathId: string` — owning Path (always exactly one).
  - `name: string` — the deed ("Call five prospective clients").
  - `detail?: string` — optional one-line why/how.
  - `order: number` — manual position within the Path's Essentials.
  - No completion data stored on the `Essential` itself — completions are
    derived by counting `Action`s where `essentialId === essential.id`
    (all-time) and additionally `completedAt` is today (today's count). This
    keeps a single source of truth and makes Undo trivial (delete the Action).
  - Storage key `essentials`, `Essential[]`, default `[]` (clean empty state for
    the production build, like every other module).
- **Actions**:
  - Create Essential (name + optional detail), under one Path.
  - Edit Essential (name, detail).
  - Reorder Essentials (drag + keyboard Move up / Move down), manual order,
    Undo-backed — same shape as `useGoals().reorderGoal` / `reorderAction`.
  - Delete Essential — confirm dialog; **does not** delete past completion
    Actions (they're real wins); Undo-backed.
  - **Log completion** — opens `LogEssentialDialog`; on confirm calls
    `useActions().logEssentialCompletion({ pathId, essentialId, name, note })`;
    Undo toast.
  - `deleteEssentialsForPath(pathId)` — cross-module surface for `paths`'
    cascade delete (mirrors `deleteActionsForGoals`).
  - `essentialCountForPath` / `completionCountsForPath({ total, today })` —
    read surfaces for the Path overview summary and the delete dialog.
- **Screens & flows**:
  - **EssentialsPage** (`/paths/:pathId/essentials`) — contextual header (Path
    name, back to Paths, `PathTabs`), then the Essentials list; **New essential**
    in the header; **EssentialRow** per item (name, detail, `done today ·
    N` / `N total`, **Log** button, overflow menu); empty state; archived →
    read-only banner.
  - **LogEssentialDialog** — `Dialog` (not `AlertDialog`): essential name as
    title, optional comment `Textarea`, Cancel / **Log it**. Dirty-form confirm
    before discarding on Cancel / Escape / backdrop (matches `NewPathDialog`).
  - **EssentialDialog** — create / edit (name + optional detail), same dirty
    guard.
  - **DeleteEssentialDialog** — `AlertDialog`, says past completions are kept.
  - **EssentialsSummary** — the component `paths` embeds on the overview
    (`N essentials · M completed all-time · K today`), exported from this module
    the way `winlog` exports `WinBalance`.
  - **EssentialsDataUnreadable** — recovery screen for a corrupt `essentials`
    key, with a confirmed reset.
  - Nav entry point: the **Essentials** tab in `PathTabs`; also linked from the
    overview summary line.
- **States** (→ harden):
  - empty (no Essentials for this Path) — concept + "Add your first essential" +
    seed examples;
  - an Essential with zero completions ever (`0 total`, no "today" line);
  - all-time count large (thousands) — the number formats without breaking the
    row;
  - long `name` / `detail` — clamp to 2 lines / 1 line, `break-words`;
  - log dialog with an empty comment — allowed (comment is optional);
  - archived Path — read-only tab (banner, no Log / New / reorder / menu);
  - `essentials` LocalStorage write fails — the app-wide storage-failure banner
    already covers this (in-memory for the session);
  - `essentials` value corrupt — `EssentialsDataUnreadable`;
  - deep-link to a deleted `:pathId` — reuse `PathNotFound`;
  - reorder is inert with a single Essential (handle + Move up/down disabled).
- **Edge cases** (user instincts + obvious; → edgecases will find more):
  - logging the same Essential many times in one day — expected; each is its own
    Action, today's count increments, each has its own Undo window;
  - undo of a log — removes exactly that Action (and its Win);
  - deleting an Essential that has completions — completions survive as
    standalone `done` Actions under the Path (their `name` still tells the
    story); the confirm dialog says so;
  - deleting / archiving the Path — Essentials wiped on delete (cascade),
    hidden + read-only on archive;
  - two Essentials with the same name — allowed (personal tool, no uniqueness),
    but each keeps its own count because the link is by `essentialId`, not name;
  - timezone — "today's count" uses the local calendar date (`todayLocalIso`),
    matching `overdueActions` / win-day keys.
- **Design** (respect `DESIGN.md` — calm, stone, no gamification):
  - the row's counters are plain numerals, not badges with flair; **no
    confetti, no streak flames, no "keep it up!"** on logging — the Log toast is
    the same quiet `showToast` every other action uses;
  - the **all-time completed count** on the overview echoes the `WinBalance`
    accumulation framing (the one place distinctiveness is spent) — same visual
    weight and restraint, a count that only goes up;
  - list surface borrows the Things-calm row treatment already used in
    `actions` / `goals` (`GoalRow`, `EssentialRow` should feel identical);
  - → needs `proto-design essentials` then `proto-polish essentials`.

### paths
- **Data**: no new fields on `Path`. `PathCascadeCounts` conceptually gains an
  Essentials count, but it's supplied at the call site (like the achievements
  count already is) rather than stored — `DeletePathDialog` asks `essentials`
  for it alongside.
- **Actions**: Path delete now also wipes the Path's Essentials
  (`deleteEssentialsForPath`), same wiring as the Vision / Goals / Actions
  cascade. No other Path action changes.
- **Screens & flows**:
  - `PathTabs` — add `{ to: '/essentials', label: 'Essentials', icon: <pick>,
    end: false }` as the 4th tab. Icon candidate: `Flame` reads as "streak" and
    is anti-reference; use something neutral — `CheckCheck`, `Footprints`, or
    `Target`.
  - `PathOverviewPage` — render `<EssentialsSummary pathId={path.id} />`
    (from `essentials`) as a section, next to **Wins** (order: Vision → Wins →
    Essentials → Goals, or Vision → Essentials → Wins → Goals — `proto-detail`
    to decide; Essentials-near-Wins keeps the two "count" surfaces together).
  - `DeletePathDialog` — cascade summary line "N Essentials".
- **States**: the overview's Essentials section has its own "no essentials yet"
  one-liner so the hub never looks broken (matches the Vision / Goals
  placeholders).
- **Edge cases**: archived Path overview already renders read-only — the
  Essentials summary shows counts but its link still works (read-only tab).
- **Design**: the new section obeys the overview's existing section rhythm
  (`text-sm font-semibold` heading, same gap) — `proto-design`/`polish` on the
  `paths` overview only if the section needs it; most of the craft is in the
  `essentials` module.

### capture-triage
- **Data**: `Action` (`src/modules/capture-triage/types/action.ts`) gains:
  - `note?: string` — free-text comment. Optional; absent on every existing row,
    no migration. Set by `logEssentialCompletion`; editable later via the
    Actions view (a follow-up, not MVP).
  - `essentialId?: string | null` — soft link to the `Essential` a completion
    was logged from. `null`/absent for every normal Action. Nothing hard-depends
    on it; a dangling value is inert.
- **Actions**: `useActions` gains **`logEssentialCompletion`**:
  ```ts
  logEssentialCompletion(data: {
    pathId: string
    essentialId: string
    name: string
    note?: string
  }): UndoFn
  ```
  Creates an `Action` with `state: 'done'`, `completedAt: now`,
  `scheduledDate: null`, `pathId: data.pathId`, `goalId: null`,
  `frog: false`, `name: data.name.trim()`, `note` (only when non-empty),
  `essentialId: data.essentialId`, `order: undefined`. No-op on an empty name.
  Returns a snapshot-restore `UndoFn` (same contract as `deleteAction` etc.).
- **Screens & flows**: none in this module — it only exposes the method.
- **States / edge cases**: the existing Path-deleted self-heal loop already
  returns orphaned Actions to the Inbox; a `done` Essential-completion Action
  under a live Path is untouched by it. If a completion Action's Path is deleted
  it's wiped by the cascade like any other — correct.
- **Design**: none.

### app-shell
- One nested route registered by the new module (`essentialsRoutes` spread into
  `src/App.tsx`, same as `visionRoutes` / `goalsRoutes`).
- `docs/UI-STRATEGY.md` — `PathTabs` description + the nested-route table.
- No top-level nav slot (still 5 primary destinations).

## Routing — which proto skill builds what
| Step | Skill | Target | What it does |
|------|-------|--------|--------------|
| 1 | proto-detail | `essentials` | Write `docs/modules/essentials.md` (the module spec). Write the shared-doc entries: `ENTITY_MAP.md` (`Essential`), `ACTIONS.md` (Essential section + Action "log completion" row), `GLOSSARY.md` (`Essential`), `UI-STRATEGY.md` (4th PathTab + route). Decide: overview section order; WinLog "accept vs exclude Essential completions" (recommended: accept); PathTabs icon. |
| 2 | (direct edit) | `capture-triage` | Residual #1–#2 below — **must land before step 3**, the lofi screen calls `logEssentialCompletion`. |
| 3 | proto-lofi | `essentials` | Build `EssentialsPage`, `EssentialRow`, `EssentialDialog`, `LogEssentialDialog`, `DeleteEssentialDialog`, `EssentialsSummary`, `useEssentials`, `essentialsRoutes`, Storybook stories, `full`/`minimal` scenario mock data. Reads the spec from step 1. |
| 4 | (direct edit) | `paths`, `app-shell` | Residual #3–#6 — wire the tab, the overview summary, the cascade, the route. Some of this the lofi may do itself (route); the rest is direct. |
| 5 | proto-edgecases | `essentials` | Diagnose the new module's unhandled edge cases against the built screens → `docs/modules/essentials-edgecases.md`. |
| 6 | proto-harden | `essentials` | Implement the empty / read-only / recovery / dirty-guard / undo states from the diagnosis, with stories + a11y checks. |
| 7 | proto-design | `essentials` | On-brand hi-fi for the tab, rows, dialogs, and the overview summary — per `DESIGN.md`. |
| 8 | proto-polish | `essentials` | Final ship pass — contrast, all interaction states, alignment, copy, the counters' typographic weight vs `WinBalance`. |

## Residual — direct edits not covered by a proto skill

1. **`src/modules/capture-triage/types/action.ts`** (end of the `Action`
   interface, ~line 32) — now: interface ends at `order?: number`. Change to:
   add
   ```ts
   /** Free-text comment. Set when the Action was logged from an Essential
    *  (LogEssentialDialog); editable later from the Actions view. Optional —
    *  absent on every pre-Essentials row, no migration. */
   note?: string
   /** Soft link to the Essential this completion was logged from (`essentials`
    *  module). null / absent for a normal Action. Nothing hard-depends on it;
    *  a dangling value is inert. */
   essentialId?: string | null
   ```
   why: the Essential log needs to carry the comment and a back-reference for
   the per-Essential count.

2. **`src/modules/capture-triage/hooks/use-actions.ts`** (next to `createAction`,
   ~line 300, and add to the returned object ~line 470) — now: no
   Essential-aware creator. Change to: add `logEssentialCompletion` as specified
   in the *capture-triage → Actions* section above, and export it in the hook's
   return. why: single owner of `Action` writes; `essentials` must not touch the
   `actions` key directly (same rule `vision` follows for achievements).

3. **`src/modules/paths/components/PathTabs.tsx:15`** — now: `TABS` has 3
   entries (Overview, Actions, Vision). Change to: append
   `{ to: '/essentials', label: 'Essentials', icon: <neutral icon>, end: false }`.
   why: the tab is the feature's primary surface.

4. **`src/modules/paths/components/PathOverviewPage.tsx:124`** — now: renders
   `<PathGoalsSection>` straight after the Wins `<section>`. Change to: insert
   `<EssentialsSummary pathId={path.id} />` (imported from
   `@/modules/essentials/components/EssentialsSummary`) between Wins and
   `PathGoalsSection` (final order per `proto-detail`). why: the overview is
   where the Owner reads "how much I've done" for the Path.

5. **`src/modules/paths/components/DeletePathDialog.tsx`** + its call site in
   `PathOverviewPage.tsx:132-142` — now: cascade counts are
   `{ visionTiles, goals, actions, achievements }`. Change to: add
   `essentials: essentialCountForPath(path.id)` (from `useEssentials`) and a
   summary line in the dialog. why: honest destructive-action communication —
   deleting the Path destroys its Essentials too.

6. **`src/App.tsx:15`** + Path-delete wiring — now: module route spreads end at
   `dataSyncRoutes`; Path delete calls `deletePath(path.id)` only. Change to:
   add `{essentialsRoutes}` to the `<Routes>` block (likely done by proto-lofi),
   and call `deleteEssentialsForPath(path.id)` alongside `deletePath` in the
   overview's `onConfirm` (and any archived-list delete). why: register the
   route; complete the cascade.

## Seed examples (empty-state inspiration, not shipped data)

The Owner writes their own Essentials per Path. The empty state offers a few
starters in the spirit of **Rafał Mazur — "Zen Jaskiniowca" (zenjaskiniowca.pl)**:
primal, natural, everyday movement rather than gym programming. For a **Body /
Sport** Path:

- Hang from a bar — 60 seconds total across the day
- Walk barefoot outside, even briefly
- Get down to the floor and back up 20 times, no hands
- Carry something heavy for 100 steps
- Hold a deep resting squat — 3 minutes total across the day
- One short all-out sprint
- Crawl for 2 minutes
- 20 minutes of direct daylight before noon
- 5-minute full-body mobility flow
- Screens off 60 minutes before bed

For an **Earnings / Sales** Path (the Schwarzenegger example), the pattern is the
same shape — e.g. "Call five prospective clients", "Follow up every open lead",
"Ask one customer for a referral". `proto-detail` finalises the exact copy and
which Path archetype each seed set attaches to (or whether the empty state just
shows the Body set as a generic illustration).

## Later (deferred)
- Cadence / target per Essential (daily, N×/week) + progress.
- Essentials strip in the Today view for daily check-off.
- Streaks / completion heatmap / calendar per Essential.
- Edit / delete a past completion's comment from the Essentials tab.
- WinLog filter or badge for Essential-sourced wins.
- Move an Essential to another Path; reorder across Paths.
- Seed Essentials during Path creation (New Path dialog rows).

## Hand-off
Run the routing steps in order. Step 2 (the `capture-triage` residual) must land
before step 3 (`proto-lofi essentials`). This doc is the base each skill reads.
