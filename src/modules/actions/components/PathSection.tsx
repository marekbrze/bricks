import { Plus, Signpost } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Action } from '@/modules/capture-triage/types/action'
import type { Path } from '@/modules/paths/types/path'
import type { Goal } from '@/modules/goals/types/goal'
import type { ActionRowCallbacks } from './GoalGroup'
import { PathActionsBody } from './PathActionsBody'

/**
 * One Path's section in the Actions view: Path header (name + New goal) over
 * the shared `PathActionsBody` — Goal groups, standalone Actions, closed
 * Goals still holding open work. An empty Path still renders, carrying only
 * its quick-add rows, so there's never a dead end.
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
  return (
    <section aria-label={`Path: ${path.name}`} className="flex flex-col gap-3 rounded-xl border border-border p-4">
      <div className="flex items-center gap-2">
        <Signpost className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <h2 className="min-w-0 flex-1 truncate text-base font-semibold">{path.name}</h2>
        <Button variant="outline" size="sm" onClick={onNewGoal}>
          <Plus aria-hidden="true" /> New goal
        </Button>
      </div>

      <PathActionsBody
        path={path}
        topLevelGoals={topLevelGoals}
        standaloneActions={standaloneActions}
        showCompleted={showCompleted}
        rowCallbacks={rowCallbacks}
        onQuickAddStandalone={onQuickAddStandalone}
        renderGoalGroup={renderGoalGroup}
      />
    </section>
  )
}
