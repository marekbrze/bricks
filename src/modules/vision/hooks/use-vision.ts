import { useCallback, useEffect, useMemo } from 'react'
import { useLocalStorageState } from '@/shared/hooks/use-local-storage'
import { generateId } from '@/shared/types'
import { todayLocalIso } from '@/shared/lib/date'
import { usePaths } from '@/modules/paths/hooks/use-paths'
import type {
  Vision,
  VisionAchievementState,
  VisionAchievementTile,
  VisionImageAttribution,
  VisionImageTile,
  VisionTile,
} from '../types/vision'

const STORAGE_KEY = 'visions'

/**
 * Default is an empty list — the production build ships a clean empty state
 * and the `empty` dev scenario matches it. Mock Visions live in `data/mock.ts`
 * (wired into the `full` scenario); switch scenario from the DevToolbar to
 * see populated boards.
 */
const INITIAL_VISIONS: Vision[] = []

/** A function that reverts one mutation; wired to an Undo toast by the caller. */
export type UndoFn = () => void

/**
 * Mutations return `null` when nothing changed — the caller must not toast
 * (or offer an Undo) for a no-op.
 */
export type UndoFnOrNull = UndoFn | null

export function useVision() {
  const {
    value: visions,
    setValue: setVisions,
    removeValue: clearVisions,
    corrupt,
  } = useLocalStorageState<Vision[]>(STORAGE_KEY, INITIAL_VISIONS)
  const { paths, stripLegacyAchievements } = usePaths()

  // Self-heal: a Path can be deleted elsewhere (usePaths.deletePath only
  // touches the `paths` key) — `vision` has no way to hear about it directly,
  // so cascade-remove any Vision left pointing at a Path that no longer
  // exists. Mirrors the same self-heal pattern `useGoals` and `useActions` run.
  useEffect(() => {
    const validPathIds = new Set(paths.map((p) => p.id))
    const orphaned = visions.some((v) => !validPathIds.has(v.pathId))
    if (!orphaned) return
    setVisions((prev) => prev.filter((v) => validPathIds.has(v.pathId)))
  }, [paths, visions, setVisions])

  // One-time data move (ADR 0037): Achievements used to be embedded in the
  // Path record and shown as an overview checklist — they are Vision tiles
  // now. Move any legacy lists into their Path's board and strip them from
  // `paths`. Skipped while `visions` is unreadable: appending into a corrupt
  // key's fresh snapshot could wipe the original data on the next write.
  // Idempotent — migrated tiles keep the legacy achievement's id, so a
  // re-run (e.g. the strip write failing on quota) skips what is already
  // on the board instead of duplicating it.
  const visionsUnreadable = corrupt
  useEffect(() => {
    if (visionsUnreadable) return
    const legacyByPathId = stripLegacyAchievements()
    const entries = Object.entries(legacyByPathId)
    if (entries.length === 0) return
    setVisions((prev) => {
      let next = prev
      for (const [pathId, legacy] of entries) {
        const existing = next.find((v) => v.pathId === pathId)
        const existingIds = new Set(existing?.tiles.map((t) => t.id) ?? [])
        const tiles = legacy
          .filter((a) => !existingIds.has(a.id))
          .map<VisionAchievementTile>((a) => ({
            id: a.id,
            type: 'achievement',
            title: a.title,
            state: a.state,
            achievedOn: a.achievedOn,
          }))
        if (tiles.length === 0) continue
        if (existing) {
          next = next.map((v) => (v.id === existing.id ? touch({ ...v, tiles: [...v.tiles, ...tiles] }) : v))
        } else {
          const now = new Date().toISOString()
          next = [...next, { id: generateId(), createdAt: now, updatedAt: now, pathId, tiles }]
        }
      }
      return next
    })
    // Runs on mount and whenever the legacy strip leaves data behind — after
    // a successful strip the snapshot holds no legacy lists and this no-ops.
  }, [visionsUnreadable, stripLegacyAchievements, setVisions])

  const touch = (v: Vision): Vision => ({ ...v, updatedAt: new Date().toISOString() })

  const getVisionForPath = useCallback(
    (pathId: string) => visions.find((v) => v.pathId === pathId),
    [visions],
  )

  const tilesForPath = useCallback(
    (pathId: string): VisionTile[] => getVisionForPath(pathId)?.tiles ?? [],
    [getVisionForPath],
  )

  const visionTileCountForPath = useCallback(
    (pathId: string) => tilesForPath(pathId).length,
    [tilesForPath],
  )

  /** First note's text, truncated — the Path overview / card summary. Empty when there's no note yet. */
  const visionSnippetForPath = useCallback(
    (pathId: string) => {
      const firstNote = tilesForPath(pathId).find((t) => t.type === 'note')
      if (!firstNote) return ''
      const MAX = 140
      return firstNote.text.length > MAX ? `${firstNote.text.slice(0, MAX).trimEnd()}…` : firstNote.text
    },
    [tilesForPath],
  )

  /** Up to `count` image tiles, in board order — the summary thumbnail strip. */
  const imageTilesForPath = useCallback(
    (pathId: string, count: number): VisionImageTile[] =>
      tilesForPath(pathId)
        .filter((t): t is VisionImageTile => t.type === 'image')
        .slice(0, count),
    [tilesForPath],
  )

  /** Achievement tiles, in board order — order-independent in meaning, board order is just placement. */
  const achievementTilesForPath = useCallback(
    (pathId: string): VisionAchievementTile[] =>
      tilesForPath(pathId).filter((t): t is VisionAchievementTile => t.type === 'achievement'),
    [tilesForPath],
  )

  /** `achieved`/total — the card grid, the archived list, the overview summary, the delete cascade summary. */
  const achievementCountsForPath = useCallback(
    (pathId: string): { achieved: number; total: number } => {
      const tiles = achievementTilesForPath(pathId)
      return { achieved: tiles.filter((t) => t.state === 'achieved').length, total: tiles.length }
    },
    [achievementTilesForPath],
  )

  /** Restore the entire list to a snapshot — the basis for every Undo. */
  const restoreSnapshot = useCallback(
    (snapshot: Vision[]): UndoFn =>
      () =>
        setVisions(snapshot),
    [setVisions],
  )

  /** Apply `fn` to a Path's tile list, creating the Vision lazily if this is its first tile. */
  const mutateTiles = useCallback(
    (pathId: string, fn: (tiles: VisionTile[]) => VisionTile[]) => {
      setVisions((prev) => {
        const existing = prev.find((v) => v.pathId === pathId)
        if (existing) {
          return prev.map((v) => (v.id === existing.id ? touch({ ...v, tiles: fn(v.tiles) }) : v))
        }
        const now = new Date().toISOString()
        const created: Vision = { id: generateId(), createdAt: now, updatedAt: now, pathId, tiles: fn([]) }
        return [...prev, created]
      })
    },
    [setVisions],
  )

  const addNote = useCallback(
    (pathId: string, text: string) => {
      const t = text.trim()
      if (!t) return
      mutateTiles(pathId, (tiles) => [...tiles, { id: generateId(), type: 'note', text: t }])
    },
    [mutateTiles],
  )

  const editNote = useCallback(
    (pathId: string, tileId: string, text: string) => {
      const t = text.trim()
      if (!t) return
      mutateTiles(pathId, (tiles) =>
        tiles.map((tile) => (tile.id === tileId && tile.type === 'note' ? { ...tile, text: t } : tile)),
      )
    },
    [mutateTiles],
  )

  // --- Achievement tiles (ADR 0037) --------------------------------------

  const addAchievement = useCallback(
    (pathId: string, title: string) => {
      const t = title.trim()
      if (!t) return
      mutateTiles(pathId, (tiles) => [
        ...tiles,
        { id: generateId(), type: 'achievement', title: t, state: 'open', achievedOn: null },
      ])
    },
    [mutateTiles],
  )

  /** Seed several at once — the New Path dialog's achievement rows land here. */
  const addAchievements = useCallback(
    (pathId: string, titles: string[]) => {
      const cleaned = titles.map((t) => t.trim()).filter(Boolean)
      if (cleaned.length === 0) return
      mutateTiles(pathId, (tiles) => [
        ...tiles,
        ...cleaned.map<VisionAchievementTile>((title) => ({
          id: generateId(),
          type: 'achievement',
          title,
          state: 'open',
          achievedOn: null,
        })),
      ])
    },
    [mutateTiles],
  )

  const editAchievement = useCallback(
    (pathId: string, tileId: string, title: string) => {
      const t = title.trim()
      if (!t) return
      mutateTiles(pathId, (tiles) =>
        tiles.map((tile) => (tile.id === tileId && tile.type === 'achievement' ? { ...tile, title: t } : tile)),
      )
    },
    [mutateTiles],
  )

  /**
   * Tick / untick in place — deliberately reversible. Re-ticking after a
   * mistaken un-tick keeps the original achieved date instead of stamping
   * today over history (the rule the old Path-embedded checklist used).
   */
  const setAchievementAchieved = useCallback(
    (pathId: string, tileId: string, achieved: boolean) => {
      mutateTiles(pathId, (tiles) =>
        tiles.map((tile) => {
          if (tile.id !== tileId || tile.type !== 'achievement') return tile
          const state: VisionAchievementState = achieved ? 'achieved' : 'open'
          const achievedOn = achieved ? (tile.achievedOn ?? todayLocalIso()) : null
          return { ...tile, state, achievedOn }
        }),
      )
    },
    [mutateTiles],
  )

  const addImage = useCallback(
    (
      pathId: string,
      image: {
        src: string
        alt: string
        source: 'upload' | 'unsplash'
        attribution?: VisionImageAttribution | null
      },
    ) => {
      mutateTiles(pathId, (tiles) => [
        ...tiles,
        {
          id: generateId(),
          type: 'image',
          src: image.src,
          alt: image.alt,
          source: image.source,
          attribution: image.attribution ?? null,
        },
      ])
    },
    [mutateTiles],
  )

  /**
   * Delete a tile — works for either a note or an image. Returns an Undo that
   * restores it, or `null` when the tile doesn't exist (nothing to undo).
   */
  const deleteTile = useCallback(
    (pathId: string, tileId: string): UndoFnOrNull => {
      const existing = tilesForPath(pathId)
      if (!existing.some((t) => t.id === tileId)) return null
      const snapshot = visions
      mutateTiles(pathId, (tiles) => tiles.filter((t) => t.id !== tileId))
      return restoreSnapshot(snapshot)
    },
    [visions, tilesForPath, mutateTiles, restoreSnapshot],
  )

  /**
   * Move a tile to a new index within its Path's board — notes and images
   * share one order. Returns an Undo that restores the previous ordering, or
   * `null` when the move is a no-op (tile missing, or already at that index).
   */
  const reorderTile = useCallback(
    (pathId: string, tileId: string, toIndex: number): UndoFnOrNull => {
      const tiles = tilesForPath(pathId)
      const from = tiles.findIndex((t) => t.id === tileId)
      const clamped = Math.max(0, Math.min(toIndex, tiles.length - 1))
      if (from === -1 || from === clamped) return null
      const snapshot = visions
      mutateTiles(pathId, (current) => {
        const next = [...current]
        const [moved] = next.splice(from, 1)
        next.splice(clamped, 0, moved)
        return next
      })
      return restoreSnapshot(snapshot)
    },
    [visions, tilesForPath, mutateTiles, restoreSnapshot],
  )

  const storageOk = useMemo(() => {
    try {
      const probe = '__vision_probe__'
      window.localStorage.setItem(probe, '1')
      window.localStorage.removeItem(probe)
      return true
    } catch {
      return false
    }
  }, [])

  return {
    visions,
    storageOk,
    /** The stored `visions` value exists but is unreadable — show a recovery screen. */
    dataUnreadable: corrupt,
    /** Wipe the corrupt value and start clean. */
    resetVisions: clearVisions,
    getVisionForPath,
    tilesForPath,
    visionTileCountForPath,
    visionSnippetForPath,
    imageTilesForPath,
    achievementTilesForPath,
    achievementCountsForPath,
    addNote,
    editNote,
    addImage,
    addAchievement,
    addAchievements,
    editAchievement,
    setAchievementAchieved,
    deleteTile,
    reorderTile,
  }
}
