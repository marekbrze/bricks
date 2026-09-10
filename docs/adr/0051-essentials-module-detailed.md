# 0051 - Essentials module detailed

**Date**: 2026-09-10
**Module**: essentials
**Status**: Accepted

## Context
`docs/changes/essentials.md` (ADR 0050) planned the Essentials feature. This ADR
records the module spec (`docs/modules/essentials.md`) and the shared-doc changes
it made, plus three open decisions the plan left to `proto-detail`.

## Decision

**Module spec written** — `docs/modules/essentials.md`: entity `Essential`
(per-Path, `name` + optional `detail` + manual `order`, no stored completion
data), the Essentials Path tab (`/paths/:pathId/essentials`) with
create/edit/reorder/delete, `LogEssentialDialog` (optional comment → an
already-`done` `Action`), `EssentialsSummary` on the Path overview, the
data-unreadable recovery screen, and archived-Path read-only behaviour.

**Shared docs updated**:
- `ENTITY_MAP.md` — new `Essential` entity; `PATH ||--o{ ESSENTIAL`; soft link
  `ESSENTIAL ||--o{ ACTION` via `Action.essentialId`; `Action` now also carries
  optional `note`; a "logged Essential completion" is defined as a directly-`done`
  standalone Action.
- `ACTIONS.md` — new **Essential** section (create, edit, reorder, delete, log
  completion, view progress); `Action` table gains "Log an Essential completion".
- `GLOSSARY.md` — `Essential` term (PL "AND / absolutnie niezbędne działanie /
  niezbędny czyn"); `essentials` row in the Design modules table.
- `UI-STRATEGY.md` — Path tab bar is now Overview · Actions · Vision · Essentials;
  nested route `/paths/:pathId/essentials` documented.
- `MODULES.md` — `essentials` module section + integration-map edges.

**Open decisions resolved**:
1. **Overview section order** — Vision → **Wins → Essentials** → Goals. Wins
   stays put (minimal disruption to existing layout/stories); Essentials is
   inserted directly below it (the two standing counts together) and above the
   Goal tree (discipline leads into execution).
2. **WinLog: accept vs exclude Essential completions** — **accept**. A logged
   Essential is a genuine `done` `Action` and counts as a small win in the Log
   and every `WinBalance` scope. No `winlog` code change; keeps it
   derivation-only; consistent with DESIGN.md ("accumulation is the reward").
   The Essentials-tab counter and `WinBalance` answer different questions (this
   deed vs everything), so both standing counts is correct, not a duplicate.
3. **PathTabs icon** — `Anchor` (lucide). Calm and steadfast, fits the
   "spokojne, kamienne, wytrwałe" personality; not a streak flame (anti-ref
   Habitica); visually distinct from Signpost / ListTodo / Image.

## Impact
`proto-lofi essentials` builds against this spec. The `capture-triage` residual
edits (`Action.note` / `Action.essentialId` / `logEssentialCompletion`) from
`docs/changes/essentials.md` must land first — the lofi screen calls the hook.
`Action` gains two optional fields; no migration (absent on every existing row).
