import { Plus, Signpost } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Action } from '@/modules/capture-triage/types/action'
import type { Path } from '@/modules/paths/types/path'
import type { Goal } from '@/modules/goals/types/goal'
import { compareActionsForList, isSettled } from '../lib/group-actions'
import { ActionRowItem } from './ActionRowItem'
import type { ActionRowCallbacks } from './GoalGroup'
import { QuickAddActionRow } from './QuickAddActionRow'

/**
 * One Path's section in the Actions view: Path header (name + New goal),
 * active Goal groups in priority order with nested sub-Goals, the Path's
 * standalone Actions, then inactive Goals that still hold open work —
 * collapsed and dimmed, at the bottom (docs/modules/actions.md). An empty
 * Path still renders, carrying only its quick-add rows, so there's never a
 * dead end.
 */
export function PathSection({
  path,
  topLevelGoals,
  standaloneActions,
  showCompleted,
  rowCallbacks,
  onQuickAddStandalone,
  onNewGoal,
  renderGoalGroup,
}: {
  path: Path
  /** Top-level Goals of this Path, in priority order — active ones plus inactive ones still holding open Actions. */
  topLevelGoals: Goal[]
  standaloneActions: Action[]
  showCompleted: boolean
  rowCallbacks: ActionRowCallbacks
  onQuickAddStandalone: (name: string, scheduledDate: string | null) => void
  onNewGoal: () => void
  renderGoalGroup: (goal: Goal, depth: number) => React.ReactNode
}) {
  const activeGoals = topLevelGoals.filter((g) => g.state === 'active')
  const inactiveGoals = topLevelGoals.filter((g) => g.state !== 'active')
  const standaloneVisible = [...standaloneActions]
    .filter((a) => (showCompleted ? true : !isSettled(a)))
    .sort(compareActionsForList)

  return (
    <section aria-label={`Path: ${path.name}`} className="flex flex-col gap-3 rounded-xl border border-border p-4">
      <div className="flex items-center gap-2">
        <Signpost className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <h2 className="min-w-0 flex-1 truncate text-base font-semibold">{path.name}</h2>
        <Button variant="outline" size="sm" onClick={onNewGoal}>
          <Plus aria-hidden="true" /> New goal
        </Button>
      </div>

      {activeGoals.map((g) => renderGoalGroup(g, 0))}

      <div className="flex flex-col gap-1.5" aria-label={`Standalone actions in ${path.name}`}>
        <h3 className="text-sm font-medium text-muted-foreground">Standalone</h3>
        <ul className="flex flex-col gap-1">
          {standaloneVisible.map((a) => (
            <ActionRowItem
              key={a.id}
              action={a}
              onToggleDone={(done) => rowCallbacks.onToggleDone(a, done)}
              onScheduleToday={() => rowCallbacks.onScheduleToday(a)}
              onSchedule={() => rowCallbacks.onSchedule(a)}
              onUnschedule={() => rowCallbacks.onUnschedule(a)}
              onRename={() => rowCallbacks.onRename(a)}
              onToggleFrog={() => rowCallbacks.onToggleFrog(a)}
              onDelete={() => rowCallbacks.onDelete(a)}
            />
          ))}
          {standaloneVisible.length === 0 && standaloneActions.length > 0 && (
            <li className="px-2 py-1 text-xs text-muted-foreground" aria-live="polite">
              All clear
            </li>
          )}
        </ul>
        <QuickAddActionRow label={`Add a standalone action in ${path.name}`} onCreate={onQuickAddStandalone} />
      </div>

      {inactiveGoals.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-dashed border-border pt-3">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Closed goals with open actions
          </h3>
          {inactiveGoals.map((g) => renderGoalGroup(g, 0))}
        </div>
      )}
    </section>
  )
}
