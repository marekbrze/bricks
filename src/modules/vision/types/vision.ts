import type { BaseEntity } from '@/shared/types'

/**
 * `VisionNoteTile` — a short text fragment on the board (how the Owner wants
 * to feel, small things they want). Deliberately small; no wall-of-text
 * editing. See docs/GLOSSARY.md.
 */
export interface VisionNoteTile {
  id: string
  type: 'note'
  text: string
}

/** Attribution for a photo pulled from Unsplash — carried through to the export. */
export interface VisionImageAttribution {
  photographer: string
  profileUrl: string
  /**
   * The photo's own page on Unsplash. Optional: tiles added before the live
   * API landed (ADR 0019), and ones picked from the bundled sample pool, have
   * only a profile link.
   */
  photoUrl?: string | null
}

/**
 * `VisionImageTile` — a photo tile, from a local upload (`src` is a data URL)
 * or picked from the Unsplash search, where `src` hotlinks Unsplash's CDN as
 * their API guidelines require (ADR 0019).
 */
export interface VisionImageTile {
  id: string
  type: 'image'
  src: string
  alt: string
  source: 'upload' | 'unsplash'
  attribution: VisionImageAttribution | null
}

/**
 * `VisionAchievementTile` — a thing to reach "along the way", as a board tile
 * rather than a Path-level checklist entry (ADR 0037). Order-independent by
 * nature; `open` ↔ `achieved` is deliberately reversible (mistakes happen).
 */
export type VisionAchievementState = 'open' | 'achieved'

export interface VisionAchievementTile {
  id: string
  type: 'achievement'
  title: string
  state: VisionAchievementState
  /** ISO date (YYYY-MM-DD) stamped when marked achieved; null while open. */
  achievedOn: string | null
}

export type VisionTile = VisionNoteTile | VisionImageTile | VisionAchievementTile

/**
 * `Vision` — the picture of the future for a Path: one ordered board of
 * note, image and achievement tiles. One per Path (ADR 0016), created lazily
 * on first tile add. See docs/modules/vision.md.
 */
export interface Vision extends BaseEntity {
  pathId: string
  /** Board order — all tile types share one sequence, no separate ordering per type. */
  tiles: VisionTile[]
}
