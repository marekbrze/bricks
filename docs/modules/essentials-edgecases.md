# Essentials — Edge Cases

Scope: whole module (`/paths/:pathId/essentials`), plus the `EssentialsSummary`
embed on the Path overview and the `logEssentialCompletion` / `Action.note` /
`Action.essentialId` surface that lives in `capture-triage`. Audited against
`docs/modules/essentials.md` and the built prototype in `src/modules/essentials/`.

## Coverage

- **Spec already captured** (from `essentials.md` → Edge Cases): no Essentials
  for the Path; Essential with zero completions; many logs in one day; undo a
  log; delete an Essential with completions; delete / archive the Path; two
  Essentials with the same name; very long name / detail; large all-time count;
  empty comment in the log dialog; unsaved dialog input; `essentials` write
  fails; `essentials` corrupt; deep-link to a deleted `:pathId`; reorder with
  one Essential; timezone of "today's count".
- **Already handled in code**:
  - Empty list → concept copy + **Add your first essential** + 5 seed examples — `src/modules/essentials/components/EssentialsPage.tsx:119`
  - Archived Path → read-only: restore banner, no **New essential**, no **Log**, no reorder, no row menu — `EssentialsPage.tsx:95`, `EssentialRow.tsx` (`readOnly` hides the action cluster)
  - Corrupt `essentials` → `EssentialsDataUnreadable` on the tab and on the Path overview — `EssentialsPage.tsx:60`, `PathOverviewPage.tsx` guard
  - Corrupt `paths` / `actions` also guarded on the tab — `EssentialsPage.tsx:58,62`
  - Deleted `:pathId` → shared `PathNotFound` — `EssentialsPage.tsx:64`
  - Empty deed name → inline error in the dialog + no-op in the hook — `EssentialDialog.tsx:78`, `use-essentials.ts:66`
  - Dirty-form confirm before discarding (name or detail) — `EssentialDialog.tsx:60`; log dialog only guards once the comment has text — `LogEssentialDialog.tsx:46`
  - Whitespace-only comment → stored as no `note` — `use-actions.ts` `logEssentialCompletion` (`note?.trim()` gate)
  - Undo on log, delete, reorder (snapshot-restore) — `use-essentials.ts`, `EssentialsPage.tsx:200,225`
  - Delete keeps the completion Actions; the dialog says so with the real count — `DeleteEssentialDialog.tsx:36`
  - Path deleted elsewhere → the Path's Essentials are cascade-removed on the next `useEssentials()` mount (self-heal, mirrors `useVision`) — `use-essentials.ts:29`
  - Same-name Essentials allowed; per-row counts stay separate (keyed by `essentialId`, not name) — `use-actions.ts` `essentialCompletionCounts`
  - "Today's count" uses the local calendar day of `completedAt`, not UTC — `use-actions.ts` `essentialCompletionCounts` / `essentialCompletionCountsForPath`
  - Reorder clamps out-of-range indexes; Move up/down disabled at the ends — `use-essentials.ts:118`, `EssentialRow.tsx` (`canMoveUp`/`canMoveDown`)
  - `DeletePathDialog` cascade summary carries an "N Essentials" line (all 3 call sites) — `DeletePathDialog.tsx:33`
- **New gaps found**: 12
- **By severity**: 🔴 0 · 🟡 4 · 🟢 8

## Inventory

| # | Severity | Category | Edge case | Behavior today | Suggested behavior | Where |
|---|----------|----------|-----------|----------------|--------------------|-------|
| 1 | 🟡 | Action outcomes | Drag-reorder that resolves to the **same position** still shows a "Reordered · Undo" toast whose Undo does nothing | `reorderEssential` returns a `() => {}` no-op on `from === clamped` (or unknown id); `handleDropOn` always calls `showToast('Reordered', { onClick: undo })` — a dead Undo, and the toast is also the screen-reader announcement that the list changed, so it lies | Make `reorderEssential` return `UndoFn \| null` (null on any no-op), and only toast when it's non-null — exactly what `vision`'s `reorderTile` / `VisionBoardPage.handleReorder` already do | `src/modules/essentials/hooks/use-essentials.ts:112`, `src/modules/essentials/components/EssentialsPage.tsx:67` |
| 2 | 🟡 | Cross-module / lifecycle | Deleting a Path **resurrects its logged Essential completions as Inbox items** | A logged completion is a `done` standalone Action with `pathId` set. `usePaths.deletePath` only clears the `paths` key; `useActions`' self-heal then finds the now-orphaned Action and resets it to `state:'inbox', pathId:null, completedAt:null` (keeping `essentialId`). A months-old "done" deed reappears in the Inbox as an un-triaged idea — surprising, and it silently drops out of the WinLog | On Path delete, Actions that are `done` **and** carry an `essentialId` should be deleted with the Path (cascade), not returned to the Inbox. Add an explicit `deleteEssentialLogsForPath` call in the delete flow, or special-case `essentialId`-tagged `done` rows in `useActions`' self-heal | `src/modules/capture-triage/hooks/use-actions.ts:41` (self-heal), `src/modules/paths/hooks/use-paths.ts:126` (`deletePath`) |
| 3 | 🟡 | Data states / responsive | `EssentialRow` action cluster is tight at ~360 px | Row is `grip · name+detail (flex-1) · counter (shrink-0) · Log button · ⋮`. With a long counter ("Not logged yet") the two buttons + counter crowd the name to a sliver on a narrow phone, and the counter can wrap mid-phrase | Drop the counter below the name on `< sm` (stack), or shorten it ("—" / "0" when never logged), matching how `GoalRow` will need the same treatment | `src/modules/essentials/components/EssentialRow.tsx:60` |
| 4 | 🟡 | UX clarity | The Path overview shows a logged deed **twice**: once in **Wins** (small-win +1) and once in **Essentials · N completed** | Both are correct and deliberate (ADR 0051 — accept), but two counters on one screen moving together for the same click reads as a bug to a first-time user | Copy / label so they read as different lenses — e.g. Essentials line as "128 logged" or "128 done here", and keep the win balance as the everything-count. A one-line helper or distinct verb is enough | `src/modules/essentials/components/EssentialsSummary.tsx:47` |
| 5 | 🟢 | Data states | Long deed name / detail clip with no way to see the rest | Name is `line-clamp-2`, detail `line-clamp-1`, both `break-words` — a 3-line deed name is silently cut, no `title` tooltip | Add `title={essential.name}` (and detail) so the full text is at least hoverable, matching the goals #5 finding | `src/modules/essentials/components/EssentialRow.tsx:66` |
| 6 | 🟢 | Forms & input | No length limit on the deed name / detail / comment | All three accept unbounded text (a data-URL-length paste would bloat the `essentials` / `actions` key) | Soft `maxLength` (~140 name, ~200 detail, ~500 comment) once the app adopts an input-length convention — currently deferred project-wide (paths #13) | `src/modules/essentials/components/EssentialDialog.tsx:107`, `LogEssentialDialog.tsx:85` |
| 7 | 🟢 | Efficiency | Per-row counter recomputes over **all** Actions on every render | `EssentialRow` calls `essentialCompletionCounts(id)` which loops the whole `actions` array; N essentials × M actions per render. Fine at prototype scale, wasteful with months of history | Build one `Map<essentialId, {total, today}>` in `useActions` (memoised on `actions`) and look up by id | `src/modules/capture-triage/hooks/use-actions.ts` (`essentialCompletionCounts`), `src/modules/essentials/components/EssentialRow.tsx:32` |
| 8 | 🟢 | Action outcomes | Reorder toast copy is inconsistent | Drag says `"Reordered"`; the row menu's Move up/down says `"Moved “X”"` | Pick one — `"Moved “X”"` carries more information and matches `PathGoalsSection` | `src/modules/essentials/components/EssentialsPage.tsx:73,78` |
| 9 | 🟢 | Data states | Empty-state seed examples are always the **body-Path** set | `SEED_ESSENTIALS.slice(0,5)` shows hang/barefoot/get-up regardless of the Path's name; the sales set is only mentioned in prose | `proto-detail` left the final call here — either pick the seed set by a Path-name heuristic, or keep the body set as a labelled generic illustration (current copy already labels it "For a body Path, e.g.:") | `src/modules/essentials/components/EssentialsPage.tsx:137`, `src/modules/essentials/lib/seed-examples.ts` |
| 10 | 🟢 | Cross-module | A logged-completion Action can be **rescheduled** from the flat Actions view into a day | `scheduleAction` keeps `state:'done'` for a `done` row, so it lands on that day as a completed item — harmless but odd; deleting it there silently drops the essential's count with no feedback on the tab (expected for a derived count, but worth a note) | Leave as-is for the prototype; revisit if users actually do it. The derived count is self-correcting | `src/modules/capture-triage/hooks/use-actions.ts` (`scheduleAction`) |
| 11 | 🟢 | Loading & async | Log "Log it" button isn't disabled during submit | Creation is synchronous, so a double-press is a harmless no-op (dialog already closed) | Add an in-flight guard only if creation ever becomes async — matches the project-wide deferred double-submit stance (paths #17) | `src/modules/essentials/components/LogEssentialDialog.tsx:54` |
| 12 | 🟢 | Data states | `EssentialsPage` `<h1>` (the Path name) has no wrap class | `text-xl font-semibold`, no `break-words` — a very long Path name could overflow on mobile; same as the existing `PathOverviewPage` / `PathActionsPage` headers | Add `break-words` here and align the other Path-tab headers in one pass | `src/modules/essentials/components/EssentialsPage.tsx:88` |

If a category had no gaps: **State transitions** — no issues found (an `Essential` has no state machine; a completion is a one-shot `done` Action). **Navigation & flow** — no issues found (each tab is its own route; deep-link + refresh + back all work; no dead ends — the empty state and read-only state both offer a way forward). **Errors** — no issues found beyond the storage cases already covered (no `alert()`, every corrupt-key path has a recovery screen).

## Priority list
1. **#1 — dead Undo on a no-op reorder.** One-line hook change + one guard; removes a misleading toast/announcement. Highest impact-per-effort.
2. **#2 — logged completions resurrecting in the Inbox on Path delete.** Real cross-module correctness bug; a completed deed should not become an un-triaged idea. Needs a cascade rule in `useActions` self-heal or the delete flow.
3. **#3 — narrow-screen row density.** The tab is a phone surface (log a deed on the couch); the row must not crush the deed name.
4. **#4 — two counters for one event on the overview.** Copy fix so Wins vs Essentials read as different lenses, not a double-count bug.

## Hand-off to proto-harden
Implement, in order: #1 (`reorderEssential` returns `UndoFn | null`; guard the toast), #2 (cascade-delete `essentialId`-tagged `done` Actions on Path delete instead of Inbox-restoring them), #3 (stack the counter under the name on `< sm`), #4 (relabel the overview summary count). #5–#12 are polish / deferred-by-convention — fold into `proto-design` / `proto-polish` or the project-wide input-length pass.
