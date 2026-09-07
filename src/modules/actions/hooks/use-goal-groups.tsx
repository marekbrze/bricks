import { useCallback, useState } from 'react'
import type { ReactNode } from 'react'
import { useLocalStorageState } from '@/shared/hooks/use-local-storage'
import { useToast } from '@/shared/components/toast/toast-context'
import { useGoals } from '@/modules/goals/hooks/use-goals'
import { useActions } from '@/modules/capture-triage/hooks/use-actions'
import type { Action } from '@/modules/capture-triage/types/action'
import type { Goal } from '@/modules/goals/types/goal'
import { isSettled } from '../lib/group-actions'
import { CloseGoalDialog } from '../components/CloseGoalDialog'
import { GoalGroup, type ActionRowCallbacks, type GoalLifecycleCallbacks } from '../components/GoalGroup'

/**
 * Builds one Path's Goal tree as nested `GoalGroup`s, plus the two list
 * selections and the Goal-lifecycle plumbing that go with it. Shared by the
 * Actions view and a Path's Actions tab so both apply the same rules:
 *
 * - a Goal renders while it is `active`, or while it still holds open work
 *   (an achieved Goal with a leftover Action stays reachable);
 * - collapse choices persist per Goal id across visits and across both
 *   screens (edgecases #7), under the `actions-group-visibility` key;
 * - every group header carries the lifecycle menu — close (celebration
 *   dialog), abandon, reactivate — unless the screen is read-only (ADR 0039).
 */
export function useGoalGroups({
  showCompleted,
  rowCallbacks,
  readOnly = false,
}: {
  showCompleted: boolean
  rowCallbacks: ActionRowCallbacks
  /** An archived Path's tab renders groups without the lifecycle menu. */
  readOnly?: boolean
}): {
  renderGoalGroup: (goal: Goal) => ReactNode
  /** Top-level Goals of a Path worth rendering, in priority order. */
  topLevelGoalsFor: (pathId: string) => Goal[]
  /** Actions assigned to the Path itself, with no Goal in between. */
  standaloneActionsFor: (pathId: string) => Action[]
  /** The lifecycle dialogs the menus open — the page renders this. */
  goalDialogs: ReactNode
} {
  const { topLevelGoals, childGoals, setGoalState } = useGoals()
  const { actions, createAction } = useActions()
  const { showToast } = useToast()
  const { value: expandedOverrides, setValue: setExpandedOverrides } = useLocalStorageState<
    Record<string, boolean>
  >('actions-group-visibility', {})

  const [closing, setClosing] = useState<Goal | null>(null)

  const toggleExpanded = useCallback(
    (goalId: string, next: boolean) => setExpandedOverrides((prev) => ({ ...prev, [goalId]: next })),
    [setExpandedOverrides],
  )

  const worthRendering = useCallback(
    (g: Goal) => g.state === 'active' || actions.some((a) => a.goalId === g.id && !isSettled(a)),
    [actions],
  )

  const lifecycleFor = useCallback(
    (goal: Goal): GoalLifecycleCallbacks | undefined => {
      if (readOnly) return undefined
      return {
        // Closing goes through the celebration dialog — a deliberate beat,
        // not a menu slip (ADR 0039).
        onAchieve: () => setClosing(goal),
        onAbandon: () => {
          setGoalState(goal.id, 'abandoned')
          showToast(`Abandoned “${goal.name}”`)
        },
        onReactivate: () => {
          setGoalState(goal.id, 'active')
          showToast(`Reactivated “${goal.name}”`)
        },
      }
    },
    [readOnly, setGoalState, showToast],
  )

  const renderGoalGroup = useCallback(
    (goal: Goal): ReactNode => {
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
          rowCallbacks={rowCallbacks}
          lifecycle={lifecycleFor(goal)}
          onCreate={(name, scheduledDate) => {
            if (!goal.pathId) return
            createAction({ name, pathId: goal.pathId, goalId: goal.id, scheduledDate })
          }}
          renderChild={(child) => renderGoalGroup(child)}
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
      lifecycleFor,
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

  const goalDialogs = closing ? (
    <CloseGoalDialog
      goalName={closing.name}
      onOpenChange={(open) => !open && setClosing(null)}
      onConfirm={() => {
        const closed = closing
        setClosing(null)
        if (!closed) return
        setGoalState(closed.id, 'achieved')
        showToast(`Achieved “${closed.name}” — a big win in the Log`)
      }}
    />
  ) : null

  return { renderGoalGroup, topLevelGoalsFor, standaloneActionsFor, goalDialogs }
}

/** Actions pointing at a Goal that no longer exists — surfaced, never silently dropped. */
export function useOrphanedActions(): Action[] {
  const { goals } = useGoals()
  const { actions } = useActions()
  return actions.filter(
    (a) => a.state !== 'inbox' && a.goalId && !goals.some((g) => g.id === a.goalId),
  )
}
