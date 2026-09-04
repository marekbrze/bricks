import { useCallback, useMemo } from 'react'
import { useLocalStorage } from '@/shared/hooks/use-local-storage'
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

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function byOrder(a: Path, b: Path): number {
  return a.order - b.order
}

export function usePaths() {
  const [paths, setPaths] = useLocalStorage<Path[]>(STORAGE_KEY, INITIAL_PATHS)
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
        winDays: {},
      }
      setPaths([...paths, newPath])
      return newPath.id
    },
    [paths, setPaths],
  )

  const renamePath = useCallback(
    (id: string, name: string) => {
      setPaths(paths.map((p) => (p.id === id ? touch({ ...p, name: name.trim() }) : p)))
    },
    [paths, setPaths],
  )

  const setArchived = useCallback(
    (id: string, archived: boolean) => {
      setPaths(
        paths.map((p) => {
          if (p.id !== id) return p
          if (archived) {
            return touch({ ...p, archived: true, archivedAt: new Date().toISOString() })
          }
          const maxOrder = paths.reduce((m, x) => (x.archived ? m : Math.max(m, x.order)), -1)
          return touch({ ...p, archived: false, archivedAt: null, order: maxOrder + 1 })
        }),
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

  /** Move an active Path to a new index within the active, order-sorted list. */
  const reorderPath = useCallback(
    (id: string, toIndex: number) => {
      const ordered = paths.filter((p) => !p.archived).sort(byOrder)
      const from = ordered.findIndex((p) => p.id === id)
      if (from === -1) return
      const clamped = Math.max(0, Math.min(toIndex, ordered.length - 1))
      if (from === clamped) return
      const [moved] = ordered.splice(from, 1)
      ordered.splice(clamped, 0, moved)
      const orderById = new Map(ordered.map((p, i) => [p.id, i]))
      setPaths(
        paths.map((p) => (orderById.has(p.id) ? { ...p, order: orderById.get(p.id)! } : p)),
      )
    },
    [paths, setPaths],
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
      list.map((a) =>
        a.id === achievementId
          ? {
              ...a,
              state: achieved ? 'achieved' : 'open',
              achievedOn: achieved ? todayIso() : null,
            }
          : a,
      ),
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
    getPath,
    createPath,
    renamePath,
    archivePath: (id: string) => setArchived(id, true),
    unarchivePath: (id: string) => setArchived(id, false),
    deletePath,
    reorderPath,
    addAchievement,
    editAchievement,
    setAchievementState,
    deleteAchievement,
    cascadeCounts,
  }
}
