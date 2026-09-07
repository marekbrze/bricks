import { cn } from '@/lib/utils'
import type { Action } from '@/modules/capture-triage/types/action'
import type { Goal } from '@/modules/goals/types/goal'
import { compareActionsForList, isSettled } from '../lib/group-actions'
import { ActionRowItem } from './ActionRowItem'
import { actionRowProps, type ActionRowCallbacks } from './GoalGroup'
import { QuickAddActionRow } from './QuickAddActionRow'
import { useActionDropZone } from './action-dnd'

/**
 * The body of one Path's Actions: its active Goal groups in priority order,
 * then the Path's standalone Actions, then inactive Goals that still hold
 * open work — collapsed and dimmed, at the bottom (docs/modules/actions.md).
 *
 * Shared verbatim by the Actions view (wrapped in `PathSection`, one per
 * Path) and by a Path's own Actions tab, so the two screens can't drift.
 * Both are drag-and-drop targets: Goal groups take Actions dropped on them,
 * and the Standalone block strips an Action's Goal.
 */
export function PathActionsBody({
  path,
  topLevelGoals,
  standaloneActions,
  showCompleted,
  rowCallbacks,
  onQuickAddStandalone,
  renderGoalGroup,
}: {
  path: { id: string; name: string }
  /** Top-level Goals of this Path, in priority order — active ones plus inactive ones still holding open Actions. */
  topLevelGoals: Goal[]
  standaloneActions: Action[]
  showCompleted: boolean
  rowCallbacks: ActionRowCallbacks
  /** Omitted while the Path is archived — read-only, so no new work. */
  onQuickAddStandalone?: (name: string, scheduledDate: string | null) => void
  renderGoalGroup: (goal: Goal) => React.ReactNode
}) {
  const activeGoals = topLevelGoals.filter((g) => g.state === 'active')
  const inactiveGoals = topLevelGoals.filter((g) => g.state !== 'active')
  const standaloneVisible = [...standaloneActions]
    .filter((a) => (showCompleted ? true : !isSettled(a)))
    .sort(compareActionsForList)
  const { active: dropActive, isOver, dropProps } = useActionDropZone({
    pathId: path.id,
    goalId: null,
  })

  return (
    <>
      {activeGoals.map((g) => renderGoalGroup(g))}

      {/* Drop handlers only; the keyboard-accessible way to file an Action
          here is the row menu's "Move to…". The standalone block carries the
          same card surface as a Goal group — it is one more place work files
          into, and one row-group vocabulary keeps the column reading true. */}
      <div
        {...dropProps}
        role="group"
        className={cn(
          'flex flex-col gap-1.5 rounded-xl border border-border bg-card p-3',
          dropActive && 'outline-1 outline-dashed outline-border',
          isOver && 'bg-primary/5 outline-2 outline-solid outline-primary',
        )}
        aria-label={`Standalone actions in ${path.name}`}
      >
        <h3 className="text-sm font-medium text-muted-foreground">Standalone</h3>
        <ul className="flex flex-col gap-1">
          {standaloneVisible.map((a) => (
            <ActionRowItem key={a.id} {...actionRowProps(a, rowCallbacks)} />
          ))}
          {standaloneVisible.length === 0 && standaloneActions.length > 0 && (
            <li className="px-2 py-1 text-xs text-muted-foreground" aria-live="polite">
              All clear
            </li>
          )}
        </ul>
        {onQuickAddStandalone && (
          <QuickAddActionRow
            label={`Add a standalone action in ${path.name}`}
            onCreate={onQuickAddStandalone}
          />
        )}
      </div>

      {inactiveGoals.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-dashed border-border pt-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            Closed goals with open actions
          </h3>
          {inactiveGoals.map((g) => renderGoalGroup(g))}
        </div>
      )}
    </>
  )
}
