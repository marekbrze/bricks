import type { BaseEntity } from '@/shared/types'

/**
 * `Action` — an atomic thing to do. Captured into the Inbox with just a name,
 * then triaged: assigned to a Goal, assigned standalone to a Path, or
 * promoted into a brand-new Goal. Owned by `capture-triage` — `today` and
 * `goals` extend its lifecycle (`scheduledDate`, `completedAt`, `done` /
 * `abandoned`, `frog` propagation) once those modules are built.
 * See docs/ENTITY_MAP.md and docs/modules/capture-triage.md.
 */
export type ActionState = 'inbox' | 'assigned' | 'done' | 'abandoned'

export interface Action extends BaseEntity {
  name: string
  state: ActionState
  /** Set once triaged (standalone, or via a Goal that belongs to this Path). Null while in the Inbox. */
  pathId: string | null
  /** Max one Goal. Null when standalone or still in the Inbox. */
  goalId: string | null
  /** Star-like toggle; a frog Goal propagates here once `goals` exists. Not editable in this module. */
  frog: boolean
  /** Owned by `today` once built. */
  scheduledDate: string | null
  /** Owned by `today` once built. */
  completedAt: string | null
  /**
   * Manual position among its Goal's own Actions, read ONLY on the Goal
   * progress page (ADR 0042) — aggregate views keep their automatic sort.
   * Optional on purpose: rows stored before it existed (and mocks) stay
   * valid and sort after sequenced ones by creation order — no migration.
   */
  order?: number
}
