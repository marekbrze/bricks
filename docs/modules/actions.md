# Actions View

## Vision

One page where every Action in the app lives, ordered and grouped the way the Owner thinks
about work: Path by Path, and inside a Path under the Goal each Action serves. Todoist/Things
energy — a scannable list, not a tree to maintain. Today answers "what do I do now"; the
Actions View answers "what exists, and where does it belong". Adding must be frictionless:
type a name, optionally pick a date, Enter. A Goal is created just as casually — right from
the section it belongs to.

## User Flows

### Browse the list

1. User clicks **Actions** in the nav (5th entry) → `/actions`.
2. Top of page: title + a **Show completed** toggle (visible once anything done/abandoned exists).
3. If the Inbox holds anything, an **Inbox group** renders first — each item hinted
   "needs triage", linking to `/capture-triage`. No quick-add inside this group.
4. One **section per active Path** (nav order). Each section shows:
   - Goal groups in manual priority order — goal name (+ deadline countdown chip, frog star);
     sub-Goals render as nested sub-groups under their parent, in priority order.
   - Under each group, that Goal's open Actions.
   - After the Goal groups, the Path's **standalone Actions** (`goalId === null`) under a
     "Standalone" sub-header.
   - Goals marked `achieved`/`abandoned` that still hold open Actions render **collapsed and
     dimmed at the bottom** of the section, header struck-through; expanding reveals their
     Actions. Inactive Goals with no open Actions don't render at all.
5. Within a group, Actions sort **frog-first**; then Actions with a `scheduledDate`
   (ascending by date); then the rest by creation order. Completed/abandoned items render in
   place when "Show completed" is on — struck-through, dimmed.

### Quick-add an Action

1. At the bottom of every Goal group and of the Standalone group sits an inline quick-add
   row ("Add action…").
2. User types a name. Optional: clicks the calendar icon → menu with **Today / Tomorrow /
   In a week / Pick a date…** — the last opens a small dialog with a free date input.
   Default: no date.
3. Enter (or the Add button) creates the Action — `assigned` to that Goal, or standalone to
   the Path — and clears the input for the next one. The row stays focused for rapid entry.
4. The new Action appears at its sorted position (frog-first / scheduled / insertion).

### Quick-create a Goal

1. Each Path section header carries a "New goal" affordance.
2. Opens a small dialog: name (required) + optional deadline. Creates a top-level `active`
   Goal under that Path, in last priority position.
3. The new Goal's group appears in the section with its own quick-add row focused.

### Complete / un-complete

1. Checkbox on each Action row. Checking sets `done` + `completedAt` (feeds WinLog /
   ContributionGraph) — the row fades out of the default view (hidden unless "Show completed").
2. Un-checking (via "Show completed") reverts to the previous state and removes the Win.
3. Overflow menu per row: Schedule… (reuses the schedule dialog), Unschedule, Rename, Toggle
   frog. Completed rows offer only Un-complete.

## Screens (rough)

- **ActionsPage** (`/actions`): single scrolling page. Header (title + Show completed
  toggle) → Inbox group (conditional) → one section per Path. Each row: checkbox, name,
  frog star, date chip ("Today"/"Tomorrow"/date or countdown-style label for overdue),
  one-click **add-to-today** button (the view's most frequent action — hover-revealed on
  desktop, always visible on touch; hidden when the row is already on today), overflow menu.
  Group headers carry the quick-add row; Path headers carry "New goal".

## Actions

| Action | Description | Entity | Notes |
|--------|------------|--------|-------|
| Open Actions view | Navigate to the flat grouped list | — | 5th nav entry, `/actions` |
| Quick-add Action (Goal) | Inline add assigned to a Goal, optional due date | Action | `state: 'assigned'`, inherits Goal's Path |
| Quick-add Action (standalone) | Inline add directly under a Path | Action | `goalId: null` |
| Quick-create Goal | Name + optional deadline from a Path section header | Goal | Top-level, last in priority order |
| Complete / Un-complete | Checkbox toggle, feeds WinLog | Action | Existing actions, list-view affordance |
| Schedule / Unschedule | Set or clear `scheduledDate` from row menu | Action | Reuses today's schedule dialog |
| Rename Action | Edit name from row menu | Action | Existing "Edit Action" |
| Toggle frog | Star toggle per row | Action | No propagation upward (that stays Goal-side) |
| Show completed | Toggle done/abandoned visibility | — | View-local, not persisted (prototype) |

## Edge Cases

Hardened against docs/modules/actions-edgecases.md — all 8 gaps closed (ADR 0022).

- **Empty app (no Paths)**: guided empty state — "Create your first Path" (link to `/paths`),
  no sections.
- **Path with nothing in it**: section renders with just the quick-add rows and "New goal" —
  never an empty shell with no way forward.
- **All clear**: a group where every Action is done/abandoned and hidden shows a dimmed
  "All clear" line instead of disappearing (the group header still anchors the list).
- **Inactive Goal with open Actions**: collapsed, dimmed, struck-through header at the bottom
  of its section (decided — see ADR 0020).
- **Orphaned Action** (`goalId` points at a deleted Goal): surfaced in a dimmed "Unassigned"
  fallback group under the Inbox, obeying the Show-completed toggle, rendered as full
  actionable rows — nothing silently vanishes and the list is never a dead end.
  `useActions` self-heal still runs underneath for Path orphans.
- **Inbox items**: shown but locked to "needs triage" — no quick-add, no schedule from here;
  assignment belongs to triage.
- **Quick-add validation**: empty/whitespace name → no-op (input just stays); Enter with only
  spaces doesn't create an Action.
- **Storage corruption / unreadable data**: reuse the `*DataUnreadable` banner + reset pattern.
- **Overdue dates**: a `scheduledDate` before today renders as an overdue chip (red-ish) on
  active rows only — abandoned rows show just the "abandoned" tag.
- **Schedule safety**: Schedule and Unschedule toasts both carry Undo restoring the previous
  `scheduledDate`.
- **Collapse persistence**: per-Goal expand/collapse overrides persist in LocalStorage
  (`actions-group-visibility`); default is expanded unless the Goal is inactive.
- **Narrow widths**: the quick-add row wraps — the date chip drops under the input instead of
  squeezing it.
- **Mobile**: 5 bottom tabs at ~360 px — tighter spacing, labels stay; quick-add rows remain
  reachable (inline, not behind a FAB) in MVP.

## Integration Points

- **capture-triage**: consumes `useActions` (owner of the `Action` entity) for reads and
  writes; Inbox group deep-links to `/capture-triage`.
- **goals**: consumes `useGoals` for the Goal tree and priority order; quick-create Goal goes
  through the shared goals hook (same validation, same storage).
- **paths**: consumes `usePaths` for active Paths and nav order; empty-app state links here.
- **today**: shares `scheduledDate` semantics — the date popover and schedule dialog use the
  same date helpers; completing here feeds the same WinLog.
- **winlog**: completing/un-completing a row immediately moves/removed its Win.
