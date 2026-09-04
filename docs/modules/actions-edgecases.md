# Actions View — Edge Cases

## Coverage
- **Spec already captured** (docs/modules/actions.md → Edge Cases): empty app (no Paths),
  Path with nothing in it, "All clear" groups, inactive Goals with open Actions, orphaned
  Action (missing Goal/Path), Inbox items locked to triage, quick-add whitespace validation,
  storage corruption, overdue date chips, mobile 5-tab width.
- **Already handled in code**:
  - Empty app → guided empty state with a link to `/paths` — `src/modules/actions/components/ActionsPage.tsx:161-178`
  - Path with nothing in it → section still renders with quick-add rows — `src/modules/actions/components/PathSection.tsx:60-96`
  - Storage corruption → dedicated recovery screens per key, checked paths → goals → actions — `src/modules/actions/components/ActionsPage.tsx:79-81`
  - Storage write failure (quota/private mode) → app-wide `StorageHealthBanner` — `src/shared/components/StorageHealthBanner.tsx:29-40` (platform-level, inherited)
  - Whitespace-only quick-add → no-op on submit and on `Add` — `src/modules/actions/components/QuickAddActionRow.tsx:32-38`, `src/modules/capture-triage/hooks/use-actions.ts` (`createAction`)
  - Double-submit → input cleared and button disabled when empty; Enter on empty is a no-op — `QuickAddActionRow.tsx:97`
  - Rename with empty value → submit disabled — `src/modules/actions/components/ActionsPage.tsx:224`
  - Long names → `truncate` on Path/Goal headers, `break-words` on Action rows — `PathSection.tsx`, `GoalGroup.tsx`, `ActionRowItem.tsx`
  - Inactive Goals with open Actions → collapsed + dimmed at section bottom; those without open work are filtered out entirely — `ActionsPage.tsx:113-116,187-189`, `GoalGroup.tsx:63-65`
  - Inbox locked to triage (no quick-add/schedule/complete) — `src/modules/actions/components/InboxGroup.tsx`
  - Abandoned checkbox disabled (no done-from-abandoned; reschedule is the escape hatch) — `ActionRowItem.tsx:51`
  - Done rows offer only Un-complete (no schedule/abandon on a finished row) — `ActionRowItem.tsx:99-101`
- **New gaps found**: 8
- **By severity**: 🔴 0 · 🟡 3 · 🟢 5

## Inventory

| # | Severity | Category | Edge case | Behavior today | Suggested behavior | Where |
|---|----------|----------|-----------|----------------|--------------------|-------|
| 1 | 🟡 | Forms & input | Quick-add date menu lacks "Pick a date…" — the spec's third option (docs/modules/actions.md, Quick-add flow). A due date beyond Tomorrow/In-a-week can't be set while adding; the user must add undated, then Reschedule from the row menu (2 steps). | Only Today / Tomorrow / In a week | Add a "Pick a date…" item opening the shared `ScheduleActionDialog`-style date picker; selection returns into the row's chip | `src/modules/actions/components/QuickAddActionRow.tsx:63-74` |
| 2 | 🟡 | Cross-module & lifecycle | "Unassigned" fallback group renders orphans as inert text — no checkbox, no menu, nothing to do there. The user sees the row but can't act on it from this view (a dead-end list). | Plain `<li>` text | Render full `ActionRowItem`s (schedule/rename/complete work through existing hooks; `pathId`-less rows still function since every handler is id-based) | `src/modules/actions/components/ActionsPage.tsx:151-161` |
| 3 | 🟡 | Data states | The Unassigned group ignores "Show completed": a `done`/`abandoned` orphan is always visible even when the toggle is off — the one group where settled rows leak into the clean view. | No `isSettled` filter | Apply the same `showCompleted` filter as every other group | `src/modules/actions/components/ActionsPage.tsx:101-103` |
| 4 | 🟢 | Data states | Abandoned rows still show their stale due-date chip (possibly red "overdue") — noise on a row that already says "abandoned". | `chip && !done` | Show the chip only for `assigned` (`!done && !abandoned`) | `src/modules/actions/components/ActionRowItem.tsx:71` |
| 5 | 🟢 | Action outcomes | "Schedule…" success toast has no Undo, while "Unschedule" does — asymmetric safety for the same field flip. | Toast only | Attach an Undo that restores the previous `scheduledDate` (null when unscheduling-forward) | `src/modules/actions/components/ActionsPage.tsx` (schedule dialog `onSchedule`, ~line 230) |
| 6 | 🟢 | Accessibility | The standalone group's "All clear" line lacks the `aria-live="polite"` its Goal-group counterpart has — screen readers hear one and not the other. | No live region | Mirror the GoalGroup markup | `src/modules/actions/components/PathSection.tsx:78` |
| 7 | 🟢 | Navigation & flow | Group collapse state resets on every visit (local `useState` only) — the Owner re-expands the same groups each time. Acceptable in a prototype. | Session-local | Persist collapsed ids per group key in LocalStorage (same pattern as scenario keys) | `src/modules/actions/components/GoalGroup.tsx:50` |
| 8 | 🟢 | Prototype-specific | At ~320 px the quick-add row (icon + input + date chip + Add) gets cramped and the chip can squeeze the input to near-zero width. | Single-line flex row | Let the chip wrap under the input (`flex-wrap`), or drop the chip's fixed padding at small widths | `src/modules/actions/components/QuickAddActionRow.tsx:41` |

Categories with no gaps: **State transitions** (schedule/complete/abandon ride the hardened
`useActions` lifecycle; invalid done-from-abandoned is blocked), **Loading & async**
(synchronous LocalStorage reads — no fetch, nothing to skeleton), **Errors** (no `alert()`
anywhere; corrupt storage has dedicated screens), **Boundary values** (dates are ISO strings
compared lexically; `daysUntil` handles past/future), **Special characters** (React text
nodes, no innerHTML), **Offline** (pure LocalStorage — fully functional).

## Priority list
1. **#1 — "Pick a date…" in quick-add**: the only promise the spec makes that the UI doesn't keep; touches the view's primary flow.
2. **#2/#3 — make the Unassigned group a real, filtered group**: it's the view's safety net; an inert, leaky safety net is worse than none.
3. **#4–#8 — chip noise, toast symmetry, aria-live, collapse persistence, narrow widths**: small, independent polish.

## Hand-off to proto-harden
- Gap #1 (quick-add date picker) — needs a small popover/dialog with a free date input.
- Gaps #2+#3 (Unassigned group as full rows + showCompleted filter).
- Gaps #4/#5 (chip on abandoned rows; Undo on schedule) — trivial, do together.
- Gaps #6/#7/#8 — polish tier, include if cheap.
