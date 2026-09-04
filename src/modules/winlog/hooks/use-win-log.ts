import { useCallback, useMemo } from 'react'
import { usePaths } from '@/modules/paths/hooks/use-paths'
import { useGoals } from '@/modules/goals/hooks/use-goals'
import { useActions } from '@/modules/capture-triage/hooks/use-actions'
import type { Win } from '../types/win'

/** Local calendar date (YYYY-MM-DD) from a full ISO timestamp — matches `todayLocalIso`. */
function localIso(iso: string): string {
  const d = new Date(iso)
  const offsetMs = d.getTimezoneOffset() * 60_000
  return new Date(d.getTime() - offsetMs).toISOString().slice(0, 10)
}

function daysMap(wins: Win[]): Record<string, number> {
  const map: Record<string, number> = {}
  for (const w of wins) map[w.date] = (map[w.date] ?? 0) + 1
  return map
}

/**
 * `winlog`'s core: every `Win` — a completed `Action` or an achieved `Goal` —
 * computed live from `paths`/`goals`/`capture-triage` state. No storage of
 * its own; un-completing an Action or reactivating a Goal makes its Win
 * disappear on the next render, by design (ADR 0013).
 */
export function useWinLog() {
  const { paths, activePaths, archivedPaths, dataUnreadable: pathsUnreadable, resetPaths } = usePaths()
  const { goals, subtreeIds, dataUnreadable: goalsUnreadable, resetGoals } = useGoals()
  const { actions, dataUnreadable: actionsUnreadable, resetActions } = useActions()

  const wins = useMemo<Win[]>(() => {
    const actionWins: Win[] = actions
      .filter((a) => a.state === 'done' && a.completedAt && a.pathId)
      .map((a) => ({
        id: `action:${a.id}`,
        kind: 'action',
        name: a.name,
        pathId: a.pathId as string,
        goalId: a.goalId,
        date: localIso(a.completedAt as string),
        at: a.completedAt as string,
        currentScheduledDate: a.scheduledDate,
      }))
    const goalWins: Win[] = goals
      .filter((g) => g.state === 'achieved' && g.achievedOn)
      .map((g) => ({
        id: `goal:${g.id}`,
        kind: 'goal',
        name: g.name,
        pathId: g.pathId,
        goalId: g.id,
        date: g.achievedOn as string,
        at: g.achievedOn as string,
        currentScheduledDate: null,
      }))
    return [...actionWins, ...goalWins].sort((a, b) => b.at.localeCompare(a.at))
  }, [actions, goals])

  const winsForPath = useCallback(
    (pathId: string | null) => (pathId ? wins.filter((w) => w.pathId === pathId) : wins),
    [wins],
  )

  const winDaysGlobal = useMemo(() => daysMap(wins), [wins])

  const winDaysForPath = useCallback(
    (pathId: string) => daysMap(wins.filter((w) => w.pathId === pathId)),
    [wins],
  )

  /** Subtree-inclusive: rolls up sub-Goals' Wins too, matching `cascadeCounts`' Action count on Goal progress. */
  const winDaysForGoal = useCallback(
    (goalId: string) => {
      const ids = new Set(subtreeIds(goalId))
      return daysMap(wins.filter((w) => w.goalId && ids.has(w.goalId)))
    },
    [wins, subtreeIds],
  )

  const getPathName = useCallback(
    (pathId: string) => paths.find((p) => p.id === pathId)?.name ?? 'Unknown Path',
    [paths],
  )

  /** True Path ids the filter can validly scope to — active or archived, but not a stale/deleted one. */
  const isKnownPathId = useCallback((pathId: string) => paths.some((p) => p.id === pathId), [paths])

  const getGoalName = useCallback(
    (goalId: string) => goals.find((g) => g.id === goalId)?.name ?? 'Unknown Goal',
    [goals],
  )

  return {
    wins,
    winsForPath,
    winDaysGlobal,
    winDaysForPath,
    winDaysForGoal,
    activePaths,
    archivedPaths,
    getPathName,
    getGoalName,
    isKnownPathId,
    /** True when any of the three sources this module reads from is unreadable. */
    dataUnreadable: pathsUnreadable || goalsUnreadable || actionsUnreadable,
    pathsUnreadable,
    goalsUnreadable,
    actionsUnreadable,
    resetPaths,
    resetGoals,
    resetActions,
  }
}
