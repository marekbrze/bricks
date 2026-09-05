import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ListTodo, Signpost } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { usePaths } from '@/modules/paths/hooks/use-paths'
import { PathsDataUnreadable } from '@/modules/paths/components/PathsDataUnreadable'
import { useGoals } from '@/modules/goals/hooks/use-goals'
import { GoalsDataUnreadable } from '@/modules/goals/components/GoalsDataUnreadable'
import { GoalDialog } from '@/modules/goals/components/GoalDialog'
import { useActions } from '@/modules/capture-triage/hooks/use-actions'
import { ActionsDataUnreadable } from '@/modules/capture-triage/components/ActionsDataUnreadable'
import { useToast } from '@/shared/components/toast/toast-context'
import { compareActionsForList, isSettled } from '../lib/group-actions'
import { useActionRowActions } from '../hooks/use-action-row-actions'
import { useGoalGroups, useOrphanedActions } from '../hooks/use-goal-groups'
import { actionRowProps } from './GoalGroup'
import { ActionRowItem } from './ActionRowItem'
import { PathSection } from './PathSection'
import { InboxGroup } from './InboxGroup'
import { ActionDndProvider } from './action-dnd'

type NewGoalState = { pathId: string; pathName: string } | null

/**
 * The Actions view — the flat whole-app task list (docs/modules/actions.md).
 * Inbox group on top, one section per active Path (Goal groups nested,
 * standalone Actions after), an "Unassigned" fallback for anything orphaned,
 * and a Show-completed toggle. All writes ride the owning modules' hooks.
 *
 * Rows drag between Goals, across Paths, and onto a Path's Standalone block;
 * a Path's own Actions tab (`/paths/:pathId/actions`) shows the same groups
 * scoped to one Path, from the same shared pieces.
 */
export function ActionsPage() {
  const [showCompleted, setShowCompleted] = useState(false)
  const [newGoal, setNewGoal] = useState<NewGoalState>(null)

  const { showToast } = useToast()
  const { activePaths, dataUnreadable: pathsUnreadable, resetPaths } = usePaths()
  const { createGoal, dataUnreadable: goalsUnreadable, resetGoals } = useGoals()
  const {
    inboxActions,
    createAction,
    dataUnreadable: actionsUnreadable,
    resetActions,
  } = useActions()

  const { rowCallbacks, moveAction, dialogs } = useActionRowActions()
  const { renderGoalGroup, topLevelGoalsFor, standaloneActionsFor } = useGoalGroups({
    showCompleted,
    rowCallbacks,
  })
  const orphaned = useOrphanedActions()

  if (pathsUnreadable) return <PathsDataUnreadable onReset={resetPaths} />
  if (goalsUnreadable) return <GoalsDataUnreadable onReset={resetGoals} />
  if (actionsUnreadable) return <ActionsDataUnreadable onReset={resetActions} />

  // An assigned Action can end up pointing at a Goal that no longer exists
  // (hand-edited storage, or a pre-cascade snapshot restored by Undo). Rather
  // than silently drop it, surface it in a dimmed fallback group under the
  // Inbox — `useActions`' self-heal still runs underneath for Path orphans.
  // Orphans obey "Show completed" like every other group (edgecases #3), and
  // render as full actionable rows — an inert list would be a dead-end (edgecases #2).
  const orphanedVisible = [...orphaned]
    .filter((a) => (showCompleted ? true : !isSettled(a)))
    .sort(compareActionsForList)

  return (
    <ActionDndProvider onMove={moveAction}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="flex items-center gap-2 text-xl font-semibold">
            <ListTodo className="size-5 text-muted-foreground" aria-hidden="true" /> Actions
          </h1>
          <div className="flex items-center gap-2">
            <Checkbox
              id="show-completed"
              checked={showCompleted}
              onCheckedChange={(v) => setShowCompleted(Boolean(v))}
            />
            <Label htmlFor="show-completed" className="text-sm text-muted-foreground">
              Show completed
            </Label>
          </div>
        </div>

        <InboxGroup actions={inboxActions} />

        {orphanedVisible.length > 0 && (
          <section
            aria-label="Unassigned actions"
            className="flex flex-col gap-1.5 rounded-xl border border-dashed border-border p-4 opacity-60"
          >
            <h2 className="text-sm font-medium text-muted-foreground">Unassigned</h2>
            <ul className="flex flex-col gap-1">
              {orphanedVisible.map((a) => (
                <ActionRowItem key={a.id} {...actionRowProps(a, rowCallbacks)} />
              ))}
            </ul>
          </section>
        )}

        {activePaths.length === 0 ? (
          <section className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
            <Signpost className="size-8 text-muted-foreground" aria-hidden="true" />
            <div className="max-w-sm">
              <p className="font-medium">No Paths yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Actions always belong somewhere — create a Path first, then its Goals and Actions
                will show up here.
              </p>
            </div>
            <Link to="/paths" className={buttonVariants({ variant: 'outline' })}>
              Go to Paths
            </Link>
          </section>
        ) : (
          activePaths.map((path) => (
            <PathSection
              key={path.id}
              path={path}
              topLevelGoals={topLevelGoalsFor(path.id)}
              standaloneActions={standaloneActionsFor(path.id)}
              showCompleted={showCompleted}
              rowCallbacks={rowCallbacks}
              onQuickAddStandalone={(name, scheduledDate) =>
                createAction({ name, pathId: path.id, scheduledDate })
              }
              onNewGoal={() => setNewGoal({ pathId: path.id, pathName: path.name })}
              renderGoalGroup={renderGoalGroup}
            />
          ))
        )}

        {dialogs}

        {newGoal && (
          <GoalDialog
            open
            onOpenChange={(open) => !open && setNewGoal(null)}
            title={`New goal in ${newGoal.pathName}`}
            description="Give it a name; add a deadline if it has one."
            submitLabel="Create goal"
            onSubmit={(data) => {
              createGoal({
                pathId: newGoal.pathId,
                parentGoalId: null,
                name: data.name,
                description: data.description,
                deadline: data.deadline,
              })
              showToast(`Goal “${data.name}” created in ${newGoal.pathName}`)
            }}
          />
        )}
      </div>
    </ActionDndProvider>
  )
}
