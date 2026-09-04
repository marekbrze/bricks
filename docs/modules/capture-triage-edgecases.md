# Capture / Triage — Edge Cases

Scope: whole module (`/capture-triage`, `/capture-triage/triage`, plus the
global `QuickCaptureButton` mounted in `AppHeader`). Audited against
`docs/modules/capture-triage.md` and the built prototype in
`src/modules/capture-triage/`.

## Coverage

- **Spec already captured** (from `capture-triage.md` → Edge Cases): empty
  Inbox; single-item triage session; empty capture name; promote without a
  Path; discard + re-capture same idea; skipping every item in a session;
  exiting triage with items undecided; very long Action name.
- **Already handled in code**:
  - Empty Inbox → concept explanation, no dead "Start Triage" — `src/modules/capture-triage/components/InboxPage.tsx:25`
  - Empty capture name → **Add** disabled until non-whitespace text exists — `src/modules/capture-triage/components/QuickCaptureInput.tsx:38`
  - Promote / Assign without a Path → both blocked (`disabled`), `PathPicker` explains why — `src/modules/capture-triage/components/PathPicker.tsx:21`, `PromoteToGoalDialog.tsx:69`
  - Skip cycles the item to the back of the session queue without touching persisted state — `src/modules/capture-triage/components/TriagePage.tsx:62`
  - Exiting triage mid-session — plain `Link`, no guard, items stay in the Inbox untouched — `src/modules/capture-triage/components/TriagePage.tsx:76`
  - Very long Action name — `break-words` on the card heading and the Inbox list row — `src/modules/capture-triage/components/TriageCard.tsx:37`, `InboxPage.tsx:39`
  - Single-item / zero-item triage session — the queue naturally resolves to the completion state, no special-casing needed — `src/modules/capture-triage/components/TriagePage.tsx:80`
  - Discard + re-capture — no uniqueness constraint anywhere in `useActions`; allowed by construction
  - Capturing a new idea *while triage is open* correctly joins the session queue instead of being ignored — `src/modules/capture-triage/components/TriagePage.tsx:29`
  - A resolved card (`key={currentAction.id}`) always remounts fresh — no stale Path/Goal selection leaking into the next card — `src/modules/capture-triage/components/TriagePage.tsx:70`
  - Storage write fails after mount — already covered app-wide by the shared banner built for `paths` — `src/shared/hooks/use-local-storage.ts:52` → `StorageHealthBanner` in `AppShell`
- **New gaps found**: 11
- **By severity**: 🔴 1 · 🟡 7 · 🟢 3
- **Hardened (proto-harden, 2026-09-04)**: 8 closed, 3 deferred — see "Hardening status" below.

## Inventory

| # | Severity | Category | Edge case | Behavior today | Suggested behavior | Where |
|---|----------|----------|-----------|----------------|--------------------|-------|
| 1 | 🔴 | Cross-module | Deleting a `Path` doesn't touch `Action`s assigned to it | `usePaths().deletePath` only mutates the `paths` key; any `Action` with that `pathId` (standalone or via a mock Goal) is left pointing at a Path that no longer exists — a dangling reference | Until `Action`s are visibly listed anywhere (by `today`/`goals`), this is dormant but real. `capture-triage` should either subscribe to Path deletion and re-inbox/orphan-flag affected Actions, or the cascade should move here once those consuming modules exist | `src/modules/paths/hooks/use-paths.ts:144`, `src/modules/capture-triage/hooks/use-actions.ts` (no listener) |
| 2 | 🟡 | Errors | `dataUnreadable` (corrupt `actions` value) isn't checked on the triage route | `InboxPage` shows the recovery screen; `/capture-triage/triage` doesn't check `dataUnreadable` at all — a corrupt value there just renders `inboxActions = []`, i.e. the "Nothing to triage" completion state, silently masking data loss | Check `dataUnreadable` in `TriagePage` too and render `ActionsDataUnreadable` — same fix `paths` already applies per-route | `src/modules/capture-triage/components/TriagePage.tsx:1` (hook call has no `dataUnreadable` destructure), compare `InboxPage.tsx:11` |
| 3 | 🟡 | Navigation & flow | No Paths at all blocks the entire triage loop, with no way out except exiting | `PathPicker` correctly disables Assign/Promote, but neither surface offers a way to create a Path from inside triage. Leaving triage to go create one and coming back drops the session (`order`/`processedCount` are component-local `useState`, reset on unmount) | Either a "Create a Path" shortcut inside the picker (opening `NewPathDialog` inline), or persist session progress (e.g. in `sessionStorage`) so leaving-and-returning doesn't lose the count | `src/modules/capture-triage/components/PathPicker.tsx:21`, `src/modules/capture-triage/components/TriagePage.tsx:19` (`order`/`processedCount` are local state) |
| 4 | 🟡 | Action outcomes | "Promote to Goal" toast implies a durable Goal now exists | `promoteAction` only discards the Inbox `Action` (correct per ADR 0004) and the toast reads "Promoted to a new Goal “X” under Sport" — but no Goal is created anywhere, and `/paths/:id/goals` is still `NestedModulePlaceholder`. A user who goes looking for it finds nothing | Soften the toast until `goals` exists — e.g. "“X” retired from the Inbox — the Goals module will pick this up once it's built" — or otherwise flag it as provisional | `src/modules/capture-triage/components/TriagePage.tsx:57` |
| 5 | 🟡 | Accessibility | `PathPicker` / `AssignPicker` chips use `role="radio"` without the roving-tabindex / arrow-key behavior the ARIA radiogroup pattern requires | Each chip is an independent `<button>` — every one is a separate Tab stop and arrow keys do nothing, so the `role`/`aria-checked` promise doesn't match keyboard behavior. `jsx-a11y` doesn't catch this (it checks attributes, not interaction patterns), but the project targets WCAG 2.2 AAA | Either implement real roving-tabindex + arrow-key navigation, or drop the `radio` semantics and use plain toggle buttons with `aria-pressed` instead (simpler, matches actual behavior) | `src/modules/capture-triage/components/PathPicker.tsx:27`, `AssignPicker.tsx:38` |
| 6 | 🟡 | Forms | No unsaved-input guard on `QuickCaptureButton` or `PromoteToGoalDialog` | Typing into either and dismissing via Escape/backdrop/Cancel discards the text with no confirmation — `NewPathDialog` in `paths` set a precedent of guarding a dirty multi-field form | Low-friction single-field capture is arguably fine as-is; `PromoteToGoalDialog` has two fields (name + Path) and represents more lost work — worth a dirty-guard there at least | `src/modules/capture-triage/components/QuickCaptureButton.tsx:21`, `PromoteToGoalDialog.tsx:46` |
| 7 | 🟡 | Action outcomes | No in-flight / double-submit guard on Capture, Assign, or Promote | All three are synchronous today so a fast double-click is harmless — but there's no `disabled` guard if any of this becomes async (Dexie migration, matches `paths` gap #17) | Note for the Dexie migration; disable the triggering control while the mutation runs | `src/modules/capture-triage/components/QuickCaptureInput.tsx:33`, `TriageCard.tsx:44`, `PromoteToGoalDialog.tsx:60` |
| 8 | 🟡 | Data states | Long Path name in a picker chip doesn't wrap | Buttons carry `whitespace-nowrap` (`src/components/ui/button.tsx:7`); the chip container wraps onto new lines, but one very long unbroken Path name still forces a wide single chip that can overflow a narrow viewport | Allow the chip label to wrap, or truncate with a `title` tooltip, matching the treatment already given to the Path card title in `paths` | `src/modules/capture-triage/components/PathPicker.tsx:34` |
| 9 | 🟢 | Loading & async | Session progress resets on refresh | `order` and `processedCount` are local `useState`, seeded once on mount — reloading mid-triage restarts the "Item X of Y" count from the (now smaller) remaining Inbox, even though earlier items in the same real-world session were already processed | Acceptable for a lo-fi prototype; flag if a persistent session count ever matters | `src/modules/capture-triage/components/TriagePage.tsx:19` |
| 10 | 🟢 | Data states | No virtualization / pagination on the Inbox list | Fine at prototype scale; a very large Inbox (dozens+ items) renders as one long `<ul>` | Not worth solving now; revisit if real usage grows the Inbox significantly | `src/modules/capture-triage/components/InboxPage.tsx:36` |
| 11 | 🟢 | Cross-module | `MOCK_GOAL_OPTIONS` is a static, unowned list | Consistent with how `paths` stood in for `goals`/`vision` before those modules existed, but it means Goal options never reflect Goals a user "created" via Promote (which don't persist — see #4) | Delete `mock-goal-options.ts` and wire to `useGoals()` once `goals` is built (already called out in the file's own comment) | `src/modules/capture-triage/data/mock-goal-options.ts:1` |

### Categories checked with no new gaps

- **Boundary values** — no numeric inputs in this module; N/A.
- **Invalid formats** (email/URL) — no such fields; N/A.
- **Initial load skeleton** — `useLocalStorage` is synchronous; no async load, no blank-then-pop-in; N/A until a Dexie migration.
- **Offline** — LocalStorage-only, works fully offline; verified.
- **Special characters / unicode / emoji** — plain-text display and storage throughout; no encoding-sensitive rendering; verified.
- **Permissions / roles** — single `Owner`, no auth; N/A (same as every other module).
- **Deep-linking + refresh** — both routes are static paths (no `:id` param) and survive a refresh; the triage route degrades gracefully to the completion state when there's nothing queued (see Coverage).
- **State transitions** — `inbox → assigned` is the only transition this module exposes; no UI path exists to trigger an invalid one.
- **Destructive-action confirmation** — Discard deliberately has no blocking confirm (ADR 0004); backed by an Undo toast instead. By design, not a gap.

## Priority list

1. **Path-delete → orphaned Actions (#1)** — the only 🔴. Currently invisible
   (nothing displays an assigned Action's Path yet), but it's a real,
   silent data-integrity gap that will surface the moment `today` or `goals`
   reads `pathId`/`goalId` off `Action`.
2. **Corrupt-data recovery gap on the triage route (#2)** — the exact failure
   mode `paths` already solved, just not carried over to this module's
   second route.
3. **The no-Paths dead end + session-loss combo (#3)** — the cluster that
   makes the triage loop feel unfinished for a brand-new install with no
   Paths yet.
4. **Promote-to-Goal expectation mismatch (#4)** and the **radiogroup a11y
   gap (#5)** — one is about trust in the app's feedback, the other about the
   AAA accessibility bar this project holds itself to.
5. **Dirty-form guard on Promote (#6), long-Path-name chip overflow (#8)** —
   smaller consistency fixes against precedent already set in `paths`.
6. **Polish (#7, #9, #10, #11)** — double-submit guard, session-count
   resilience, list scale, and retiring the mock Goal data once `goals`
   ships.

## Hand-off to proto-harden

Implement first:
- Decide and implement what happens to an `Action` when its `Path` is
  deleted (#1) — likely: strip the `pathId`/`goalId` and return it to
  `inbox`, so nothing points at a ghost.
- Add the `dataUnreadable` check to `TriagePage` (#2).
- Give the "no Paths yet" states in the picker and the promote dialog a real
  way forward, and stop losing triage session progress when the user steps
  away to fix it (#3).
- Soften the Promote-to-Goal success copy until `goals` exists (#4), and fix
  the picker chips' keyboard semantics (#5).

## Hardening status (proto-harden, 2026-09-04)

| # | Status | Where it lives now |
|---|--------|--------------------|
| 1 | ✅ | `useActions` self-heals: an assigned `Action` whose `pathId` isn't among current `paths` is reset to `inbox` (`pathId`/`goalId` cleared) and toasted — `src/modules/capture-triage/hooks/use-actions.ts:31` |
| 2 | ✅ | `TriagePage` now checks `dataUnreadable` and renders `ActionsDataUnreadable`, same as `InboxPage` — `src/modules/capture-triage/components/TriagePage.tsx:40` |
| 3 | ✅ | `PathPicker` is self-sufficient (owns `usePaths()`) and shows an inline **New Path** button + `NewPathDialog` when there are no active Paths, so assigning/promoting never requires leaving triage — `src/modules/capture-triage/components/PathPicker.tsx:28` |
| 4 | ✅ | Promote toast reworded to stop implying a durable Goal exists — `src/modules/capture-triage/components/TriagePage.tsx:63` |
| 5 | ✅ (revised) | Dropped `role="radio"`/`radiogroup` in favor of plain toggle buttons with `aria-pressed` — matches the actual (non-roving) keyboard behavior instead of promising ARIA semantics the markup didn't implement — `PathPicker.tsx:63`, `AssignPicker.tsx:36`, `:49` |
| 6 | ✅ | `PromoteToGoalDialog` gained the same dirty-form discard guard as `NewPathDialog`; `QuickCaptureButton` left as-is (single field, low-friction, precedent supports skipping it) — `src/modules/capture-triage/components/PromoteToGoalDialog.tsx:28`, `:38` |
| 7 | ❌ deferred | Double-submit guard on Capture/Assign/Promote — harmless while every mutation is synchronous; note for the Dexie migration (matches `paths` #17) |
| 8 | ✅ | Picker chips wrap instead of forcing `whitespace-nowrap` off a long Path/Goal name — `PathPicker.tsx:67`, `AssignPicker.tsx:53` |
| 9 | ❌ deferred | Session progress resetting on refresh — acceptable for a lo-fi prototype; the count is a session-only affordance |
| 10 | ❌ deferred | No virtualization on the Inbox list — not worth solving at prototype scale |
| 11 | — | `MOCK_GOAL_OPTIONS` retirement is blocked on the `goals` module existing, not on this module's own hardening |
