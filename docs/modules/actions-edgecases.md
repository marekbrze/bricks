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
- **New gaps found**: 8 — **all 8 implemented** (see ✅ rows; no deferrals)
- **By severity**: 🔴 0 · 🟡 3 · 🟢 5

## Inventory

| # | Severity | Category | Edge case | Status | Suggested behavior | Where it lives now |
|---|----------|----------|-----------|--------|--------------------|--------------------|
| 1 | 🟡 | Forms & input | Quick-add date menu lacked "Pick a date…" — the spec's third option. A due date beyond Tomorrow/In-a-week couldn't be set while adding. | ✅ | Add a "Pick a date…" item opening a free date picker; selection returns into the row's chip | `src/modules/actions/components/QuickAddActionRow.tsx:87` (menu item), `:122-160` (date dialog) |
| 2 | 🟡 | Cross-module & lifecycle | "Unassigned" fallback group rendered orphans as inert text — a dead-end list. | ✅ | Render full `ActionRowItem`s (schedule/rename/complete work through existing hooks, all id-based) | `src/modules/actions/components/ActionsPage.tsx:169-182` |
| 3 | 🟡 | Data states | The Unassigned group ignored "Show completed" — settled orphans leaked into the clean view. | ✅ | Apply the same `showCompleted` filter as every other group | `src/modules/actions/components/ActionsPage.tsx:113-117` (`orphanedVisible`) |
| 4 | 🟢 | Data states | Abandoned rows showed their stale due-date chip (possibly red "overdue") — noise. | ✅ | Show the chip only for non-done, non-abandoned rows | `src/modules/actions/components/ActionRowItem.tsx:71-72` |
| 5 | 🟢 | Action outcomes | "Schedule…" success toast had no Undo, while "Unschedule" did — asymmetric safety. | ✅ | Undo restores the previous `scheduledDate` (or unschedules when there was none) | `src/modules/actions/components/ActionsPage.tsx:246-256` |
| 6 | 🟢 | Accessibility | The standalone group's "All clear" line lacked `aria-live="polite"`. | ✅ | Mirror the GoalGroup markup | `src/modules/actions/components/PathSection.tsx:78` |
| 7 | 🟢 | Navigation & flow | Group collapse state reset on every visit. | ✅ | Persist per-Goal overrides in LocalStorage under `actions-group-visibility`; undefined = default (expanded, unless inactive) | `src/modules/actions/components/ActionsPage.tsx:50-53`, `src/modules/actions/components/GoalGroup.tsx:56-58` |
| 8 | 🟢 | Prototype-specific | At ~320 px the quick-add row got cramped; the chip squeezed the input. | ✅ | `flex-wrap` + a `min-w-0 basis-40` input so the chip drops to a second line | `src/modules/actions/components/QuickAddActionRow.tsx:52-56, 84` |

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
