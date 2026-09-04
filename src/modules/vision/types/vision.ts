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
}

/**
 * `VisionImageTile` — a photo tile, from a local upload (`src` is a data URL)
 * or picked from the (mocked, in this prototype) Unsplash search — see ADR 0016.
 */
export interface VisionImageTile {
  id: string
  type: 'image'
  src: string
  alt: string
  source: 'upload' | 'unsplash'
  attribution: VisionImageAttribution | null
}

export type VisionTile = VisionNoteTile | VisionImageTile

/**
 * `Vision` — the picture of the future for a Path: one ordered board of
 * note + image tiles. One per Path (ADR 0016), created lazily on first tile
 * add. See docs/modules/vision.md.
 */
export interface Vision extends BaseEntity {
  pathId: string
  /** Board order — notes and images share one sequence, no separate ordering per type. */
  tiles: VisionTile[]
}
