import type { BaseEntity } from '@/shared/types'

/**
 * `Goal` — an execution-oriented sub-goal under a `Path`. Distinct from
 * `Vision` (no hard actions) and `Achievement` (order-independent, no work
 * layer) — a Goal contains `Action`s and needs concrete work to move.
 * Forms a shallow tree via `parentGoalId`. Priority order is manual, per
 * sibling group (top-level Goals under a Path, or sub-Goals under one
 * parent) — never an automatic sort. See docs/GLOSSARY.md and
 * docs/modules/goals.md.
 */
export type GoalState = 'active' | 'achieved' | 'abandoned'

export interface Goal extends BaseEntity {
  name: string
  description: string
  pathId: string
  /** Null for a top-level Goal; otherwise the parent Goal's id (same Path). */
  parentGoalId: string | null
  /** Manual priority order among siblings (same pathId + parentGoalId). */
  order: number
  /** ISO date (YYYY-MM-DD); null when the Goal has no deadline. */
  deadline: string | null
  state: GoalState
  /** ISO date stamped when marked achieved; null otherwise. Reversible via Reactivate. */
  achievedOn: string | null
  /** Star-like toggle. Marking a Goal a frog propagates once to its current Actions. */
  frog: boolean
}

export interface GoalCascadeCounts {
  subGoals: number
  actions: number
}
