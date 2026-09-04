# Paths — Edge Cases

Scope: whole module (all screens — `/paths`, `/paths/archived`, `/paths/:pathId`,
and the nested `vision` / `goals` placeholders). Audited against
`docs/modules/paths.md` and the built prototype in `src/modules/paths/`.

## Coverage

- **Spec already captured** (from `paths.md` → Edge Cases): no Paths at all; Path
  with no Achievements; Path with no Goals / empty Vision; all Achievements
  achieved; create Path with empty name; duplicate Path name; very long text;
  deleting / archiving the last active Path; un-mark achieved after it fed the
  graph; reorder with only one Path; LocalStorage unavailable or corrupt;
  deep-link to a deleted / archived `:pathId`.
- **Already handled in code**:
  - Empty Paths list → concept + CTA empty state — `src/modules/paths/components/PathsPage.tsx:41`
  - Path with no Achievements → section empty state — `src/modules/paths/components/AchievementsSection.tsx:126`
  - Empty name on create → Create still fires but is caught with an inline error — `src/modules/paths/components/NewPathDialog.tsx:45` + `:82`
  - Deep-link to missing `:pathId` → `PathNotFound` — `src/modules/paths/components/PathOverviewPage.tsx:36`
  - Archived list empty state — `src/modules/paths/components/ArchivedPathsPage.tsx:31`
  - LocalStorage not writable at mount → `StorageWarning` banner — `src/modules/paths/components/PathsPage.tsx:38` (only on `/paths`)
  - Reorder with one Path → drag handle hidden, Move up/down disabled — `src/modules/paths/components/PathCard.tsx:33`, `src/modules/paths/components/PathOverflowMenu.tsx:60`
  - Delete → confirmation dialog with a cascade summary — `src/modules/paths/components/DeletePathDialog.tsx`
  - Un-mark achieved clears the date — `src/modules/paths/hooks/use-paths.ts:175`
  - Contribution graph with no wins → all-empty grid + "0 wins" — `src/modules/paths/components/ContributionGraph.tsx:63`
- **New gaps found**: 18
- **By severity**: 🔴 3 · 🟡 9 · 🟢 6
- **Hardened (proto-harden, 2026-09-04)**: 12 closed, 1 partially closed (#3), 5 deferred — see "Hardening status" below.

## Inventory

| # | Severity | Category | Edge case | Behavior today | Suggested behavior | Where |
|---|----------|----------|-----------|----------------|--------------------|-------|
| 1 | 🔴 | Prototype-specific | LocalStorage write fails *after* mount (quota exceeded, mode change) | `setItem` throws, is caught, only `console.error` — the UI shows the change but nothing persists; no user feedback | Detect the write failure and surface a persistent "changes aren’t being saved" banner + keep the in-memory state so the session still works | `src/shared/hooks/use-local-storage.ts:19`, consumed at `src/modules/paths/hooks/use-paths.ts:36` |
| 2 | 🔴 | Errors | Corrupt / unparseable `paths` value in LocalStorage | `JSON.parse` throws, is caught, silently falls back to `[]` — the user sees the first-run empty state and assumes every Path is gone | Distinguish "no data" from "unreadable data": show a "we couldn’t read your saved Paths" state with a way to reset, don’t masquerade as empty | `src/shared/hooks/use-local-storage.ts:8` |
| 3 | 🔴 | Cross-module | Delete-cascade summary counts are mock (`mockGoalCount`, `mockActionCount`, `mockVisionTileCount`) | Dialog can claim "3 Goals, 24 Actions" for a Path that in reality has none yet (or vice-versa) — the confirmation is untrustworthy | Until `goals` / `vision` exist, compute from real data where possible and label the rest as an estimate; wire to real counts when those modules land | `src/modules/paths/hooks/use-paths.ts:190`, `src/modules/paths/components/DeletePathDialog.tsx:30` |
| 4 | 🟡 | Prototype-specific | `StorageWarning` is only rendered on `/paths` | A user who deep-links to `/paths/:pathId` or `/paths/archived` and edits there gets no signal that saves are failing | Lift the storage check into a shared layout / context so the banner shows on every module screen | `src/modules/paths/components/PathOverviewPage.tsx`, `src/modules/paths/components/ArchivedPathsPage.tsx` |
| 5 | 🟡 | Forms | Unsaved input in **New Path** modal | Escape, backdrop click, or Cancel discards a typed name + several Achievement rows with no warning | Confirm before discarding when the form is dirty (or make backdrop/Escape a soft close that asks) | `src/modules/paths/components/NewPathDialog.tsx:31` |
| 6 | 🟡 | Action outcomes | Archive has no confirmation | Menu → Archive archives instantly; `paths.md` calls for "a light confirm" | Add a lightweight confirm ("Archive “Sport”? Its contents are kept and you can restore it anytime.") | `src/modules/paths/components/PathOverviewPage.tsx:52`, `src/modules/paths/components/PathOverflowMenu.tsx:66` |
| 7 | 🟡 | Action outcomes | No success / undo feedback for archive, unarchive, delete, reorder | Actions happen silently; archive/delete also navigate away with no confirmation toast | Toast with an Undo affordance for archive & reorder; a plain confirmation toast for delete | `src/modules/paths/components/PathOverviewPage.tsx:52`, `src/modules/paths/components/PathsPage.tsx` |
| 8 | 🟡 | Navigation & flow | Create Path doesn’t land on the new Path | `paths.md` flow says the user should land on the new overview; today the modal just closes and a card appears at the end of the grid (easy to miss below the fold) | Navigate to `/paths/:newId` on create, or scroll to + briefly highlight the new card | `src/modules/paths/components/NewPathDialog.tsx:52`, `src/modules/paths/components/PathsPage.tsx:104` |
| 9 | 🟡 | Loading & async | Focus is dropped after dialog-close + navigation | After "Create your first Path" the empty-state button unmounts; after Delete on the overview the page navigates — focus falls to `<body>` | Move focus to a sensible anchor (the new card / the page `<h1>`) after each of these transitions | `src/modules/paths/components/PathsPage.tsx:49`, `src/modules/paths/components/PathOverviewPage.tsx:110` |
| 10 | 🟡 | Data states | Long Path name in the card | The card `<h3>` link has no truncation/wrap guard — a long unbroken name can stretch the grid column | `line-clamp` or `break-words` on the card title, matching the archived-list treatment (`ArchivedPathsPage.tsx:38` already truncates) | `src/modules/paths/components/PathCard.tsx:44` |
| 11 | 🟡 | Cross-module | Editing an **archived** Path’s Achievements | The overview renders fully for an archived Path — Achievements are add/edit/check/deletable as normal, only a small "Archived" label differs | Decide: make archived overviews read-only, or keep them editable but visually de-emphasised; today it’s ambiguous | `src/modules/paths/components/PathOverviewPage.tsx:42` |
| 12 | 🟡 | State transitions | Mark Achievement achieved → un-mark → re-mark loses the original date | Re-marking stamps *today*, silently overwriting the historical `achievedOn` | Keep the first achieved date unless the user explicitly edits it, or show that the date was reset | `src/modules/paths/hooks/use-paths.ts:171` |
| 13 | 🟡 | Forms | No length limit on Path name or Achievement text | Arbitrarily long strings are accepted and stored | Soft max length with a counter, or a hard cap, on both inputs | `src/modules/paths/components/NewPathDialog.tsx:66`, `src/modules/paths/components/AchievementsSection.tsx:150` |
| 14 | 🟢 | Data states | Reorder on touch devices | HTML5 drag-and-drop doesn’t fire on touch; mobile users can only reorder via the overflow menu’s Move up/down, which isn’t obviously a reorder affordance | Add a visible "Reorder" hint on mobile, or a dedicated reorder mode | `src/modules/paths/components/PathsPage.tsx:60` |
| 15 | 🟢 | Data states | "All Achievements achieved" has no distinct treatment | Counter reads `8/8`; otherwise identical to a partial list | Subtle done treatment on the section header (spec suggested this) | `src/modules/paths/components/AchievementsSection.tsx:117` |
| 16 | 🟢 | Data states | Timezone: `achievedOn` and `winDays` keys use UTC (`toISOString().slice(0,10)`) | Near local midnight, "today" can land on the wrong calendar day / graph cell | Use local-date formatting for day keys | `src/modules/paths/hooks/use-paths.ts:28`, `src/modules/paths/components/ContributionGraph.tsx:24` |
| 17 | 🟢 | Forms | Double-submit of the New Path form | Sync `setState`, so a fast second click is harmless today — but there’s no `in-flight`/disabled guard if creation ever becomes async (Dexie) | Disable Create on submit; keep in mind for the Dexie migration | `src/modules/paths/components/NewPathDialog.tsx:52` |
| 18 | 🟢 | Data states | Achievement `achievedOn` shown as raw ISO (`2026-03-12`) | Fine, but inconsistent with how dates might read elsewhere | Format consistently once a date convention exists | `src/modules/paths/components/AchievementsSection.tsx:72` |

### Categories checked with no new gaps

- **Boundary values** — no numeric inputs in this module; N/A.
- **Invalid formats** (email/URL) — no such fields; N/A.
- **Initial load skeleton** — `useLocalStorage` is synchronous, there is no async
  load and no blank-then-pop-in; N/A until the Dexie migration.
- **Offline** — LocalStorage-only, works fully offline; verified.
- **Back button mid-flow** — browser back after a delete lands on
  `/paths/:deletedId` and correctly renders `PathNotFound`; OK.
- **Deep-linking + refresh** — `/paths/:pathId` and `/paths/archived` survive a
  refresh (route + LocalStorage); OK.
- **Empty contribution graph** — handled (`ContributionGraph.tsx:63`).

## Priority list

1. **Silent persistence failures (#1, #2)** — in a LocalStorage prototype the
   browser *is* the backend. A full quota or a corrupt value currently looks
   identical to "everything is fine" / "you have no data". This is the only
   place the user can lose trust in the whole app.
2. **Untrustworthy delete-cascade counts (#3)** — the one destructive,
   irreversible action in the module is confirmed against mock numbers. Even a
   "these are estimates" label is better than a confident wrong count.
3. **Storage warning coverage + archive confirm + action feedback (#4, #6, #7)**
   — the cluster that makes destructive and persistence-sensitive actions feel
   safe: show the save-failure banner everywhere, confirm archive, and give
   archive/reorder an undoable toast.
4. **Create-Path flow completion (#8, #9)** — land on the new Path and keep
   focus sane; small changes, real improvement to the primary flow.
5. **Long-text + archived-overview ambiguity (#10, #11)** — layout robustness
   and a clear decision on whether archived Paths are read-only.
6. **Polish (#12–#18)** — date preservation, length limits, touch reorder hint,
   done treatment, timezone.

## Hardening status (proto-harden, 2026-09-04)

| # | Status | Where it lives now |
|---|--------|--------------------|
| 1 | ✅ | `src/shared/hooks/use-local-storage.ts:52` reports write failure → `src/shared/lib/storage-health.ts` → `src/shared/components/StorageHealthBanner.tsx` (in `AppShell`); value kept in memory so the session survives |
| 2 | ✅ | `src/shared/hooks/use-local-storage.ts:19` flags a present-but-unparseable value → `usePaths().dataUnreadable` → `src/modules/paths/components/PathsDataUnreadable.tsx` (dedicated recovery screen on all three Paths routes) |
| 3 | 🟨 partial | Cascade counts labelled as estimates — `src/modules/paths/components/DeletePathDialog.tsx:45`. Real counts still blocked on the `goals` / `vision` modules. |
| 4 | ✅ | `StorageHealthBanner` rendered in `src/shared/components/AppShell.tsx` — every screen; also fires on the mount probe (storage blocked outright) |
| 5 | ✅ | `src/modules/paths/components/NewPathDialog.tsx` — dirty-form discard confirmation intercepts Cancel / Escape / backdrop |
| 6 | ✅ (revised) | Designer chose **undo toast over a confirm dialog** for Archive — `src/modules/paths/components/PathsPage.tsx` + `PathOverviewPage.tsx`; `usePaths().archivePath` returns an exact-state restore fn |
| 7 | ✅ | Undo toast for archive & reorder; plain confirmation toast for delete & unarchive — `PathsPage.tsx`, `PathOverviewPage.tsx`, `ArchivedPathsPage.tsx`, `src/shared/components/toast/` |
| 8 | ✅ | `src/modules/paths/components/PathsPage.tsx` `onCreate` → `navigate('/paths/:newId')` |
| 9 | ✅ | Heading takes focus after post-delete navigation — `src/modules/paths/components/PathsPage.tsx` (`headingRef`, router `state.deletedName`). Empty-state-CTA focus is moot now that create navigates away. |
| 10 | ✅ | `src/modules/paths/components/PathCard.tsx:44` — `line-clamp-2 break-words` on the card title |
| 11 | ✅ | Archived Path overview is read-only + a restore banner — `src/modules/paths/components/PathOverviewPage.tsx` (`readOnly`), `AchievementsSection.tsx` (`readOnly` prop disables add/edit/check/delete) |
| 12 | ✅ | `src/modules/paths/hooks/use-paths.ts` `setAchievementState` keeps the original `achievedOn` on re-tick |
| 13 | ❌ deferred | Length limits on name / achievement text — low value now; revisit with the Dexie migration and real form fields |
| 14 | ❌ deferred | Touch-device reorder hint — low; the overflow-menu Move up/down already works on touch, only discoverability is weak |
| 15 | ✅ | `src/modules/paths/components/AchievementsSection.tsx` — `allAchieved` gives the counter a check icon + full-strength colour |
| 16 | ✅ | Local-date keys — `src/modules/paths/hooks/use-paths.ts` `todayLocalIso`, `src/modules/paths/components/ContributionGraph.tsx` `localIso` |
| 17 | ❌ deferred | Double-submit guard — harmless while creation is synchronous; note for the Dexie migration |
| 18 | ❌ deferred | Date formatting convention — needs an app-wide decision, out of scope for one module |

## Hand-off to proto-harden

Implement first:
- Persistence failure states — a write-failure banner surfaced app-wide, and a
  distinct "couldn’t read saved data" state separate from the empty state.
- A confirmation for Archive and an Undo-capable toast for archive / reorder;
  a confirmation toast after Delete.
- Label the delete-cascade counts as estimates until `goals` / `vision` feed
  real numbers.
- Create Path → navigate to the new overview; fix focus after dialog-close and
  after post-delete navigation.
- Truncate/wrap the Path card title; decide read-only vs editable for archived
  Path overviews.
