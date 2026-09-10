import { useCallback, useEffect, useMemo } from 'react'
import { useLocalStorageState } from '@/shared/hooks/use-local-storage'
import { generateId } from '@/shared/types'
import { usePaths } from '@/modules/paths/hooks/use-paths'
import type { Essential } from '../types/essential'

const STORAGE_KEY = 'essentials'

/**
 * Default is an empty list — the production build ships a clean empty state and
 * the `empty` dev scenario matches it. Mock Essentials live in `data/mock.ts`
 * (wired into the `full` / `minimal` scenarios); switch scenario from the
 * DevToolbar to see populated data.
 */
const INITIAL_ESSENTIALS: Essential[] = []

/** A function that reverts one mutation; wired to an Undo toast by the caller. */
export type UndoFn = () => void

export function useEssentials() {
  const {
    value: essentials,
    setValue: setEssentials,
    removeValue: clearEssentials,
    corrupt,
  } = useLocalStorageState<Essential[]>(STORAGE_KEY, INITIAL_ESSENTIALS)
  const { paths } = usePaths()

  // Self-heal: a Path can be deleted elsewhere (`usePaths.deletePath` only
  // touches the `paths` key) — `essentials` has no way to hear about it, so
  // cascade-remove any Essential left pointing at a Path that no longer
  // exists. Mirrors the same pattern `useVision` / `useGoals` / `useActions`
  // run. The completion Actions a deleted Path's Essentials produced are swept
  // by `useActions`' own self-heal (standalone Actions of a dead Path go back
  // to the Inbox).
  useEffect(() => {
    if (corrupt) return
    const validPathIds = new Set(paths.map((p) => p.id))
    const orphaned = essentials.some((e) => !validPathIds.has(e.pathId))
    if (!orphaned) return
    setEssentials((prev) => prev.filter((e) => validPathIds.has(e.pathId)))
  }, [paths, essentials, setEssentials, corrupt])

  const touch = (e: Essential): Essential => ({ ...e, updatedAt: new Date().toISOString() })

  /** Restore the entire list to a snapshot — the basis for every Undo. */
  const restoreSnapshot = useCallback(
    (snapshot: Essential[]): UndoFn =>
      () =>
        setEssentials(snapshot),
    [setEssentials],
  )

  /** This Path's Essentials, in manual order. */
  const essentialsForPath = useCallback(
    (pathId: string) =>
      essentials.filter((e) => e.pathId === pathId).sort((a, b) => a.order - b.order),
    [essentials],
  )

  const essentialCountForPath = useMemo(() => {
    const counts = new Map<string, number>()
    for (const e of essentials) counts.set(e.pathId, (counts.get(e.pathId) ?? 0) + 1)
    return (pathId: string) => counts.get(pathId) ?? 0
  }, [essentials])

  /** Create an Essential at the end of its Path's manual order. No-op on an empty name. */
  const createEssential = useCallback(
    (data: { pathId: string; name: string; detail?: string }) => {
      const name = data.name.trim()
      if (!name) return
      const maxOrder = essentials.reduce(
        (m, e) => (e.pathId === data.pathId ? Math.max(m, e.order) : m),
        -1,
      )
      const now = new Date().toISOString()
      const newEssential: Essential = {
        id: generateId(),
        createdAt: now,
        updatedAt: now,
        pathId: data.pathId,
        name,
        detail: data.detail?.trim() ?? '',
        order: maxOrder + 1,
      }
      setEssentials([...essentials, newEssential])
    },
    [essentials, setEssentials],
  )

  /** Edit name / detail — no-op on an empty name. */
  const editEssential = useCallback(
    (id: string, data: { name: string; detail: string }) => {
      const name = data.name.trim()
      if (!name) return
      setEssentials(
        essentials.map((e) =>
          e.id === id ? touch({ ...e, name, detail: data.detail.trim() }) : e,
        ),
      )
    },
    [essentials, setEssentials],
  )

  /**
   * Move an Essential to a new index within its Path's order-sorted list.
   * Returns an Undo restoring the previous ordering; a no-op move returns a
   * do-nothing Undo (the caller stays silent).
   */
  const reorderEssential = useCallback(
    (id: string, toIndex: number): UndoFn => {
      const current = essentials.find((e) => e.id === id)
      if (!current) return () => {}
      const snapshot = essentials
      const ordered = essentials
        .filter((e) => e.pathId === current.pathId)
        .sort((a, b) => a.order - b.order)
      const from = ordered.findIndex((e) => e.id === id)
      const clamped = Math.max(0, Math.min(toIndex, ordered.length - 1))
      if (from === -1 || from === clamped) return () => {}
      const [moved] = ordered.splice(from, 1)
      ordered.splice(clamped, 0, moved)
      const orderById = new Map(ordered.map((e, i) => [e.id, i]))
      setEssentials(
        essentials.map((e) => (orderById.has(e.id) ? { ...e, order: orderById.get(e.id)! } : e)),
      )
      return restoreSnapshot(snapshot)
    },
    [essentials, setEssentials, restoreSnapshot],
  )

  /**
   * Delete an Essential. The completion Actions it produced are **kept** (they
   * are real wins; their `name` preserves what was done). Returns an Undo.
   */
  const deleteEssential = useCallback(
    (id: string): UndoFn => {
      const snapshot = essentials
      setEssentials(essentials.filter((e) => e.id !== id))
      return restoreSnapshot(snapshot)
    },
    [essentials, setEssentials, restoreSnapshot],
  )

  return {
    essentials,
    essentialsForPath,
    essentialCountForPath,
    createEssential,
    editEssential,
    reorderEssential,
    deleteEssential,
    /** The stored `essentials` value exists but is unreadable — show a recovery screen. */
    dataUnreadable: corrupt,
    /** Wipe the corrupt value and start clean. */
    resetEssentials: clearEssentials,
  }
}
