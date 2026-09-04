import type { BaseEntity } from '@/shared/types'

/**
 * `Achievement` — an order-independent "along the way" item on a Path.
 * Not a task; needs no concrete actions ("I can do a pull-up", "muscle-up").
 * `open` ↔ `achieved` is deliberately reversible (mistakes happen).
 * See docs/GLOSSARY.md and docs/modules/paths.md.
 */
export type AchievementState = 'open' | 'achieved'

export interface Achievement {
  id: string
  title: string
  state: AchievementState
  /** ISO date (YYYY-MM-DD) stamped when marked achieved; null while open. */
  achievedOn: string | null
}

/**
 * `Path` — the top-level, never-ending life direction everything else hangs off.
 * See docs/ENTITY_MAP.md.
 *
 * Achievements are embedded here (they hang directly off the Path and are
 * order-independent). The `mock*` counters stand in for data that the
 * `goals`/`vision` modules will own once fully wired — the `paths` prototype
 * needs them for the cascade-delete summary. The contribution graph is real:
 * `winlog` computes it from `Action.completedAt` / `Goal.achievedOn` — see
 * `useWinLog`.
 */
export interface Path extends BaseEntity {
  name: string
  /** Manual order among active Paths — drives Today view section order. */
  order: number
  archived: boolean
  /** ISO timestamp when archived; null while active. */
  archivedAt: string | null
  achievements: Achievement[]
  /** First Vision note, truncated — shown as the card / overview snippet. */
  visionSnippet: string

  // --- mock stand-ins until the owning modules exist ---
  /** Mock: number of Goals under this Path (owned by `goals`). */
  mockGoalCount: number
  /** Mock: number of Actions under this Path incl. under Goals (owned by `goals` / `capture-triage`). */
  mockActionCount: number
  /** Mock: number of Vision tiles (owned by `vision`). */
  mockVisionTileCount: number
}

export interface PathCascadeCounts {
  visionTiles: number
  achievements: number
  goals: number
  actions: number
}
