import { useCallback, useEffect, useMemo } from 'react'
import { useLocalStorageState } from '@/shared/hooks/use-local-storage'
import { generateId } from '@/shared/types'
import { usePaths } from '@/modules/paths/hooks/use-paths'
import { useActions } from '@/modules/capture-triage/hooks/use-actions'
import type { Goal, GoalCascadeCounts, GoalState } from '../types/goal'

const STORAGE_KEY = 'goals'

/**
 * Default is an empty list — the production build ships a clean empty state
 * and the `empty` dev scenario matches it. Mock Goals live in `data/mock.ts`
 * (wired into the `full` scenario); switch scenario from the DevToolbar to
 * see populated data.
 */
const INITIAL_GOALS: Goal[] = []

/** Local calendar date (YYYY-MM-DD) — not UTC, matching `usePaths`. */
function todayLocalIso(): string {
  const d = new Date()
  const offsetMs = d.getTimezoneOffset() * 60_000
  return new Date(d.getTime() - offsetMs).toISOString().slice(0, 10)
}

function byOrder(a: Goal, b: Goal): number {
  return a.order - b.order
}

/** A function that reverts one mutation; wired to an Undo toast by the caller. */
export type UndoFn = () => void

export function useGoals() {
  const {
    value: goals,
    setValue: setGoals,
    removeValue: clearGoals,
    corrupt,
  } = useLocalStorageState<Goal[]>(STORAGE_KEY, INITIAL_GOALS)
  const { paths } = usePaths()
  const { actions, deleteActionsForGoals, markFrogForGoalActions, reassignActionsToPath } =
    useActions()

  // Self-heal: a Path can be deleted elsewhere (usePaths.deletePath only
  // touches the `paths` key) — `goals` has no way to hear about it directly,
  // so cascade-remove any Goal left pointing at a Path that no longer exists,
  // along with every Action under it, rather than leave orphaned data behind.
  // Mirrors the same self-heal pattern `useActions` already runs for `pathId`.
  useEffect(() => {
    const validPathIds = new Set(paths.map((p) => p.id))
    const orphanedIds = goals.filter((g) => !validPathIds.has(g.pathId)).map((g) => g.id)
    if (orphanedIds.length === 0) return
    setGoals((prev) => prev.filter((g) => validPathIds.has(g.pathId)))
    deleteActionsForGoals(orphanedIds)
  }, [paths, goals, setGoals, deleteActionsForGoals])

  const touch = (g: Goal): Goal => ({ ...g, updatedAt: new Date().toISOString() })

  /** Restore the entire list to a snapshot — the basis for every Undo. */
  const restoreSnapshot = useCallback(
    (snapshot: Goal[]): UndoFn =>
      () =>
        setGoals(snapshot),
    [setGoals],
  )

  const getGoal = useCallback((id: string) => goals.find((g) => g.id === id), [goals])

  /** One sibling group: Goals sharing a Path and a parent (top-level when `parentGoalId` is null). */
  const siblingsOf = useCallback(
    (pathId: string, parentGoalId: string | null) =>
      goals.filter((g) => g.pathId === pathId && g.parentGoalId === parentGoalId).sort(byOrder),
    [goals],
  )

  const topLevelGoals = useCallback(
    (pathId: string) => siblingsOf(pathId, null),
    [siblingsOf],
  )

  /** The sorted sibling group a given Goal belongs to — used for Move up/down bounds. */
  const siblingGoals = useCallback(
    (g: Goal) => siblingsOf(g.pathId, g.parentGoalId),
    [siblingsOf],
  )

  const childGoals = useCallback(
    (parentGoalId: string) => goals.filter((g) => g.parentGoalId === parentGoalId).sort(byOrder),
    [goals],
  )

  /** This Goal's id plus every descendant's id (depth-first). */
  const subtreeIds = useCallback(
    (rootId: string): string[] => {
      const ids: string[] = [rootId]
      const stack = [rootId]
      while (stack.length > 0) {
        const current = stack.pop()!
        for (const child of goals.filter((g) => g.parentGoalId === current)) {
          ids.push(child.id)
          stack.push(child.id)
        }
      }
      return ids
    },
    [goals],
  )

  const createGoal = useCallback(
    (data: {
      pathId: string
      parentGoalId: string | null
      name: string
      description?: string
      deadline?: string | null
    }) => {
      const name = data.name.trim()
      if (!name) return null
      const now = new Date().toISOString()
      const siblings = siblingsOf(data.pathId, data.parentGoalId)
      const maxOrder = siblings.reduce((m, g) => Math.max(m, g.order), -1)
      const newGoal: Goal = {
        id: generateId(),
        createdAt: now,
        updatedAt: now,
        name,
        description: data.description?.trim() ?? '',
        pathId: data.pathId,
        parentGoalId: data.parentGoalId,
        order: maxOrder + 1,
        deadline: data.deadline || null,
        state: 'active',
        achievedOn: null,
        frog: false,
        mockWinDays: {},
      }
      setGoals([...goals, newGoal])
      return newGoal.id
    },
    [goals, setGoals, siblingsOf],
  )

  const editGoal = useCallback(
    (id: string, data: { name?: string; description?: string; deadline?: string | null }) => {
      setGoals(
        goals.map((g) => {
          if (g.id !== id) return g
          const next = { ...g }
          if (data.name !== undefined) {
            const trimmed = data.name.trim()
            if (trimmed) next.name = trimmed
          }
          if (data.description !== undefined) next.description = data.description.trim()
          if (data.deadline !== undefined) next.deadline = data.deadline || null
          return touch(next)
        }),
      )
    },
    [goals, setGoals],
  )

  /** Reorder within one sibling group (top-level, or under one parent). Returns an Undo. */
  const reorderGoal = useCallback(
    (id: string, toIndex: number): UndoFn => {
      const snapshot = goals
      const g = goals.find((x) => x.id === id)
      if (!g) return () => {}
      const siblings = siblingsOf(g.pathId, g.parentGoalId)
      const from = siblings.findIndex((x) => x.id === id)
      if (from === -1) return () => {}
      const clamped = Math.max(0, Math.min(toIndex, siblings.length - 1))
      if (from === clamped) return () => {}
      const [moved] = siblings.splice(from, 1)
      siblings.splice(clamped, 0, moved)
      const orderById = new Map(siblings.map((x, i) => [x.id, i]))
      setGoals(goals.map((x) => (orderById.has(x.id) ? { ...x, order: orderById.get(x.id)! } : x)))
      return restoreSnapshot(snapshot)
    },
    [goals, setGoals, siblingsOf, restoreSnapshot],
  )

  /**
   * Move a Goal (and its whole subtree + their Actions) to another Path.
   * Always lands top-level on the destination — a sub-Goal can't carry its
   * old parent across, since the parent lives on the origin Path.
   */
  const moveGoalToPath = useCallback(
    (id: string, newPathId: string) => {
      const g = goals.find((x) => x.id === id)
      if (!g || g.pathId === newPathId) return
      const ids = new Set(subtreeIds(id))
      const topSiblings = topLevelGoals(newPathId)
      const maxOrder = topSiblings.reduce((m, x) => Math.max(m, x.order), -1)
      setGoals(
        goals.map((x) => {
          if (x.id === id) {
            return touch({ ...x, pathId: newPathId, parentGoalId: null, order: maxOrder + 1 })
          }
          if (ids.has(x.id)) return touch({ ...x, pathId: newPathId })
          return x
        }),
      )
      reassignActionsToPath([...ids], newPathId)
    },
    [goals, setGoals, subtreeIds, topLevelGoals, reassignActionsToPath],
  )

  /** One-time propagation on mark: doesn't retract on un-mark, doesn't apply to later Actions. */
  const toggleFrog = useCallback(
    (id: string) => {
      const g = goals.find((x) => x.id === id)
      if (!g) return
      const next = !g.frog
      setGoals(goals.map((x) => (x.id === id ? touch({ ...x, frog: next }) : x)))
      if (next) markFrogForGoalActions(id)
    },
    [goals, setGoals, markFrogForGoalActions],
  )

  const setGoalState = useCallback(
    (id: string, state: GoalState) => {
      setGoals(
        goals.map((g) => {
          if (g.id !== id) return g
          if (state === 'achieved') {
            // Preserve the original achieved date on re-achieving after a reactivate.
            return touch({ ...g, state: 'achieved', achievedOn: g.achievedOn ?? todayLocalIso() })
          }
          if (state === 'abandoned') return touch({ ...g, state: 'abandoned' })
          return touch({ ...g, state: 'active', achievedOn: null })
        }),
      )
    },
    [goals, setGoals],
  )

  const cascadeCounts = useCallback(
    (id: string): GoalCascadeCounts => {
      const ids = subtreeIds(id)
      const goalIdSet = new Set(ids)
      return {
        subGoals: ids.length - 1,
        actions: actions.filter((a) => a.goalId && goalIdSet.has(a.goalId)).length,
      }
    },
    [subtreeIds, actions],
  )

  const deleteGoal = useCallback(
    (id: string) => {
      const ids = subtreeIds(id)
      const idSet = new Set(ids)
      setGoals(goals.filter((g) => !idSet.has(g.id)))
      deleteActionsForGoals(ids)
    },
    [goals, setGoals, subtreeIds, deleteActionsForGoals],
  )

  const actionCountFor = useCallback(
    (id: string) => actions.filter((a) => a.goalId === id).length,
    [actions],
  )

  const actionsFor = useCallback(
    (id: string) => actions.filter((a) => a.goalId === id),
    [actions],
  )

  const goalCountForPath = useMemo(() => {
    const counts = new Map<string, number>()
    for (const g of goals) counts.set(g.pathId, (counts.get(g.pathId) ?? 0) + 1)
    return (pathId: string) => counts.get(pathId) ?? 0
  }, [goals])

  return {
    goals,
    /** The stored `goals` value exists but is unreadable — show a recovery screen. */
    dataUnreadable: corrupt,
    /** Wipe the corrupt value and start clean. */
    resetGoals: clearGoals,
    getGoal,
    topLevelGoals,
    childGoals,
    siblingGoals,
    goalCountForPath,
    createGoal,
    editGoal,
    reorderGoal,
    moveGoalToPath,
    toggleFrog,
    setGoalState,
    cascadeCounts,
    deleteGoal,
    actionCountFor,
    actionsFor,
  }
}
