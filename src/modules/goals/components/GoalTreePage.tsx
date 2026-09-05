import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArchiveRestore, Plus, Target } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { useToast } from '@/shared/components/toast/toast-context'
import { usePaths } from '@/modules/paths/hooks/use-paths'
import { PathsDataUnreadable } from '@/modules/paths/components/PathsDataUnreadable'
import { PathNotFound } from '@/modules/paths/components/PathNotFound'
import { PathTabs } from '@/modules/paths/components/PathTabs'
import { useActions } from '@/modules/capture-triage/hooks/use-actions'
import { ActionsDataUnreadable } from '@/modules/capture-triage/components/ActionsDataUnreadable'
import { useGoals } from '../hooks/use-goals'
import type { Goal } from '../types/goal'
import { GoalRow, type GoalRowAction } from './GoalRow'
import { GoalDialog } from './GoalDialog'
import { MoveGoalDialog } from './MoveGoalDialog'
import { DeleteGoalDialog } from './DeleteGoalDialog'
import { GoalsDataUnreadable } from './GoalsDataUnreadable'

type DialogState =
  | { type: 'create'; parentGoalId: string | null }
  | { type: 'edit'; goal: Goal }
  | { type: 'move'; goal: Goal }
  | { type: 'delete'; goal: Goal }
  | null

export function GoalTreePage() {
  const { pathId = '' } = useParams()
  const { showToast } = useToast()
  const { getPath, unarchivePath, dataUnreadable: pathsUnreadable, resetPaths } = usePaths()
  const { dataUnreadable: actionsUnreadable, resetActions } = useActions()
  const {
    topLevelGoals,
    getGoal,
    dataUnreadable: goalsUnreadable,
    resetGoals,
    createGoal,
    editGoal,
    reorderGoal,
    moveGoalToPath,
    setGoalState,
    deleteGoal,
    cascadeCounts,
  } = useGoals()

  const [dragId, setDragId] = useState<string | null>(null)
  const [dialog, setDialog] = useState<DialogState>(null)

  if (pathsUnreadable) return <PathsDataUnreadable onReset={resetPaths} />
  if (goalsUnreadable) return <GoalsDataUnreadable onReset={resetGoals} />
  if (actionsUnreadable) return <ActionsDataUnreadable onReset={resetActions} />

  const path = getPath(pathId)
  if (!path) return <PathNotFound />

  const readOnly = path.archived
  const goals = topLevelGoals(pathId)

  const handleDropOn = (target: Goal, targetIndex: number) => {
    const draggedId = dragId
    setDragId(null)
    if (!draggedId || draggedId === target.id) return
    const dragged = getGoal(draggedId)
    if (!dragged) return
    // Dragging never crosses sibling groups — same Path + same parent only.
    if (dragged.pathId !== target.pathId || dragged.parentGoalId !== target.parentGoalId) return
    const undo = reorderGoal(dragged.id, targetIndex)
    showToast(`Moved “${dragged.name}”`, { label: 'Undo', onClick: undo })
  }

  const handleReorder = (goal: Goal, toIndex: number) => {
    const undo = reorderGoal(goal.id, toIndex)
    showToast(`Moved “${goal.name}”`, { label: 'Undo', onClick: undo })
  }

  const handleSetState = (goal: Goal, state: 'achieved' | 'abandoned' | 'active') => {
    setGoalState(goal.id, state)
    const verb = state === 'achieved' ? 'Achieved' : state === 'abandoned' ? 'Abandoned' : 'Reactivated'
    showToast(`${verb} “${goal.name}”`)
  }

  const handleAction = (action: GoalRowAction, goal: Goal) => {
    if (action === 'edit') setDialog({ type: 'edit', goal })
    if (action === 'addSub') setDialog({ type: 'create', parentGoalId: goal.id })
    if (action === 'move') setDialog({ type: 'move', goal })
    if (action === 'delete') setDialog({ type: 'delete', goal })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          to={`/paths/${path.id}`}
          className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'self-start' })}
        >
          <ArrowLeft aria-hidden="true" /> {path.name}
        </Link>
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-semibold">Goals</h1>
          {!readOnly && (
            <Button onClick={() => setDialog({ type: 'create', parentGoalId: null })}>
              <Plus aria-hidden="true" /> New Goal
            </Button>
          )}
        </div>
      </div>

      <PathTabs pathId={path.id} />

      {readOnly && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 p-3">
          <p className="text-sm text-muted-foreground">
            “{path.name}” is archived. Its Goals are kept but read-only until you restore it.
          </p>
          <Button variant="outline" size="sm" onClick={() => unarchivePath(path.id)}>
            <ArchiveRestore aria-hidden="true" /> Unarchive
          </Button>
        </div>
      )}

      {goals.length === 0 ? (
        <section className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <Target className="size-8 text-muted-foreground" aria-hidden="true" />
          <div className="max-w-sm">
            <h2 className="text-sm font-semibold">No Goals yet on “{path.name}”</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {readOnly
                ? 'No Goals were added to this Path.'
                : 'A Goal is the execution layer — the concrete work under this Path, in the order you decide.'}
            </p>
          </div>
          {!readOnly && (
            <Button onClick={() => setDialog({ type: 'create', parentGoalId: null })}>
              <Plus aria-hidden="true" /> Create your first Goal
            </Button>
          )}
        </section>
      ) : (
        <ul className="flex flex-col gap-1">
          {goals.map((g, i) => (
            <GoalRow
              key={g.id}
              goal={g}
              depth={0}
              index={i}
              siblingCount={goals.length}
              dragId={dragId}
              readOnly={readOnly}
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

      {dialog?.type === 'create' && (
        <GoalDialog
          open
          onOpenChange={(o) => !o && setDialog(null)}
          title={dialog.parentGoalId ? 'New sub-Goal' : 'New Goal'}
          description={
            dialog.parentGoalId
              ? 'Nested under its parent — inherits the same Path.'
              : `Top-level under “${path.name}”.`
          }
          submitLabel={dialog.parentGoalId ? 'Create sub-Goal' : 'Create Goal'}
          onSubmit={(data) => {
            const parentGoalId = dialog.parentGoalId
            createGoal({ pathId: path.id, parentGoalId, ...data })
            showToast(`Created “${data.name}”`)
          }}
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
          onSubmit={(data) => {
            editGoal(dialog.goal.id, data)
            showToast(`Saved “${data.name}”`)
          }}
        />
      )}

      {dialog?.type === 'move' && (
        <MoveGoalDialog
          open
          onOpenChange={(o) => !o && setDialog(null)}
          goalName={dialog.goal.name}
          currentPathId={dialog.goal.pathId}
          onMove={(newPathId) => {
            const undo = moveGoalToPath(dialog.goal.id, newPathId)
            showToast(`Moved “${dialog.goal.name}” to another Path`, { label: 'Undo', onClick: undo })
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
            deleteGoal(dialog.goal.id)
            showToast(`“${name}” deleted`)
          }}
        />
      )}
    </div>
  )
}
