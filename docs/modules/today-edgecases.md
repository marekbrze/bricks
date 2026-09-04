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
