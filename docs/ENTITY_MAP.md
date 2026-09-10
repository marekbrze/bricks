# Entity Map

Single role: **Owner** (the sole user). Everything below is owned by the Owner; there is no sharing or collaboration.

## Diagram

```mermaid
erDiagram
    OWNER ||--o{ PATH : owns
    PATH ||--|| VISION : "has one"
    PATH ||--o{ GOAL : "has"
    PATH ||--o{ ESSENTIAL : "has"
    PATH ||--o{ ACTION : "scopes standalone"
    VISION ||--o{ VISION_NOTE : contains
    VISION ||--o{ VISION_IMAGE : contains
    VISION ||--o{ VISION_ACHIEVEMENT_TILE : contains
    GOAL ||--o{ GOAL : "has subgoal"
    GOAL ||--o{ ACTION : contains
    ESSENTIAL ||--o{ ACTION : "logged as (soft link)"
    ACTION }o--o| GOAL : "assigned to (max 1)"
```

Derived views (not stored entities): **WinLog** (with its `WinBalance` / `WinKindBadges` summaries) — computed from `Action.completedAt` / `Goal` achievement, split into small wins (completed Actions) and big wins (achieved Goals). The former `ContributionGraph` embeds were removed (ADR 0039). The **ActionsView** (`actions` module) is likewise derived — a grouped read of `Path` → `Goal` → `Action` (plus Inbox items), writing only through the owning modules' hooks; no stored state of its own.

Relationship notes:
- An `Action` lives in exactly one of three places: the **Inbox** (no Path, no Goal), directly under a **Path** (standalone), or under a **Goal**. It never belongs to more than one `Goal`.
- A `Goal` always belongs to exactly one `Path` and may nest into a tree of sub-`Goal`s.
- An `Essential` always belongs to exactly one `Path`. Logging an Essential creates a standalone, already-`done` `Action` under that Path carrying `essentialId` — a **soft link**, not a hard FK: deleting the Essential leaves the Action (its `name` preserves what was done) and only stops the per-Essential count. Per-Essential completion progress is **derived** by counting these Actions; nothing is stored on the `Essential`.
- A `Vision` is a 1:1 container for a `Path`; it holds an ordered mix of `VisionNote`, `VisionImage`, and `VisionAchievementTile` tiles.
- Achievements are Vision tiles (ADR 0037) — they hang off the Path's Vision, not the Path record. Creating a Path can seed them through `useVision`.

## Entities

### Path
**Description**: Top-level, never-ending direction of life (the sport path, the earnings path). The container everything else sits under.
**Instances per user**: Many (a handful active at a time).
**Ownership**: Owner.
**Lifecycle**: Created with a name (the New Path dialog's achievement rows seed achievement tiles onto the new Vision). Never "completed". Can be archived, then deleted. **Deleting a Path cascades** — removes its Vision (with all its tiles, achievements included), Goals and Actions — behind a confirmation dialog ("are you sure?").
**States**: `active` → `archived` (reversible) → *deleted*.
**Contains**: one `Vision`, many `Goal`, many standalone `Action`.
**Belongs to**: Owner.

### Vision
**Description**: The picture of the future for a Path — a Notion-like collection of short notes, image tiles, and achievement tiles rather than one long document. Exportable: tiles merge into a single markdown document.
**Instances per user**: One per Path.
**Ownership**: Owner.
**Lifecycle**: Exists for the life of the Path (created lazily when the Owner first adds to it; eagerly when Path creation seeds achievement tiles). Dies with the Path.
**States**: none (always editable).
**Contains**: many `VisionNote`, many `VisionImage`, many `VisionAchievementTile` (one shared order).
**Belongs to**: `Path`.

### VisionNote
**Description**: A short text block in the Vision (how the Owner wants to feel, small things they want, fragments). Kept small on purpose — no need to keep editing one big text.
**Instances per user**: Many per Vision.
**Ownership**: Owner.
**Lifecycle**: Created, edited, reordered, deleted freely.
**States**: none.
**Contains**: —
**Belongs to**: `Vision`.

### VisionImage
**Description**: A photo tile on the Vision board — a separate item from notes, forming a gallery. Sourced from local upload or fetched from Unsplash.
**Instances per user**: Many per Vision.
**Ownership**: Owner (Unsplash images carry attribution).
**Lifecycle**: Added, reordered, removed.
**States**: none.
**Contains**: —
**Belongs to**: `Vision`.

### VisionAchievementTile
**Description**: A thing to reach "along the way", living on the Vision board as a tile (ADR 0037, moved off the Path record) — order-independent, not a task and not requiring concrete actions ("I can do a pull-up", "muscle-up", "100 push-ups"). Renamed from "Milestone" because milestones read as sequential; these are not. Ticked in place on the board.
**Instances per user**: Many per Vision.
**Ownership**: Owner.
**Lifecycle**: Added from the board's Add menu (often seeded during Path creation), edited inline, reordered with the board's shared order, ticked/unticked, deleted with the tile menu.
**States**: `open` ↔ `achieved` (with a date; **reversible** — mistakes happen; re-ticking after a mistaken un-tick stamps today, matching the Goal/Action convention).
**Contains**: —
**Belongs to**: `Vision`.

### Essential
**Description**: An **Absolutely Necessary Deed** for a Path — a repeatable, non-negotiable action the Owner commits to keep doing (Schwarzenegger's autobiography: every area of life has a few; a salesperson's "call clients", a body Path's "hang from a bar"). Habit-like, but with **free tracking** — no cadence target, no streak. Defined once per Path, then logged each time it's done (many times a day is fine). Not a `Goal` (no end, no tree) and not a `VisionAchievementTile` (not a one-time "I can do X").
**Instances per user**: Many per Path (a handful active per Path).
**Ownership**: Owner.
**Lifecycle**: Created with a name + optional one-line detail. Edited, reordered (manual `order` within the Path), deleted. Deleting it keeps the completion `Action`s it produced. Dies with the Path (cascade).
**States**: none — always loggable while its Path is active; read-only while the Path is archived.
**Contains**: —
**Belongs to**: `Path`.
**Progress**: derived, not stored — count of `Action`s whose `essentialId` is this Essential (all-time), and of those with today's `completedAt` (today's count).

### Goal
**Description**: An execution-oriented sub-goal with a work layer — contains tasks and needs concrete actions to move forward. Distinct from Vision and from Achievement.
**Instances per user**: Many per Path, shown in a manual priority order (not sequential).
**Ownership**: Owner.
**Lifecycle**: Created with name + description + optional deadline (with a days-remaining countdown). Achieved manually (not auto when all tasks done). Can be abandoned instead.
**States**: `active` → `achieved` (with date) | `abandoned`.
**Contains**: sub-`Goal`s (tree), many `Action`.
**Belongs to**: `Path` (always exactly one); optionally a parent `Goal`.
**Flags**: `frog` — marking a Goal as a frog marks all its Actions as frogs too.

### Action
**Description**: An atomic thing to do. Just a name (plus an optional free-text `note`); estimated time/energy, richer fields come later.
**Instances per user**: Many.
**Ownership**: Owner.
**Lifecycle**: Captured (often into the Inbox), triaged (assigned to a Path/Goal, or promoted into a `Goal` if it turns out to need many actions), optionally scheduled to a day, completed or abandoned. Abandoned Actions are reviewed later and then finally deleted.
**States**: `inbox` → `assigned` → `done` (with `completedAt`) | `abandoned`. "Scheduled" is not a state — it is the presence of `scheduledDate`. "Overdue" is likewise derived, not stored — an `assigned` Action whose `scheduledDate` is before today; the Today view buckets these above its Path sections and offers a one-tap "move all to today" (ADR 0045).
**Contains**: —
**Belongs to**: exactly one of — nothing (`inbox`), a `Path` (standalone), or a `Goal` (max one). Movable between Paths and Goals.
**Flags**: `frog`; `scheduledDate`; `completedAt`; `order` — optional manual position among its Goal's own Actions, read only on the Goal progress page (ADR 0042); aggregate views keep their automatic sort, and rows without it (legacy) sort after sequenced siblings by creation order.
**Optional fields**: `note` — free-text comment, set when the Action was logged from an `Essential` (editable later from the Actions view); `essentialId` — soft link to the `Essential` a completion was logged from (null/absent otherwise; a dangling value is inert). Both absent on every pre-Essentials row — no migration.

A **logged Essential completion** is an `Action` created directly in the `done` state (`completedAt` = now, `scheduledDate` = null, `goalId` = null, standalone under the Path, `essentialId` set). It behaves as any completed Action from then on — it feeds `WinLog` as a small win (ADR 0051, accepted not suppressed) and shows in the flat Actions view; it never enters Today/Schedule (no `scheduledDate`).

## Derived views

### WinLog
Append-feeling history of completed `Action`s and achieved `Goal`s, ordered by completion date. Un-checking an Action removes it from the log; deleting the Action removes it from history (see Open Questions in PROJECT.md — whether history should survive deletion is unresolved).

### WinBalance / WinKindBadges
The win summary pair (ADR 0039): small wins (completed Actions, checkmark icon) and big wins (achieved Goals, trophy icon), each with its count — a block (`WinBalance`) on the Log / Path overview / Goal progress, an inline line (`WinKindBadges`) on day-group headers and PathCards. Honest zeros. Emphasis on accumulation ("how much I've already done"), not percent-complete.
