import { useState } from 'react'
import { ChevronRight, Plus, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useToast } from '@/shared/components/toast/toast-context'
import { usePaths } from '@/modules/paths/hooks/use-paths'
import { useGoals } from '../hooks/use-goals'
import type { Goal } from '../types/goal'
import { GoalRow, type GoalRowAction } from './GoalRow'
import { GoalDialog } from './GoalDialog'
import { MoveGoalDialog } from './MoveGoalDialog'
import { DeleteGoalDialog } from './DeleteGoalDialog'

type DialogState =
  | { type: 'create'; parentGoalId: string | null }
  | { type: 'edit'; goal: Goal }
  | { type: 'move'; goal: Goal }
  | { type: 'delete'; goal: Goal }
  | null

/**
 * The Path's Goal tree, embedded on the Path overview (ADR 0043). Owns the
 * `GoalRow` list, drag-and-drop + keyboard reorder, the per-row lifecycle menu
 * (edit / add sub-Goal / move / achieve / abandon / delete), "New Goal", and
 * the empty state. Data-unreadable recovery is the overview's job — this
 * section assumes readable `goals` / `actions`.
 *
 * `goals`-owned, mirroring how `vision` owns `VisionSummaryCard`.
 */
export function PathGoalsSection({ pathId, readOnly }: { pathId: string; readOnly: boolean }) {
  const { showToast } = useToast()
  const { getPath } = usePaths()
  const {
    topLevelGoals,
    getGoal,
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
  // Achieved Goals collapse away by default — a finished Goal is history, not
  // something to scroll past every visit (ADR 0046). Session-only, per mount.
  const [showAchieved, setShowAchieved] = useState(false)

  const pathName = getPath(pathId)?.name ?? ''
  // `topLevelGoals` already sinks achieved Goals to the end (by priority sort);
  // splitting here keeps the indices we hand each group contiguous.
  const goals = topLevelGoals(pathId)
  const openGoals = goals.filter((g) => g.state !== 'achieved')
  const achievedGoals = goals.filter((g) => g.state === 'achieved')

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
    <section aria-labelledby="goals-heading" className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 id="goals-heading" className="text-sm font-semibold">
          Goals
        </h2>
        {!readOnly && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDialog({ type: 'create', parentGoalId: null })}
          >
            <Plus aria-hidden="true" /> New Goal
          </Button>
        )}
      </div>

      {goals.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card py-16 text-center">
          <Target className="size-8 text-muted-foreground" aria-hidden="true" />
          <div className="max-w-sm">
            <h3 className="text-sm font-semibold">No Goals yet</h3>
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
        </div>
      ) : (
        <>
          {openGoals.length > 0 ? (
            <ul className="flex flex-col gap-1">
              {openGoals.map((g, i) => (
                <GoalRow
                  key={g.id}
                  goal={g}
                  depth={0}
                  index={i}
                  siblingCount={openGoals.length}
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
          ) : (
            <p className="rounded-lg border border-dashed border-border bg-card px-3 py-4 text-sm text-muted-foreground">
              Every Goal on this Path is achieved.
            </p>
          )}

          {achievedGoals.length > 0 && (
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => setShowAchieved((v) => !v)}
                aria-expanded={showAchieved}
                aria-controls="achieved-goals"
                className="flex items-center gap-1.5 self-start rounded-sm py-1 text-xs font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <ChevronRight
                  className={cn('size-3.5 transition-transform', showAchieved && 'rotate-90')}
                  aria-hidden="true"
                />
                Achieved
                <span className="rounded-full bg-muted px-1.5 tabular-nums">
                  {achievedGoals.length}
                </span>
              </button>
              {showAchieved && (
                <ul id="achieved-goals" className="flex flex-col gap-1">
                  {achievedGoals.map((g, j) => (
                    <GoalRow
                      key={g.id}
                      goal={g}
                      depth={0}
                      index={openGoals.length + j}
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
            </div>
          )}
        </>
      )}

      {dialog?.type === 'create' && (
        <GoalDialog
          open
          onOpenChange={(o) => !o && setDialog(null)}
          title={dialog.parentGoalId ? 'New sub-Goal' : 'New Goal'}
          description={
            dialog.parentGoalId
              ? 'Nested under its parent — inherits the same Path.'
              : `Top-level under “${pathName}”.`
          }
          submitLabel={dialog.parentGoalId ? 'Create sub-Goal' : 'Create Goal'}
          onSubmit={(data) => {
            const parentGoalId = dialog.parentGoalId
            createGoal({ pathId, parentGoalId, ...data })
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
    </section>
  )
}
