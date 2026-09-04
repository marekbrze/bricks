import { useCallback, useEffect, useMemo } from 'react'
import { useLocalStorageState } from '@/shared/hooks/use-local-storage'
import { generateId } from '@/shared/types'
import { usePaths } from '@/modules/paths/hooks/use-paths'
import type { Vision, VisionImageAttribution, VisionImageTile, VisionTile } from '../types/vision'

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
  const { paths } = usePaths()

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
    addNote,
    editNote,
    addImage,
    deleteTile,
    reorderTile,
  }
}
