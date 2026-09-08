import type { BaseEntity } from '@/shared/types'

/**
 * Legacy shape (pre-ADR-0037): an Achievement used to be an order-independent
 * "along the way" item embedded on the Path record and rendered as an overview
 * checklist. It is a Vision achievement tile now (`vision` module) — this type
 * exists only so `useVision` can migrate old stored data onto the board.
 */
export interface LegacyAchievement {
  id: string
  title: string
  state: 'open' | 'achieved'
  /** ISO date (YYYY-MM-DD) stamped when marked achieved; null while open. */
  achievedOn: string | null
}

/** A stored Path that may still carry the pre-ADR-0037 embedded achievements. */
export type LegacyPath = Path & { achievements?: LegacyAchievement[] }

/**
 * `Path` — the top-level, never-ending life direction everything else hangs off.
 * See docs/ENTITY_MAP.md.
 *
 * Achievements are Vision achievement tiles now (ADR 0037) — they hang off the
 * Path's Vision, not the Path record. The `mock*` counters stand in for data
 * that the `goals`/`vision` modules own — the `paths` prototype needs them for
 * the cascade-delete summary. The contribution graph is real: `winlog` computes
 * it from `Action.completedAt` / `Goal.achievedOn` — see `useWinLog`.
 */
export interface Path extends BaseEntity {
  name: string
  /** Manual order among active Paths — drives Today view section order. */
  order: number
  archived: boolean
  /** ISO timestamp when archived; null while active. */
  archivedAt: string | null

  // --- mock stand-ins until the owning modules exist ---
  /** Mock: number of Goals under this Path (owned by `goals`). */
  mockGoalCount: number
  /** Mock: number of Actions under this Path incl. under Goals (owned by `goals` / `capture-triage`). */
  mockActionCount: number
  /** Mock: number of Vision tiles (owned by `vision`). */
  mockVisionTileCount: number
}

/**
 * What a Path's cascade delete will destroy. Achievement tiles live in the
 * Path's Vision (ADR 0037), so their count is supplied by `vision` at the
 * call site rather than known here — `DeletePathDialog` asks for it alongside.
 */
export interface PathCascadeCounts {
  visionTiles: number
  goals: number
  actions: number
}
