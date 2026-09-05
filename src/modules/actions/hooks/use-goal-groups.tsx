import { useCallback } from 'react'
import type { ReactNode } from 'react'
import { useLocalStorageState } from '@/shared/hooks/use-local-storage'
import { useGoals } from '@/modules/goals/hooks/use-goals'
import { useActions } from '@/modules/capture-triage/hooks/use-actions'
import type { Action } from '@/modules/capture-triage/types/action'
import type { Goal } from '@/modules/goals/types/goal'
import { isSettled } from '../lib/group-actions'
import { GoalGroup, type ActionRowCallbacks } from '../components/GoalGroup'

/**
 * Builds one Path's Goal tree as nested `GoalGroup`s, plus the two list
 * selections that go with it. Shared by the Actions view and a Path's
 * Actions tab so both apply the same rules:
 *
 * - a Goal renders while it is `active`, or while it still holds open work
 *   (an achieved Goal with a leftover Action stays reachable);
 * - collapse choices persist per Goal id across visits and across both
 *   screens (edgecases #7), under the `actions-group-visibility` key.
 */
export function useGoalGroups({
  showCompleted,
  rowCallbacks,
}: {
  showCompleted: boolean
  rowCallbacks: ActionRowCallbacks
}): {
  renderGoalGroup: (goal: Goal, depth: number) => ReactNode
  /** Top-level Goals of a Path worth rendering, in priority order. */
  topLevelGoalsFor: (pathId: string) => Goal[]
  /** Actions assigned to the Path itself, with no Goal in between. */
  standaloneActionsFor: (pathId: string) => Action[]
} {
  const { topLevelGoals, childGoals } = useGoals()
  const { actions, createAction } = useActions()
  const { value: expandedOverrides, setValue: setExpandedOverrides } = useLocalStorageState<
    Record<string, boolean>
  >('actions-group-visibility', {})

  const toggleExpanded = useCallback(
    (goalId: string, next: boolean) => setExpandedOverrides((prev) => ({ ...prev, [goalId]: next })),
    [setExpandedOverrides],
  )

  const worthRendering = useCallback(
    (g: Goal) => g.state === 'active' || actions.some((a) => a.goalId === g.id && !isSettled(a)),
    [actions],
  )

  const renderGoalGroup = useCallback(
    (goal: Goal, depth: number): ReactNode => {
      // An inactive child renders only while it still holds open work — same
      // rule as top-level Goals (GoalGroup also self-checks, this trims the tree).
      const children = childGoals(goal.id).filter(worthRendering)
      return (
        <GoalGroup
          key={goal.id}
          goal={goal}
          actions={actions.filter((a) => a.goalId === goal.id)}
          childGoals={children}
          showCompleted={showCompleted}
          depth={depth}
          rowCallbacks={rowCallbacks}
          onCreate={(name, scheduledDate) => {
            if (!goal.pathId) return
            createAction({ name, pathId: goal.pathId, goalId: goal.id, scheduledDate })
          }}
          renderChild={(child, childDepth) => renderGoalGroup(child, childDepth)}
          expandedOverride={expandedOverrides[goal.id]}
          onToggleExpanded={toggleExpanded}
        />
      )
    },
    [
      actions,
      childGoals,
      createAction,
      expandedOverrides,
      rowCallbacks,
      showCompleted,
      toggleExpanded,
      worthRendering,
    ],
  )

  const topLevelGoalsFor = useCallback(
    (pathId: string) => topLevelGoals(pathId).filter(worthRendering),
    [topLevelGoals, worthRendering],
  )

  const standaloneActionsFor = useCallback(
    (pathId: string) => actions.filter((a) => a.pathId === pathId && !a.goalId && a.state !== 'inbox'),
    [actions],
  )

  return { renderGoalGroup, topLevelGoalsFor, standaloneActionsFor }
}

/** Actions pointing at a Goal that no longer exists — surfaced, never silently dropped. */
export function useOrphanedActions(): Action[] {
  const { goals } = useGoals()
  const { actions } = useActions()
  return actions.filter(
    (a) => a.state !== 'inbox' && a.goalId && !goals.some((g) => g.id === a.goalId),
  )
}
