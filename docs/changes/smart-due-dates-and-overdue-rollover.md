# Feature: Smart due dates + overdue rollover

## Type
Feature (planned by proto-feature)

## User goal
Setting the day an Action is due should take one tap — Today, Tomorrow, this
weekend, next week — the way Todoist / Things / TickTick do it. And overdue
Actions should be easy to pull onto today in bulk, from the Today view, instead
of rescheduling them one at a time.

## MVP scope

**In:**

1. **`SchedulePopover`** — one shared date-setter, replacing every ad-hoc date
   menu in the app. Quick rows + an inline month calendar:
   - **Today**, **Tomorrow**, **This weekend** (the coming Saturday),
     **Next week** (the coming Monday), **In a week** (today + 7 days),
     **No date** (clear — shown only when a date is currently set).
   - Each quick row shows its resolved day on the right ("Sat", "Mon 15",
     "Tue 16") — Todoist-style, so the shortcut is never a mystery date.
   - Smart hiding: **This weekend** is hidden on Saturday and Sunday (it would
     resolve to today / the past). **Next week** always shows.
   - An inline **`react-day-picker`** month grid below the quick rows for any
     other date. No free-typing / natural language in MVP.
2. **New shared date helpers** in `src/shared/lib/date.ts`:
   `comingSaturdayIso`, `comingMondayIso`, and a short weekday/day label helper
   for the quick-row right-hand text. All local-calendar-date, never UTC.
3. **Adopt `SchedulePopover` everywhere `scheduledDate` is set:**
   - `actions` — `QuickAddActionRow` (replaces its inline dropdown + date
     dialog), `ActionRowItem` row menu "Schedule… / Reschedule…".
   - `today` — `ActionOverflowMenu` "Move to another day",
     `ScheduleActionDialog` callers (TodayPage move, SchedulePage,
     ReviewAbandonedPage), `use-action-row-actions`.
   - `goals` — `GoalProgressPage` inherits it for free through the reused
     `QuickAddActionRow`.
4. **Overdue section on the Today view** (only when the viewed day *is* today):
   - A section **above** the per-Path sections: heading "Overdue" + count, a
     **"Move all to today"** button, and one row per overdue Action showing its
     original (red) date chip, a checkbox, and a per-row **Reschedule** opening
     `SchedulePopover`.
   - `useActions` gains an `overdueActions` selector
     (`state === 'assigned' && scheduledDate && scheduledDate < today`) and a
     `rescheduleOverdueToday(): UndoFn` bulk write — one snapshot, one toast
     with **Undo** restoring every moved row.
   - Not shown on any past / future day navigated to.
   - `scheduledActionsForDate` stays an exact-date match — overdue is a
     deliberately separate bucket, never silently folded into "today".

**Later (deferred):**
- Recurring / repeating dates.
- Time-of-day on `scheduledDate`.
- Natural-language date entry ("next fri", "in 3 days").
- Per-Path overdue grouping and per-Path "move all".
- An overdue badge / count on the Today nav item.
- A "postpone all to tomorrow" / snooze-all counterpart.
- A Things-style setting: Today auto-absorbs overdue with no button.
- Auto-rollover of overdue at local midnight (MVP recomputes on render/nav
  only — a page left open across midnight can show a one-day-stale bucket,
  consistent with the existing "no special past mode" decision in
  `docs/modules/today.md`).

## Impact map

- **New module?**: no — extends `today` and `actions`; a hook-only change in
  `capture-triage`; `goals` inherits with no edit; one new `shared` component +
  helpers + one dependency.
- **Modules affected**:
  - **`today`** — new Overdue section + bulk "Move all to today" on
    `TodayPage`; its date menus/dialogs swap to `SchedulePopover`.
  - **`actions`** — `QuickAddActionRow` and `ActionRowItem` adopt
    `SchedulePopover`; `scheduledDateChip` / list sort unchanged.
  - **`capture-triage`** — `useActions` gains `overdueActions` +
    `rescheduleOverdueToday`; **no entity or field change**.
  - **`goals`** — none directly; `GoalProgressPage` gets the richer quick-add
    through the verbatim-reused `QuickAddActionRow` (ADR 0041).
  - **`shared`** — new `SchedulePopover.tsx`, new `date.ts` helpers, new
    `react-day-picker` dependency.
- **Cross-module integration (riskiest point)**: `SchedulePopover` lives in
  `src/shared/components/` and is consumed by three modules. It must depend
  **only** on `@/shared/lib/date` and `@/components/ui/*` — never import from a
  module — or it creates a cycle (`actions` → shared → `actions`). The second
  risk is the `rescheduleOverdueToday` bulk write + Undo: the snapshot/restore
  must follow the existing `restoreSnapshot(snapshot)` pattern exactly and
  cover precisely the rows it changed.
- **Shared-doc additions**:
  - `ACTIONS.md` — add "Move overdue Actions to today" under
    *Today / Schedule views*; amend "Schedule Action" to note the quick
    options + shared popover.
  - `ENTITY_MAP.md` — under **Action**, note that *overdue* is a derived
    condition (`scheduledDate < today` while `assigned`), not a stored field or
    state.
  - `GLOSSARY.md` — new Code Names: `SchedulePopover`, `Overdue` (+ optionally
    `OverdueRollover` for the bulk action).
  - `UI-STRATEGY.md` — the Today view gains an Overdue section (no new route,
    no new nav entry).

## Per-module changes

### shared

- **Data**: none.
- **New component**: `src/shared/components/SchedulePopover.tsx`.
  - Props (sketch): `value: string | null`, `onChange: (iso: string | null) => void`,
    `align?: 'start' | 'end'`, `trigger?: ReactNode` (so callers keep their own
    chip / icon button), and a way to render inside a dialog body vs. as its own
    popover (`asPopover?: boolean` or a separate `SchedulePopoverContent`).
  - Content: a `role="menu"` list of quick rows (label left, resolved day
    right), a separator, then the `react-day-picker` `DayPicker` (single mode,
    `selected` = parsed `value`, `onSelect` → `onChange(toIso(day))`).
  - Keyboard: quick rows are menu items (arrow/enter); the calendar keeps
    `react-day-picker`'s own grid keyboard model. Focus starts on the first
    quick row.
- **New helpers** in `src/shared/lib/date.ts`:
  - `comingSaturdayIso(fromIso = todayLocalIso()): string` — the first Saturday
    strictly after `from` (1–7 days forward). The popover hides "This weekend"
    on Sat/Sun anyway, so the strict-forward rule is only a safety net.
  - `comingMondayIso(fromIso = todayLocalIso()): string` — the first Monday
    strictly after `from` (1–7 days forward).
  - `shortDayLabel(iso): string` — "Sat", "Mon 15" style, for the quick-row
    right column (distinct from `formatDayLabel`, which yields "Today"/"Tomorrow").
- **Dependency**: add `react-day-picker` (pin a v9 line). Style with existing
  Tailwind tokens; avoid importing its stylesheet if the class API covers it,
  otherwise inline the minimal needed rules.
- **States**: none of its own (stateless controlled component).
- **Edge cases**: `value` that fails `isValidIso` → treat as no selection;
  calendar navigating years ahead is fine (matches `formatDayLabel`'s year
  handling); popover opening near the viewport edge (day-picker + Radix/base-ui
  popover already handle collision).
- **Design**: `--popover` surface, `--muted` hover on rows, `--primary` for the
  selected calendar day, `--destructive`-tinted nothing here; motion 200ms
  fade + 2–4px translate per `DESIGN.md`. Needs `proto-design` + `proto-polish`.

### today

- **Data**: none stored. Consumes `overdueActions`, `rescheduleOverdueToday`,
  plus the existing `scheduleAction` for per-row reschedule.
- **Actions**: "Move all overdue to today" (bulk, one Undo toast); per-row
  "Reschedule" via `SchedulePopover`; per-row complete (existing).
- **Screens & flows**:
  - `src/modules/today/components/TodayPage.tsx` — render
    `{date === todayLocalIso() && overdueActions.length > 0 && <OverdueSection … />}`
    directly above the `activePaths.map(...)` block (around line 143). The
    Today-wide "nothing scheduled" empty state (line 131) must still count
    overdue as "the day isn't actually empty" — show the Overdue section even
    when `dayActions.length === 0`.
  - **New** `src/modules/today/components/OverdueSection.tsx` — heading + count,
    "Move all to today" `Button`, list of rows. Reuse `ActionRow` (today) where
    possible; it needs a new optional `onReschedule` + a visible date chip
    (today's `ActionRow` has no chip — add one, red when overdue).
  - `src/modules/today/components/ActionOverflowMenu.tsx` — "Move to another
    day" opens `SchedulePopover` rather than routing to `ScheduleActionDialog`.
  - `src/modules/today/components/ScheduleActionDialog.tsx` — either (a) embed
    `SchedulePopoverContent` in its body and keep the dialog shell for
    ReviewAbandonedPage / SchedulePage, or (b) retire it and have each caller
    mount the popover. Detail decides; (a) is lower-churn.
- **States**:
  - Overdue present → section renders; **no empty state** (absent = nothing
    overdue).
  - After "Move all to today" → section unmounts, toast "N moved to today"
    with **Undo**.
  - Single overdue row → section still renders (heading reads "1 overdue").
  - Overdue row completed in place → drops out of `overdueActions` (it's
    `done`), stays a Win on its `completedAt` day. No toast beyond the normal
    "done".
- **Edge cases**:
  - Viewing a past / future day → section hidden.
  - Overdue Action on an archived Path → excluded (filter to `activePaths`,
    though the `useActions` self-heal already returns orphaned Actions to the
    Inbox).
  - Overdue **and** frog → frog flame still shows; sort frogs first within the
    section.
  - "Move all" with a large list → single `setActions`, no per-row toast.
  - Local midnight passes while the page is open → bucket is one day stale
    until re-render / day-nav; documented, not fixed in MVP.
  - Undo after "Move all" then the user also completed one of the moved rows →
    `restoreSnapshot` puts everything back to the pre-move list, including
    un-completing that row; acceptable (matches other snapshot Undos).
- **Design**: Overdue heading uses an attention tone (not full destructive);
  date chips reuse `scheduledDateChip`'s overdue styling
  (`bg-destructive/10 text-destructive`). `proto-design` + `proto-polish`.

### actions

- **Data**: none.
- **Screens & flows**:
  - `src/modules/actions/components/QuickAddActionRow.tsx` — delete the inline
    `DropdownMenu` (lines ~63–90) and the `Dialog` "Pick a due date" (lines
    ~116–158); render `<SchedulePopover value={scheduledDate} onChange={setScheduledDate}
    trigger={<the existing CalendarPlus ghost button/>} />`. Keep the
    `flex-wrap` chip + "Clear due date" behavior (the chip can stay, or fold
    into the popover trigger's label).
  - `src/modules/actions/components/ActionRowItem.tsx` — the menu's
    "Schedule… / Reschedule…" item (line ~231) triggers the popover instead of
    the dialog. "Unschedule" stays.
  - `src/modules/actions/hooks/use-action-row-actions.tsx` — replace the
    `ScheduleActionDialog` mount (line ~124) with the popover flow; **keep** the
    "Undo restores the previous `scheduledDate`, including none" behavior
    (edgecases #5).
- **States**: popover opening within a long scrolling grouped list — collision
  handling from the popover primitive.
- **Edge cases**: chip wrapping at narrow width is preserved; a `done` row still
  offers no scheduling (unchanged).
- **Design**: trigger stays the `CalendarPlus` ghost icon, tinted when a date
  is set. `proto-design` + `proto-polish` alongside `today`.

### capture-triage (hook only)

- **Data**: no entity / field change.
- **New in `src/modules/capture-triage/hooks/use-actions.ts`**:
  - `overdueActions` (memo, near `unscheduledActions` ~line 296):
    `actions.filter(a => a.state === 'assigned' && a.scheduledDate && a.scheduledDate < todayLocalIso())`
    sorted `scheduledDate` asc, then `createdAt` asc. Frog-first ordering is
    applied by the section, matching the list convention.
  - `rescheduleOverdueToday(): UndoFn` (near `scheduleAction` ~line 216):
    snapshot → map every currently-overdue row to `scheduledDate = todayLocalIso()`
    (state stays `assigned`, `touch` for `updatedAt`) → `restoreSnapshot(snapshot)`.
  - Export both from the hook's return object.
- **Edge cases**: `todayLocalIso()` is read inside the memo body — the memo keys
  on `actions` only, so the bucket doesn't self-update at midnight without a
  re-render; acceptable for MVP (see Later).

### goals

- No code change. `GoalProgressPage` (line ~279) mounts `QuickAddActionRow`
  verbatim and inherits the new popover. Confirm the Storybook story still
  renders and the "hidden while Path archived" guard is unaffected.

## Routing — which proto skill builds what

| Step | Skill | Target | What it does |
|------|-------|--------|--------------|
| 1 | proto-detail | today | Spec the Overdue section, bulk rollover, per-row reschedule, and the shared `SchedulePopover` contract; write the `ACTIONS.md` / `ENTITY_MAP.md` / `GLOSSARY.md` / `UI-STRATEGY.md` entries |
| 2 | (direct edit) | shared | Add `react-day-picker` + the three `date.ts` helpers — see Residual |
| 3 | proto-lofi | today | Build `SchedulePopover` (in `shared`) + `OverdueSection`; add the `useActions` selector + bulk write; swap the date menus in `actions` and `today`. Lead module `today`; the plan lists the `actions` + `shared` files it must also touch, since the shared component can't be built in isolation |
| 4 | proto-edgecases | today | Diagnose the new states (bulk Undo interplay, midnight staleness, archived-Path overdue, large lists, popover-in-scroll, calendar a11y) |
| 5 | proto-harden | today | Implement the decided states |
| 6 | proto-design → proto-polish | today, actions | Hi-fi the popover + calendar + Overdue section to `DESIGN.md` |

## Residual — direct edits not covered by a proto skill

- **`package.json`** — now: no calendar lib. change to: add `react-day-picker`
  pinned to a v9 line (`"react-day-picker": "^9.x"` — pick the current 9.x at
  install). why: inline month calendar in `SchedulePopover`, designer-chosen
  over the native `input[type=date]`.
- **`src/shared/lib/date.ts:30`** (right after `addDaysIso`) — now: only
  `addDaysIso` / `compareIso`. change to: add
  `comingSaturdayIso(fromIso = todayLocalIso())`,
  `comingMondayIso(fromIso = todayLocalIso())`, and
  `shortDayLabel(iso)`. why: resolve the "This weekend" / "Next week" quick
  options and label every quick row with its concrete day. Implement with
  `new Date(y, m-1, d).getDay()` + `addDaysIso`; stay local-date, never UTC —
  match the file's existing header contract.
- **`src/modules/actions/lib/group-actions.ts:35`** — `tomorrowIso()` already
  exists and is fine; `scheduledDateChip` unchanged. No edit — listed so the
  implementer doesn't duplicate `tomorrowIso`.

## Later (deferred)
- Recurring / repeating dates; time-of-day on `scheduledDate`.
- Natural-language date entry.
- Per-Path overdue grouping + per-Path "move all".
- Overdue badge on the Today nav item.
- "Postpone all to tomorrow" / snooze-all.
- Things-style silent auto-absorb of overdue into Today (no button).
- Midnight auto-rollover of the overdue bucket.

## Hand-off
Run the routing steps in order. This doc is the base each skill reads. Re-run
`proto-feature` if the scope changes (e.g. per-Path overdue moves into MVP).
