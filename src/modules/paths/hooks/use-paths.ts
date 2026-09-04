import { useCallback, useMemo } from 'react'
import { useLocalStorageState } from '@/shared/hooks/use-local-storage'
import { generateId } from '@/shared/types'
import type { Achievement, Path, PathCascadeCounts } from '../types/path'

const STORAGE_KEY = 'paths'

/**
 * Default is an empty list — the production build ships a clean empty state and
 * the `empty` dev scenario matches it. Mock Paths live in the `full` scenario
 * (src/scenarios/full.ts); switch to it from the DevToolbar to see populated data.
 */
const INITIAL_PATHS: Path[] = []

/** Probe whether LocalStorage can actually be written — private mode, quota, etc. */
export function isStorageAvailable(): boolean {
  try {
    const probe = '__paths_probe__'
    window.localStorage.setItem(probe, '1')
    window.localStorage.removeItem(probe)
    return true
  } catch {
    return false
  }
}

/** Local calendar date (YYYY-MM-DD) — not UTC, so "today" matches the user's day. */
function todayLocalIso(): string {
  const d = new Date()
  const offsetMs = d.getTimezoneOffset() * 60_000
  return new Date(d.getTime() - offsetMs).toISOString().slice(0, 10)
}

function byOrder(a: Path, b: Path): number {
  return a.order - b.order
}

/** A function that reverts one mutation; wired to an Undo toast by the caller. */
export type UndoFn = () => void

export function usePaths() {
  const {
    value: paths,
    setValue: setPaths,
    removeValue: clearPaths,
    corrupt,
  } = useLocalStorageState<Path[]>(STORAGE_KEY, INITIAL_PATHS)
  const storageOk = useMemo(isStorageAvailable, [])

  const activePaths = useMemo(
    () => paths.filter((p) => !p.archived).sort(byOrder),
    [paths],
  )
  const archivedPaths = useMemo(
    () =>
      paths
        .filter((p) => p.archived)
        .sort((a, b) => (b.archivedAt ?? '').localeCompare(a.archivedAt ?? '')),
    [paths],
  )

  const getPath = useCallback((id: string) => paths.find((p) => p.id === id), [paths])

  const touch = (p: Path): Path => ({ ...p, updatedAt: new Date().toISOString() })

  /** Restore the entire list to a snapshot — the basis for every Undo. */
  const restoreSnapshot = useCallback(
    (snapshot: Path[]): UndoFn =>
      () =>
        setPaths(snapshot),
    [setPaths],
  )

  const createPath = useCallback(
    (name: string, achievementTitles: string[]) => {
      const now = new Date().toISOString()
      const maxOrder = paths.reduce((m, p) => (p.archived ? m : Math.max(m, p.order)), -1)
      const newPath: Path = {
        id: generateId(),
        createdAt: now,
        updatedAt: now,
        name: name.trim(),
        order: maxOrder + 1,
        archived: false,
        archivedAt: null,
        visionSnippet: '',
        achievements: achievementTitles
          .map((t) => t.trim())
          .filter(Boolean)
          .map<Achievement>((title) => ({
            id: generateId(),
            title,
            state: 'open',
            achievedOn: null,
          })),
        mockGoalCount: 0,
        mockActionCount: 0,
        mockVisionTileCount: 0,
      }
      setPaths([...paths, newPath])
      return newPath.id
    },
    [paths, setPaths],
  )

  const renamePath = useCallback(
    (id: string, name: string) => {
      const trimmed = name.trim()
      if (!trimmed) return
      setPaths(paths.map((p) => (p.id === id ? touch({ ...p, name: trimmed }) : p)))
    },
    [paths, setPaths],
  )

  /** Archive a Path. Returns an Undo that restores its exact previous state. */
  const archivePath = useCallback(
    (id: string): UndoFn => {
      const snapshot = paths
      setPaths(
        paths.map((p) =>
          p.id === id
            ? touch({ ...p, archived: true, archivedAt: new Date().toISOString() })
            : p,
        ),
      )
      return restoreSnapshot(snapshot)
    },
    [paths, setPaths, restoreSnapshot],
  )

  const unarchivePath = useCallback(
    (id: string) => {
      const maxOrder = paths.reduce((m, x) => (x.archived ? m : Math.max(m, x.order)), -1)
      setPaths(
        paths.map((p) =>
          p.id === id ? touch({ ...p, archived: false, archivedAt: null, order: maxOrder + 1 }) : p,
        ),
      )
    },
    [paths, setPaths],
  )

  const deletePath = useCallback(
    (id: string) => {
      setPaths(paths.filter((p) => p.id !== id))
    },
    [paths, setPaths],
  )

  /**
   * Move an active Path to a new index within the active, order-sorted list.
   * Returns an Undo that restores the previous ordering.
   */
  const reorderPath = useCallback(
    (id: string, toIndex: number): UndoFn => {
      const snapshot = paths
      const ordered = paths.filter((p) => !p.archived).sort(byOrder)
      const from = ordered.findIndex((p) => p.id === id)
      if (from === -1) return () => {}
      const clamped = Math.max(0, Math.min(toIndex, ordered.length - 1))
      if (from === clamped) return () => {}
      const [moved] = ordered.splice(from, 1)
      ordered.splice(clamped, 0, moved)
      const orderById = new Map(ordered.map((p, i) => [p.id, i]))
      setPaths(
        paths.map((p) => (orderById.has(p.id) ? { ...p, order: orderById.get(p.id)! } : p)),
      )
      return restoreSnapshot(snapshot)
    },
    [paths, setPaths, restoreSnapshot],
  )

  // --- Achievements -------------------------------------------------------

  const mutateAchievements = (
    pathId: string,
    fn: (list: Achievement[]) => Achievement[],
  ) => {
    setPaths(
      paths.map((p) =>
        p.id === pathId ? touch({ ...p, achievements: fn(p.achievements) }) : p,
      ),
    )
  }

  const addAchievement = (pathId: string, title: string) => {
    const t = title.trim()
    if (!t) return
    mutateAchievements(pathId, (list) => [
      ...list,
      { id: generateId(), title: t, state: 'open', achievedOn: null },
    ])
  }

  const editAchievement = (pathId: string, achievementId: string, title: string) => {
    const t = title.trim()
    if (!t) return
    mutateAchievements(pathId, (list) =>
      list.map((a) => (a.id === achievementId ? { ...a, title: t } : a)),
    )
  }

  const setAchievementState = (pathId: string, achievementId: string, achieved: boolean) => {
    mutateAchievements(pathId, (list) =>
      list.map((a) => {
        if (a.id !== achievementId) return a
        if (!achieved) return { ...a, state: 'open', achievedOn: null }
        // Preserve the original achieved date if it was set before — re-ticking
        // after a mistaken un-tick shouldn't rewrite history.
        return { ...a, state: 'achieved', achievedOn: a.achievedOn ?? todayLocalIso() }
      }),
    )
  }

  const deleteAchievement = (pathId: string, achievementId: string) => {
    mutateAchievements(pathId, (list) => list.filter((a) => a.id !== achievementId))
  }

  const cascadeCounts = useCallback(
    (id: string): PathCascadeCounts => {
      const p = getPath(id)
      return {
        visionTiles: p?.mockVisionTileCount ?? 0,
        achievements: p?.achievements.length ?? 0,
        goals: p?.mockGoalCount ?? 0,
        actions: p?.mockActionCount ?? 0,
      }
    },
    [getPath],
  )

  return {
    paths,
    activePaths,
    archivedPaths,
    storageOk,
    /** The stored `paths` value exists but is unreadable — show a recovery screen. */
    dataUnreadable: corrupt,
    /** Wipe the corrupt value and start clean. */
    resetPaths: clearPaths,
    getPath,
    createPath,
    renamePath,
    archivePath,
    unarchivePath,
    deletePath,
    reorderPath,
    addAchievement,
    editAchievement,
    setAchievementState,
    deleteAchievement,
    cascadeCounts,
  }
}
