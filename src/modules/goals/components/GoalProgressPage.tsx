import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Flame, Plus } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { useToast } from '@/shared/components/toast/toast-context'
import { usePaths } from '@/modules/paths/hooks/use-paths'
import { PathsDataUnreadable } from '@/modules/paths/components/PathsDataUnreadable'
import { PathNotFound } from '@/modules/paths/components/PathNotFound'
import { ContributionGraph } from '@/modules/paths/components/ContributionGraph'
import { useGoals } from '../hooks/use-goals'
import type { Goal } from '../types/goal'
import { daysUntil, deadlineLabel } from '../lib/deadline'
import { GoalRow, type GoalRowAction } from './GoalRow'
import { GoalOverflowMenu } from './GoalOverflowMenu'
import { GoalDialog } from './GoalDialog'
import { MoveGoalDialog } from './MoveGoalDialog'
import { DeleteGoalDialog } from './DeleteGoalDialog'
import { GoalsDataUnreadable } from './GoalsDataUnreadable'
import { GoalNotFound } from './GoalNotFound'

type DialogState =
  | { type: 'create' }
  | { type: 'edit'; goal: Goal }
  | { type: 'move'; goal: Goal }
  | { type: 'delete'; goal: Goal }
  | null

/**
 * A Goal's own hub: its deadline/state/frog, the cumulative Action count +
 * contribution graph toward it (subtree-inclusive), its own Actions, and its
 * sub-Goals (each drilling further in). See docs/modules/goals.md →
 * "View Goal progress".
 */
export function GoalProgressPage() {
  const { pathId = '', goalId = '' } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { getPath, dataUnreadable: pathsUnreadable, resetPaths } = usePaths()
  const {
    getGoal,
    childGoals,
    siblingGoals,
    actionsFor,
    cascadeCounts,
    dataUnreadable: goalsUnreadable,
    resetGoals,
    createGoal,
    editGoal,
    reorderGoal,
    moveGoalToPath,
    setGoalState,
    deleteGoal,
    toggleFrog,
  } = useGoals()

  const [dragId, setDragId] = useState<string | null>(null)
  const [dialog, setDialog] = useState<DialogState>(null)

  if (pathsUnreadable) return <PathsDataUnreadable onReset={resetPaths} />
  if (goalsUnreadable) return <GoalsDataUnreadable onReset={resetGoals} />

  const path = getPath(pathId)
  if (!path) return <PathNotFound />

  const goal = getGoal(goalId)
  if (!goal || goal.pathId !== pathId) return <GoalNotFound pathId={pathId} />

  const children = childGoals(goal.id)
  const ownActions = actionsFor(goal.id)
  const counts = cascadeCounts(goal.id)
  const siblings = siblingGoals(goal)
  const ownIndex = siblings.findIndex((g) => g.id === goal.id)

  const handleDropOn = (target: Goal, targetIndex: number) => {
    const draggedId = dragId
    setDragId(null)
    if (!draggedId || draggedId === target.id) return
    const dragged = children.find((c) => c.id === draggedId)
    if (!dragged) return
    const undo = reorderGoal(dragged.id, targetIndex)
    showToast(`Moved “${dragged.name}”`, { label: 'Undo', onClick: undo })
  }

  const handleReorder = (g: Goal, toIndex: number) => {
    const undo = reorderGoal(g.id, toIndex)
    showToast(`Moved “${g.name}”`, { label: 'Undo', onClick: undo })
  }

  const handleSetState = (g: Goal, state: 'achieved' | 'abandoned' | 'active') => {
    setGoalState(g.id, state)
    const verb = state === 'achieved' ? 'Achieved' : state === 'abandoned' ? 'Abandoned' : 'Reactivated'
    showToast(`${verb} “${g.name}”`)
  }

  const handleAction = (action: GoalRowAction, g: Goal) => {
    if (action === 'edit') setDialog({ type: 'edit', goal: g })
    if (action === 'addSub') setDialog({ type: 'create' })
    if (action === 'move') setDialog({ type: 'move', goal: g })
    if (action === 'delete') setDialog({ type: 'delete', goal: g })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          to={`/paths/${path.id}/goals`}
          className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'self-start' })}
        >
          <ArrowLeft aria-hidden="true" /> Goals
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold break-words">{goal.name}</h1>
            {goal.frog && (
              <span aria-label="Frog" className="inline-flex shrink-0">
                <Flame className="size-5 text-destructive" aria-hidden="true" />
              </span>
            )}
            {goal.deadline && (
              <span
                className={
                  daysUntil(goal.deadline) < 0
                    ? 'shrink-0 rounded-full bg-destructive/10 px-2 py-0.5 text-xs text-destructive'
                    : 'shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground'
                }
              >
                {deadlineLabel(daysUntil(goal.deadline))}
              </span>
            )}
          </div>
          <GoalOverflowMenu
            goalName={goal.name}
            state={goal.state}
            frog={goal.frog}
            onEdit={() => handleAction('edit', goal)}
            onAddSubGoal={() => handleAction('addSub', goal)}
            onMove={() => handleAction('move', goal)}
            onToggleFrog={() => toggleFrog(goal.id)}
            onAchieve={() => handleSetState(goal, 'achieved')}
            onAbandon={() => handleSetState(goal, 'abandoned')}
            onReactivate={() => handleSetState(goal, 'active')}
            onDelete={() => handleAction('delete', goal)}
            onMoveUp={() => handleReorder(goal, ownIndex - 1)}
            onMoveDown={() => handleReorder(goal, ownIndex + 1)}
            canMoveUp={ownIndex > 0}
            canMoveDown={ownIndex < siblings.length - 1}
          />
        </div>
        {goal.description && <p className="text-sm text-muted-foreground">{goal.description}</p>}
      </div>

      <section aria-labelledby="progress-heading" className="flex flex-col gap-2">
        <h2 id="progress-heading" className="text-sm font-semibold">
          Progress
        </h2>
        <div className="flex flex-col gap-3 rounded-lg border border-border p-3">
          <p className="text-sm text-muted-foreground">
            {counts.actions} cumulative {counts.actions === 1 ? 'Action' : 'Actions'}
            {counts.subGoals > 0 && ` across ${counts.subGoals} sub-${counts.subGoals === 1 ? 'Goal' : 'Goals'}`}
          </p>
          <ContributionGraph winDays={goal.mockWinDays} weeks={20} label={`${goal.name} wins`} />
        </div>
      </section>

      <section aria-labelledby="own-actions-heading" className="flex flex-col gap-2">
        <h2 id="own-actions-heading" className="text-sm font-semibold">
          Actions ({ownActions.length})
        </h2>
        {ownActions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No Actions assigned directly to this Goal yet — triage one in from the Inbox.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
            {ownActions.map((a) => (
              <li key={a.id} className="flex items-center gap-2 px-3 py-2 text-sm">
                {a.frog && (
                  <span aria-label="Frog" className="inline-flex shrink-0">
                    <Flame className="size-3.5 text-destructive" aria-hidden="true" />
                  </span>
                )}
                <span className="min-w-0 flex-1 truncate">{a.name}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="subgoals-heading" className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 id="subgoals-heading" className="text-sm font-semibold">
            Sub-Goals ({children.length})
          </h2>
          <Button variant="outline" size="sm" onClick={() => setDialog({ type: 'create' })}>
            <Plus aria-hidden="true" /> Add sub-Goal
          </Button>
        </div>
        {children.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
            No sub-Goals — break this down if it turns out to need more than one thread of work.
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {children.map((g, i) => (
              <GoalRow
                key={g.id}
                goal={g}
                depth={0}
                index={i}
                siblingCount={children.length}
                dragId={dragId}
                onDragStart={setDragId}
                onDropOn={handleDropOn}
                onDragEnd={() => setDragId(null)}
                onReorder={handleReorder}
                onSetState={handleSetState}
                onAction={handleAction}
              />
            ))}
          </ul>
        )}
      </section>

      {dialog?.type === 'create' && (
        <GoalDialog
          open
          onOpenChange={(o) => !o && setDialog(null)}
          title="New sub-Goal"
          description={`Nested under “${goal.name}” — inherits the same Path.`}
          submitLabel="Create sub-Goal"
          onSubmit={(data) => createGoal({ pathId: goal.pathId, parentGoalId: goal.id, ...data })}
        />
      )}

      {dialog?.type === 'edit' && (
        <GoalDialog
          open
          onOpenChange={(o) => !o && setDialog(null)}
          title="Edit Goal"
          description="Name, description, deadline."
          submitLabel="Save"
          initial={{
            name: dialog.goal.name,
            description: dialog.goal.description,
            deadline: dialog.goal.deadline,
          }}
          onSubmit={(data) => editGoal(dialog.goal.id, data)}
        />
      )}

      {dialog?.type === 'move' && (
        <MoveGoalDialog
          open
          onOpenChange={(o) => !o && setDialog(null)}
          goalName={dialog.goal.name}
          currentPathId={dialog.goal.pathId}
          onMove={(newPathId) => {
            const wasSelf = dialog.goal.id === goal.id
            const name = dialog.goal.name
            moveGoalToPath(dialog.goal.id, newPathId)
            showToast(`Moved “${name}” to another Path`)
            if (wasSelf) navigate(`/paths/${newPathId}/goals/${dialog.goal.id}`)
          }}
        />
      )}

      {dialog?.type === 'delete' && (
        <DeleteGoalDialog
          open
          onOpenChange={(o) => !o && setDialog(null)}
          goalName={dialog.goal.name}
          counts={cascadeCounts(dialog.goal.id)}
          onConfirm={() => {
            const name = dialog.goal.name
            const wasSelf = dialog.goal.id === goal.id
            deleteGoal(dialog.goal.id)
            showToast(`“${name}” deleted`)
            if (wasSelf) navigate(`/paths/${pathId}/goals`)
          }}
        />
      )}
    </div>
  )
}
