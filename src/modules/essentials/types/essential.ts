import type { BaseEntity } from '@/shared/types'

/**
 * `Essential` — an **Absolutely Necessary Deed** for a `Path`: a repeatable,
 * non-negotiable action the Owner commits to keep doing (Schwarzenegger's
 * autobiography — every area of life has a few; a salesperson's "call clients",
 * a body Path's "hang from a bar"). Habit-like, but **free-tracked** — no
 * cadence target, no streak.
 *
 * Defined once per Path, then *logged* each time it's done (many per day is
 * fine). A log creates an already-`done` standalone `Action` under the Path
 * carrying `essentialId` — the Essential stores no completion data itself; the
 * per-Essential counts are derived by counting those Actions
 * (`useActions().essentialCompletionCounts`).
 *
 * See docs/ENTITY_MAP.md and docs/modules/essentials.md.
 */
export interface Essential extends BaseEntity {
  /** Owning Path — always exactly one. */
  pathId: string
  /** The deed, e.g. "Hang from a bar — 60s total across the day". */
  name: string
  /** Optional one-line why/how, e.g. "anytime, split across the day". */
  detail: string
  /** Manual position within the Path's Essentials list. */
  order: number
}
