import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArchiveRestore, ArrowLeft, Plus } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useToast } from '@/shared/components/toast/toast-context'
import { useGoals } from '@/modules/goals/hooks/use-goals'
import { GoalsDataUnreadable } from '@/modules/goals/components/GoalsDataUnreadable'
import { GoalDialog } from '@/modules/goals/components/GoalDialog'
import { useActions } from '@/modules/capture-triage/hooks/use-actions'
import { ActionsDataUnreadable } from '@/modules/capture-triage/components/ActionsDataUnreadable'
import { ActionDndProvider } from '@/modules/actions/components/action-dnd'
import { ActionRowItem } from '@/modules/actions/components/ActionRowItem'
import { actionRowProps } from '@/modules/actions/components/GoalGroup'
import { PathActionsBody } from '@/modules/actions/components/PathActionsBody'
import { useActionRowActions } from '@/modules/actions/hooks/use-action-row-actions'
import { useGoalGroups, useOrphanedActions } from '@/modules/actions/hooks/use-goal-groups'
import { compareActionsForList, isSettled } from '@/modules/actions/lib/group-actions'
import { usePaths } from '../hooks/use-paths'
import { PathTabs } from './PathTabs'
import { PathNotFound } from './PathNotFound'
import { PathsDataUnreadable } from './PathsDataUnreadable'

/**
 * A Path's Actions tab: everything under this one Path, in the same shape the
 * whole-app Actions view uses — Goal groups (sub-Goals nested), the Path's
 * standalone Actions, then closed Goals still holding open work. Both screens
 * render from the same `PathActionsBody` + `useGoalGroups` + row actions, so
 * they can't drift apart.
 *
 * Rows drag between Goals here too, and the row menu's "Move to…" reaches
 * every other Path — this tab is a focused lens on one Path, not a cage.
 * An archived Path renders the same content read-only: no quick-add, no
 * New goal, no dragging.
 */
export function PathActionsPage() {
  const { pathId = '' } = useParams()
  const [showCompleted, setShowCompleted] = useState(false)
  const [creatingGoal, setCreatingGoal] = useState(false)

  const { showToast } = useToast()
  const { getPath, unarchivePath, dataUnreadable: pathsUnreadable, resetPaths } = usePaths()
  const { createGoal, dataUnreadable: goalsUnreadable, resetGoals } = useGoals()
  const { createAction, dataUnreadable: actionsUnreadable, resetActions } = useActions()

  const { rowCallbacks, moveAction, dialogs } = useActionRowActions()
  const { renderGoalGroup, topLevelGoalsFor, standaloneActionsFor } = useGoalGroups({
    showCompleted,
    rowCallbacks,
  })
  const orphaned = useOrphanedActions()

  if (pathsUnreadable) return <PathsDataUnreadable onReset={resetPaths} />
  if (goalsUnreadable) return <GoalsDataUnreadable onReset={resetGoals} />
  if (actionsUnreadable) return <ActionsDataUnreadable onReset={resetActions} />

  const path = getPath(pathId)
  if (!path) return <PathNotFound />

  const readOnly = path.archived
  const goals = topLevelGoalsFor(path.id)
  const standalone = standaloneActionsFor(path.id)
  // Orphans of *this* Path only — the whole-app view owns the rest.
  const orphanedVisible = orphaned
    .filter((a) => a.pathId === path.id)
    .filter((a) => (showCompleted ? true : !isSettled(a)))
    .sort(compareActionsForList)

  const empty = goals.length === 0 && standalone.length === 0

  const body = (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          to="/paths"
          className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'self-start' })}
        >
          <ArrowLeft aria-hidden="true" /> Paths
        </Link>
        <h1 className="text-xl font-semibold">{path.name}</h1>
      </div>

      <PathTabs pathId={path.id} />

      {readOnly && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 p-3">
          <p className="text-sm text-muted-foreground">
            “{path.name}” is archived. Its Actions are kept but read-only until you restore it.
          </p>
          <Button variant="outline" size="sm" onClick={() => unarchivePath(path.id)}>
            <ArchiveRestore aria-hidden="true" /> Unarchive
          </Button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Checkbox
            id="path-actions-show-completed"
            checked={showCompleted}
            onCheckedChange={(v) => setShowCompleted(Boolean(v))}
          />
          <Label htmlFor="path-actions-show-completed" className="text-sm text-muted-foreground">
            Show completed
          </Label>
        </div>
        {!readOnly && (
          <Button variant="outline" size="sm" onClick={() => setCreatingGoal(true)}>
            <Plus aria-hidden="true" /> New goal
          </Button>
        )}
      </div>

      {empty && (
        <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
          {readOnly
            ? 'This Path holds no Goals or Actions.'
            : 'Nothing here yet — add a Goal, or type an Action straight into the Standalone row below.'}
        </p>
      )}

      <section
        aria-label={`Actions in ${path.name}`}
        className="flex flex-col gap-3 rounded-xl border border-border p-4"
      >
        <PathActionsBody
          path={path}
          topLevelGoals={goals}
          standaloneActions={standalone}
          showCompleted={showCompleted}
          rowCallbacks={rowCallbacks}
          onQuickAddStandalone={
            readOnly
              ? undefined
              : (name, scheduledDate) => createAction({ name, pathId: path.id, scheduledDate })
          }
          renderGoalGroup={renderGoalGroup}
        />
      </section>

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

      {dialogs}

      {creatingGoal && (
        <GoalDialog
          open
          onOpenChange={(open) => !open && setCreatingGoal(false)}
          title={`New goal in ${path.name}`}
          description="Give it a name; add a deadline if it has one."
          submitLabel="Create goal"
          onSubmit={(data) => {
            createGoal({
              pathId: path.id,
              parentGoalId: null,
              name: data.name,
              description: data.description,
              deadline: data.deadline,
            })
            showToast(`Goal “${data.name}” created in ${path.name}`)
          }}
        />
      )}
    </div>
  )

  // An archived Path is read-only — no drag provider, so rows carry no grip
  // and no group accepts a drop.
  return readOnly ? body : <ActionDndProvider onMove={moveAction}>{body}</ActionDndProvider>
}
