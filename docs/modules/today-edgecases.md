# Today — Edge Cases

Scope: whole module (`/today`, `/today/schedule`, `/today/abandoned`), plus
the spots in `capture-triage`'s `use-actions.ts` that `today` now drives
(scheduling, completion, abandon). Audited against `docs/modules/today.md`
and the built prototype in `src/modules/today/`.

## Coverage

- **Spec already captured** (from `today.md` → Edge Cases): no Paths at
  all; a Path with nothing scheduled today; every Path empty today; all of
  today's Actions completed; a very old date navigated to; a frog Action
  whose parent Goal was achieved/abandoned; an Action deleted or moved
  while scheduled; a large number of Actions on one day.
- **Already handled in code**:
  - No Paths at all → empty state pointing at **Go to Paths** — `src/modules/today/components/TodayPage.tsx:107`
  - A Path with nothing scheduled today still renders its section (`"Nothing scheduled today."`) instead of disappearing — `src/modules/today/components/PathSection.tsx:38`
  - Every Path empty today → one day-wide empty state instead of N identical per-Path ones — `src/modules/today/components/TodayPage.tsx:121`
  - All of today's Actions completed → rows stay visible in their completed (line-through, muted) style rather than being cleared — `src/modules/today/components/ActionRow.tsx:34`
  - A frog Action whose parent Goal was later achieved/abandoned still renders normally — `today` never reads Goal state at all, only the Action's own denormalized `frog` flag, so there's nothing to special-case
  - Corrupt `actions` / `paths` storage → recovery screens on all three routes, not a silent empty render — `TodayPage.tsx:39`, `SchedulePage.tsx:40`, `ReviewAbandonedPage.tsx:42`
  - A Path deleted while it still has scheduled Actions → the existing `capture-triage` self-heal returns them to the Inbox on the next read, so they don't dangle — `src/modules/capture-triage/hooks/use-actions.ts:36` (see gap #1 below for what it *doesn't* clean up)
- **New gaps found**: 11
- **By severity**: 🔴 0 · 🟡 5 · 🟢 6
- **Hardened (proto-harden, 2026-09-04)**: 8 closed, 3 deferred — see "Hardening status" below.

## Inventory

| # | Severity | Category | Edge case | Behavior today | Suggested behavior | Where |
|---|----------|----------|-----------|----------------|--------------------|-------|
| 1 | 🟡 | Cross-module | Path self-heal doesn't clear `scheduledDate`/`completedAt` | When an Action's Path is deleted, the self-heal effect returns it to `inbox` and clears `pathId`/`goalId` — but leaves `scheduledDate` and `completedAt` exactly as they were. It's invisible everywhere today (`inbox`-state Actions are excluded from every `today` selector), but if the Owner later re-triages it via `assignAction`, it silently reappears on a stale — possibly long-past — day with no indication the Owner ever scheduled it *this* time | Clear `scheduledDate` and `completedAt` in the same self-heal write | `src/modules/capture-triage/hooks/use-actions.ts:43` |
| 2 | 🟡 | Navigation / deep-linking | Day position isn't in the URL | `date` is local component state initialized to today — refreshing `/today`, or leaving and coming back, always resets to today even if the Owner had navigated three days ahead | Put the date in the URL (`/today/:date?`) or persist the last-viewed date, so a refresh doesn't silently discard day-nav position | `src/modules/today/components/TodayPage.tsx:19` |
| 3 | 🟡 | Action outcomes | Abandon has no Undo | Every other mutation with a real chance of being a mis-click (Unschedule, Discard, Promote in `capture-triage`) returns an `UndoFn` wired into the toast's Undo action; `abandonAction` doesn't, so reversing an accidental Abandon means leaving the day view, opening Review abandoned, and rescheduling | Snapshot-and-return an `UndoFn` from `abandonAction` (mirrors `discardAction`) and wire it into both toasts | `src/modules/capture-triage/hooks/use-actions.ts:229`, `src/modules/today/components/TodayPage.tsx:56`, `src/modules/today/components/SchedulePage.tsx:91` |
| 4 | 🟡 | Forms / data states | "Add to today" empty state doesn't say *why* it's empty | Opened scoped to one Path (nothing unscheduled for *that* Path), it shows the same "Nothing waiting to be scheduled … Open Inbox" message as the truly-empty case — even when other Paths have plenty waiting, which "Open Inbox" doesn't fix | When `pathId` is set and the global `unscheduledActions` list is non-empty, say so explicitly (e.g. "Nothing waiting for “Sport” — N Actions are waiting on other Paths") instead of always pointing at the Inbox | `src/modules/today/components/AddToTodayDialog.tsx:44` |
| 5 | 🟡 | State transitions | Unscheduling a completed (`done`) Action is allowed | The overflow menu offers **Unschedule** on `done` rows same as any other — doing it pulls a *finished* Action out of every day view entirely, working against the spec's own goal ("finishing the day should feel like a visible win, not an emptied list"); recoverable only inside the Undo toast's few-second window | Either hide **Unschedule** for `done` rows (only Move/nothing), or keep it but call it out distinctly ("Remove from today" wording) so it doesn't read as an accidental win-eraser | `src/modules/today/components/ActionOverflowMenu.tsx:37` |
| 6 | 🟢 | Data states / formatting | `formatDayLabel` omits the year | `ScheduleActionDialog`'s date input has no `min`/`max`, so an Owner can schedule an Action any number of years out; the label still renders as `"Wed, Sep 9"` with no year, ambiguous once it's not obviously "this year" | Add the year when the target date isn't in the current calendar year | `src/shared/lib/date.ts` (`formatDayLabel`) |
| 7 | 🟢 | Action outcomes | "Added to today" toast has no Undo | Unschedule and Move both get an Undo action on their toast; picking an Action in `AddToTodayDialog` just shows a plain confirmation toast, so undoing it means manually reopening the row's overflow menu and unscheduling it | Add an Undo action to the toast (`unscheduleAction(action.id)`) for symmetry with the rest of the module | `src/modules/today/components/TodayPage.tsx:156` |
| 8 | 🟢 | Prototype-length session | Viewed date never re-syncs to a new calendar day | `date` is set once via `useState(todayLocalIso())` — a session left open across midnight keeps calling yesterday "Today" until the tab is reloaded | Low priority for a prototype; revisit if long-lived sessions become a real usage pattern | `src/modules/today/components/TodayPage.tsx:19` |
| 9 | 🟢 | Accessibility | Per-section **Add** buttons share one generic accessible name | Every `PathSection` renders a plain "Add" button with no Path context in its own accessible name — fine for sighted users reading the adjacent heading, ambiguous for a screen-reader user tabbing/rotor-navigating button-to-button across several sections | `aria-label={`Add to ${path.name}`}` on the button | `src/modules/today/components/PathSection.tsx:34` |
| 10 | 🟢 | Data states | No virtualization/pagination on a very large day or agenda list | Same class of deferred gap already accepted in `goals` (tree) and `capture-triage` (Inbox) — fine at prototype scale | Not worth solving now; revisit if a real day's Action count grows large | `src/modules/today/components/PathSection.tsx:43`, `src/modules/today/components/SchedulePage.tsx:69` |
| 11 | 🟢 | Forms | No double-submit guard on `ScheduleActionDialog` / `AddToTodayDialog` | Same already-deferred class as every other module's dialogs — harmless while every mutation is synchronous | Revisit once a real backend makes mutations async | `src/modules/today/components/ScheduleActionDialog.tsx:44`, `src/modules/today/components/AddToTodayDialog.tsx:61` |

### Categories checked with no new gaps

- **Boundary values** — no numeric inputs anywhere in this module; only date pickers, constrained by the native `<input type="date">`.
- **Invalid formats** — same native date input; the browser rejects malformed dates before they reach state.
- **Special characters / unicode / emoji** — plain-text display throughout (Action/Path names), same as every other module; nothing module-specific to break.
- **Destructive-action confirmation** — the one truly irreversible action (**Delete for good** in Review abandoned) is behind an `AlertDialog` confirm; Abandon/Unschedule are reversible by design (see gaps #3, #7 for their Undo gaps specifically).
- **Invalid state transition reachable via UI** — an `abandoned` Action never renders a checkbox anywhere (excluded from every `today` selector), so completing one straight from `abandoned` isn't reachable; **Abandon** itself is hidden once a row is `done` (`ActionOverflowMenu.tsx:40`).
- **Offline** — LocalStorage-only, no network calls; works fully offline.
- **Storage write failure / quota** — covered app-wide by the shared `StorageHealthBanner`, inherited for free via `useLocalStorageState`; no module-specific gap.
- **Referenced-item-deleted (Goal → Action)** — already covered by `goals`' cascade delete (`deleteActionsForGoals`); a scheduled Action's Goal being deleted removes the Action outright, so it can't dangle in a day view.
- **Deep-linking + refresh for `/today/schedule` and `/today/abandoned`** — neither route takes a param, so both survive a refresh with no state to lose (unlike `/today` itself — see gap #2).
- **Permissions / roles** — single `Owner`, no auth; N/A, same as every other module.

## Priority list

1. **Self-heal leaves stale `scheduledDate`/`completedAt` behind (#1)** — the one gap with a real, if delayed, data-integrity consequence: a re-triaged Action can silently reappear on a day the Owner never chose this time.
2. **Abandon has no Undo (#3)** — the module's only reversible-by-design mutation that doesn't actually offer the app's standard one-click reversal.
3. **Day position not in the URL (#2)** — the most visible everyday papercut; a refresh mid-week-review silently snaps back to today.
4. **Unscheduling a `done` Action (#5)** and the **scoped-empty-state wording (#4)** — both quietly work against what the day view is supposed to feel like (a visible, trustworthy log of the day), even though neither loses data.

## Hand-off to proto-harden

The top-priority gaps a harden pass should implement first:
- Clear `scheduledDate`/`completedAt` in the Path self-heal effect (#1)
- Give `abandonAction` an `UndoFn` and wire it into both toasts (#3)
- Persist/URL-encode the viewed date on `/today` (#2)
- Decide Unschedule's behavior on `done` rows, and sharpen `AddToTodayDialog`'s scoped-empty message (#4, #5)

## Hardening status (proto-harden, 2026-09-04)

| # | Status | Where it lives now |
|---|--------|--------------------|
| 1 | ✅ | The Path self-heal effect now also clears `scheduledDate`/`completedAt` when returning an orphaned Action to the Inbox, so a later re-triage can't resurrect it on a stale day | `src/modules/capture-triage/hooks/use-actions.ts:43` |
| 2 | ✅ | `/today` gained an optional `:date` route segment; `TodayPage` derives the viewed day from `useParams()` (validated, falls back to today on anything malformed) instead of local-only state, and day-nav/​**Today** now `navigate()` instead of `setState` | `src/modules/today/index.tsx:16`, `src/modules/today/components/TodayPage.tsx:19` (`isValidIso`/`goToDate`), `src/shared/lib/date.ts` (`isValidIso`) |
| 3 | ✅ | `abandonAction` snapshots and returns an `UndoFn` (mirrors `discardAction`); both `TodayPage` and `SchedulePage` wire it into the "abandoned" toast's Undo action | `src/modules/capture-triage/hooks/use-actions.ts:229`, `src/modules/today/components/TodayPage.tsx:56`, `SchedulePage.tsx:91` |
| 4 | ✅ | Decided: when opened scoped to one Path with nothing waiting for it, the dialog now says so by name and reports how many Actions are waiting on *other* Paths, instead of always pointing at the Inbox | `src/modules/today/components/AddToTodayDialog.tsx:44` |
| 5 | ✅ | Decided: **Unschedule** is hidden on a `done` row (only **Move to another day** remains) — a completed Action can be relocated but not pulled out of every day view outright; **Abandon** was already hidden there | `src/modules/today/components/ActionOverflowMenu.tsx:36` |
| 6 | ✅ | `formatDayLabel` appends the year whenever the target date isn't in the current calendar year | `src/shared/lib/date.ts` (`formatDayLabel`) |
| 7 | ✅ | The "added to \[day\]" toast now carries an Undo action (`unscheduleAction`), matching Unschedule/Move | `src/modules/today/components/TodayPage.tsx:156` |
| 8 | ❌ deferred | Prototype-length-session issue only (viewed date not re-syncing past local midnight); explicitly low priority in the audit itself — revisit if long-lived sessions become a real usage pattern |
| 9 | ✅ | Each Path section's **Add** button now carries `aria-label="Add to {path.name}"`, giving it a distinct accessible name for screen-reader users navigating button-to-button | `src/modules/today/components/PathSection.tsx:34` |
| 10 | ❌ deferred | No virtualization/pagination on a large day or agenda list — not worth solving at prototype scale, matches `goals`/`capture-triage` precedent |
| 11 | ❌ deferred | No double-submit guard on `ScheduleActionDialog`/`AddToTodayDialog` — harmless while every mutation is synchronous; same deferred class as every other module's dialogs, revisit with a real backend |

---

# Second pass (2026-09-10) — Overdue section + SchedulePopover

Scope: the surface added by `docs/changes/smart-due-dates-and-overdue-rollover.md`
(ADR 0045) — the **Overdue** bucket on `/today`, the shared
`SchedulePopover` / `SchedulePopoverPanel`, the `ScheduleActionDialog`
refactor to a thin shell around that panel, and the `overdueActions` /
`rescheduleOverdueToday` selectors in `capture-triage`'s `use-actions.ts`.
Audited against the change doc and the built code. The 2026-09-04 pass
(gaps #1–11 above) still stands; this pass does not re-litigate it.

## Coverage

- **Spec already captured** (change doc → "Edge cases" per module): viewing
  a past/future day hides the Overdue section; overdue **and** frog → flame
  still shows, frog-first sort within the bucket; "Move all" with a large
  list → single write, one toast; local midnight staleness (deferred);
  Undo-after-"Move all" when a moved row was completed in between →
  `restoreSnapshot` reverts everything, accepted; `value` failing
  `isValidIso` → treat as no selection; calendar navigating years out is
  fine (matches `formatDayLabel`).
- **Already handled in code**:
  - Past/future day → Overdue hidden — `TodayPage.tsx:52` (`showOverdue = isToday && …`)
  - Frog-first + oldest-slip-first sort in the bucket — `use-actions.ts:309`
  - "Move all to today" is one snapshot / one write / one Undo toast — `use-actions.ts:322`, `TodayPage.tsx:93`
  - Per-row reschedule Undo restores the row's *previous* `scheduledDate` — `TodayPage.tsx:76`
  - Empty `value` / invalid ISO into the popover → no selection, `quickOptions(false)` (no "No date" row) — `SchedulePopover.tsx:105`
  - "This weekend" hidden Sat/Sun; "No date" shown only when a date is set — `SchedulePopover.tsx:60`, `:89`
  - Completing an overdue row drops it from `overdueActions` (it's `done`) with no extra toast — `use-actions.ts:308` (state filter)
  - Corrupt `actions`/`paths` storage → recovery screens on all three routes (unchanged from pass 1)
- **New gaps found**: 11
- **By severity**: 🔴 0 · 🟡 3 · 🟢 8

## Inventory

| # | Severity | Category | Edge case | Behavior today | Suggested behavior | Where |
|---|----------|----------|-----------|----------------|--------------------|-------|
| 12 | 🟡 | Forms / dead control | **"No date" in the move/reschedule dialog is a dead button.** `ScheduleActionDialog` shows the "No date" quick row whenever `value` (its `initialDate`) is set, but its `onSelect(null)` branch calls `onClear?.()` — and the two move callers (`TodayPage` move, `SchedulePage` move) don't pass `onClear`. Clicking "No date" (or clicking the already-selected calendar day again) just closes the dialog; the Action is unchanged, no toast, no feedback | A visible control that silently does nothing | Either wire `onClear` to `unscheduleAction` + an Undo toast in both move callers, or add an `allowClear` prop and only render the "No date" row when a clear handler exists (Review-abandoned already passes no `initialDate`, so it's hidden there regardless) | `src/modules/today/components/ScheduleActionDialog.tsx:52`, `src/modules/today/components/TodayPage.tsx:220`, `src/modules/today/components/SchedulePage.tsx:103` |
| 13 | 🟡 | Cross-module / lifecycle | **Archived-Path Actions aren't filtered out of the day.** `dayActions` (`scheduledActionsForDate`) and `overdueActions` filter by `state`, never by active Path. The self-heal only catches *deleted* Paths, not *archived* ones. Result: an overdue Action on an archived Path still shows in the Overdue section and is swept by "Move all to today"; a *today*-dated Action on an archived Path counts toward `dayActions.length` (so the "Nothing scheduled" empty state is suppressed) but has no section to render in — every active Path shows "Nothing scheduled today" and the Action is invisible with no explanation | Archived-Path Actions leak into Overdue and silently vanish from the day view while blocking its empty state | Filter both `dayActions` and the list passed to `OverdueSection` to active Path ids in `TodayPage` (mirror how `activePaths.map` already drops them); decide whether an archived-Path overdue Action should be quietly excluded or self-healed back to the Inbox like a deleted-Path one | `src/modules/today/components/TodayPage.tsx:50`, `src/modules/today/components/TodayPage.tsx:52`, `src/modules/capture-triage/hooks/use-actions.ts:305` |
| 14 | 🟡 | Data states / conflicting messaging | **Overdue + "nothing scheduled today" render together.** When there's overdue work but nothing dated *exactly* today, `TodayPage` shows the Overdue section and, directly below it, the full-height "Nothing scheduled for today — pull something in" empty-state CTA. The feature plan called for overdue to count as "the day isn't actually empty"; the day now both screams "you're behind" and "you have nothing planned" | Two contradictory primary messages stacked | When `showOverdue` is true, drop the big empty CTA (or replace it with a single quiet line: "Nothing new scheduled — clear the overdue list above or add something") | `src/modules/today/components/TodayPage.tsx:172` |
| 15 | 🟢 | Consistency / sort | **Day-view rows aren't frog-first.** `scheduledActionsForDate` sorts by `createdAt` only. The Overdue bucket, and `goals`/`paths` lists (per ADR 0046/0047), all float frogs to the top; inside a `PathSection` a frog Action is only flame-tagged, still competing on `createdAt` order — against the module's "frogs don't compete on equal footing" intent | Frog rows sit wherever creation order put them | Apply the same frog-first comparator `overdueActions` uses, within each Path's slice | `src/modules/capture-triage/hooks/use-actions.ts:285` |
| 16 | 🟢 | Action outcomes | **No Abandon from the Overdue section.** Overdue rows offer only checkbox + per-row reschedule + "Move all". Deciding an overdue Action is dead means rescheduling it onto today first, then abandoning it from its Path section | The one bucket most likely to contain "never going to do this" has no discard path | Give the Overdue row the same overflow menu `ActionRow` has (at least **Abandon**) | `src/modules/today/components/OverdueSection.tsx:78` |
| 17 | 🟢 | Navigation / flow | **Schedule (agenda) view never shows overdue.** `upcomingScheduledDates` is `scheduledDate >= today`, so the backlog is invisible to someone planning ahead in `/today/schedule` — the one screen framed as "a wider look ahead" | Overdue exists only on `/today` | Prepend an "Overdue" block to the agenda (reuse `OverdueSection`), or badge the "← Today" back-link with the count | `src/modules/today/components/SchedulePage.tsx:38` |
| 18 | 🟢 | Navigation / deep-linking | **Malformed `/today/:date` keeps the bad URL.** `/today/banana` or `/today/2026-13-40` correctly falls back to today's *content*, but the address bar still shows the invalid path — a refresh re-runs the same fallback, and the URL is misleading if shared | Content right, URL wrong | In an effect, `navigate('/today', { replace: true })` when `params.date` is present but fails `isValidIso` | `src/modules/today/components/TodayPage.tsx:27` |
| 19 | 🟢 | Navigation | **Day-nav is `replace`, so Back doesn't step days.** `goToDate` always `navigate(…, { replace: true })`; after stepping forward several days the browser Back button jumps out of Today entirely instead of walking back one day at a time | Back button doesn't undo day steps | Push for step-nav; keep `replace` only for the malformed-date cleanup (#18) and the today→`/today` canonicalisation — or accept and document as "not a calendar" | `src/modules/today/components/TodayPage.tsx:29` |
| 20 | 🟢 | Formatting / layout | **Out-of-year day label wraps in the header.** `formatDayLabel` appends the year for a non-current-year date ("Wed, Sep 10, 2027"); centered in the `min-w-32` `<h1>` between the two chevrons it wraps to two lines and shoves the nav buttons apart | Header jumps around on far dates | Let the heading size to content / raise its min-width, or use a shorter far-date format in the header | `src/modules/today/components/TodayPage.tsx:117` |
| 21 | 🟢 | Action outcomes | **Completing an overdue row makes it vanish, not "win".** Checking off an overdue Action sets `done` but leaves `scheduledDate` in the past — so it's not in `overdueActions` (state filter) and not in today's `dayActions` (exact-date match). It disappears from `/today` entirely; only a 5s toast marks it, and it won't show in the agenda either (`>= today`). The spec's "finishing feels like a visible win" is weakened | Finished overdue work leaves no trace on the day it was finished | On completing an overdue row, also set `scheduledDate = todayLocalIso()` so it lands in today's completed list | `src/modules/today/components/OverdueSection.tsx:53`, `src/modules/capture-triage/hooks/use-actions.ts:239` |
| 22 | 🟢 | Action outcomes | **Move dialog re-confirms a no-op move.** In `ScheduleActionDialog`'s move flow the currently-viewed day is pre-selected; clicking it fires `onSchedule(sameDate)` → a "moved to \[today\]" toast even though nothing changed | Toast lies about a move that didn't happen | No-op + silent close when the picked iso equals `initialDate` | `src/modules/today/components/ScheduleActionDialog.tsx:54` |

### Categories checked with no new gaps

- **Empty / one / many** — Overdue section only renders with ≥1 item (absent = nothing overdue, by design, no empty state); single item reads "1"; large lists handled by one bulk write. Deferred virtualization is gap #10 (pass 1).
- **Long / unicode / emoji field values** — Overdue row name span is `min-w-0 flex-1 break-words`; chip / frog / reschedule button are `shrink-0`. Same plain-text display as every other module.
- **Boundary values** — no numeric inputs; `react-day-picker` grid + local-calendar ISO helpers, no free-typing.
- **Double-submit on "Move all to today"** — the Overdue section unmounts the instant `overdueActions` empties (`showOverdue` flips false), so the button is gone before a second click can land; a spurious "0 Actions moved" toast on an extremely fast double-tap is possible but harmless (toasts stack, the first Undo still restores the real pre-move state).
- **Storage write failure / quota / offline** — inherited from `useLocalStorageState` + the app-wide `StorageHealthBanner`; no module-specific gap (unchanged from pass 1).
- **Popover viewport collision** — base-ui `Popover` handles flip/shift; `align="end"` on the Overdue reschedule trigger is within its collision model.
- **`SchedulePopover` calendar a11y** — `DayPicker` keeps its own grid keyboard model; quick rows are real `<button>`s in a list, tab-reachable, each with its resolved-day hint. (The change doc sketched `role="menu"`; the plainer button list is an acceptable deviation, not a gap.)
- **Referenced Goal deleted while an Action is overdue** — `goals`' `deleteActionsForGoals` cascade removes the Action outright; it can't dangle in the Overdue bucket.
- **Reschedule-overdue Undo when `previous` is null** — not reachable: `overdueActions` guarantees a non-null `scheduledDate`, so `handleRescheduleOverdue`'s `previous` is always set.

## Priority list

1. **"No date" is a dead button in the move/reschedule dialog (#12)** — a visible control that silently does nothing is the one gap that reads as broken; either wire it or hide it.
2. **Archived-Path Actions not filtered from the day / Overdue (#13)** — the only gap with a cross-module correctness consequence: Actions leak into Overdue and "Move all", or vanish from the day while suppressing its empty state.
3. **Overdue + "nothing scheduled today" shown together (#14)** — a half-implemented plan point; the day contradicts itself.
4. **Frog-first day rows (#15)** and **Abandon from Overdue (#16)** — cheap consistency fixes that bring the new surface in line with the rest of the module.

## Hand-off to proto-harden

The top-priority gaps a harden pass should implement first:
- Decide "No date" in `ScheduleActionDialog`: wire `onClear` → `unscheduleAction` + Undo, or gate the row behind an `allowClear` prop (#12)
- Filter `dayActions` **and** the Overdue list to active Path ids in `TodayPage`; decide archived-Path overdue = excluded vs. self-healed (#13)
- Suppress / soften the day-view empty CTA when `showOverdue` is true (#14)
- Frog-first sort in `scheduledActionsForDate` (#15); Abandon affordance on the Overdue row (#16)

## Hardening status (proto-harden, 2026-09-10)

8 closed, 3 deferred.

| # | Status | Where it lives now |
|---|--------|--------------------|
| 12 | ✅ | Decided: **wire it**. `ScheduleActionDialog`'s "No date" row now unschedules with an Undo toast — `onClear` is passed by the `TodayPage` move dialog and the `SchedulePage` move dialog; Review-abandoned still doesn't render the row (no `initialDate`) | `src/modules/today/components/TodayPage.tsx:288`, `src/modules/today/components/SchedulePage.tsx:110` |
| 13 | ✅ | Decided: **quietly excluded** (archiving ≠ deleting, so the self-heal correctly leaves the `pathId` intact). `TodayPage` derives `activePathIds` and filters both `dayActions` and `visibleOverdue` to it — matching how `activePaths.map` already drops archived-Path sections; the "Move all to today" toast counts `visibleOverdue` | `src/modules/today/components/TodayPage.tsx:63` |
| 14 | ✅ | When `dayActions` is empty **and** `showOverdue`, the full-height empty state is replaced by a single dashed line ("Nothing new scheduled — clear the overdue list above, or add something") with a compact **Add to this day** button | `src/modules/today/components/TodayPage.tsx:230` |
| 15 | ❌ deferred | Frog-first sort in the plain day view is a visual-hierarchy change, not a broken path — belongs in `proto-design` / `proto-polish`, alongside the frog treatment those passes will design. The Overdue bucket keeps its own frog-first sort |
| 16 | ✅ | The Overdue row gained a direct **Abandon** icon button (`Ban`, `hover:text-destructive`) next to its reschedule trigger — same direct-button pattern as `ReviewAbandonedPage`; wired to `TodayPage`'s existing `handleAbandon` (Undo toast) | `src/modules/today/components/OverdueSection.tsx:94` |
| 17 | ❌ deferred | Surfacing overdue in the agenda view pairs with the "overdue badge on the Today nav item" already deferred in ADR 0045's *Later* list — revisit the two together, not piecemeal |
| 18 | ✅ | A `useEffect` in `TodayPage` `navigate('/today', { replace: true })` when `params.date` is present but fails `isValidIso` — the address bar no longer keeps a bogus `:date` | `src/modules/today/components/TodayPage.tsx:31` |
| 19 | ❌ deferred | Day-nav staying `replace` is the intentional "this is a day view, not a calendar" behavior — position still survives a refresh via the URL. Accepted, no change |
| 20 | ✅ | The day-view `<h1>` is now `whitespace-nowrap` with side padding, so an out-of-year label ("Wed, Sep 10, 2027") stays on one line and the chevrons don't jump | `src/modules/today/components/TodayPage.tsx:167` |
| 21 | ✅ | Decided: **pull to today**. New `completeOverdueAction(id)` in `use-actions.ts` sets `state: 'done'` + `completedAt` **and** `scheduledDate = today` in one write; `TodayPage`'s `handleToggleDoneOverdue` calls it so a finished overdue row lands in today's completed list as a visible win instead of vanishing | `src/modules/capture-triage/hooks/use-actions.ts:253`, `src/modules/today/components/TodayPage.tsx:96` |
| 22 | ✅ | `ScheduleActionDialog` no-ops (silent close, no toast) when the picked iso equals `initialDate` | `src/modules/today/components/ScheduleActionDialog.tsx:54` |

New Storybook coverage: `OverdueSection` → `AbandonARow` (play); `TodayPage` →
`OverdueButNothingToday` (play), `ArchivedPathActionsExcluded` (play);
`Today/Dialogs` → `MoveToAnotherDayWithClear`. `pnpm lint`, `pnpm exec tsc
--noEmit`, `pnpm build`, and 123 Storybook tests green.
