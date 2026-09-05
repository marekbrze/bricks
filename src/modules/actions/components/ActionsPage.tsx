import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLocalStorageState } from '@/shared/hooks/use-local-storage'
import { ListTodo, Signpost } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogClose,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { usePaths } from '@/modules/paths/hooks/use-paths'
import { PathsDataUnreadable } from '@/modules/paths/components/PathsDataUnreadable'
import { useGoals } from '@/modules/goals/hooks/use-goals'
import { GoalsDataUnreadable } from '@/modules/goals/components/GoalsDataUnreadable'
import { GoalDialog } from '@/modules/goals/components/GoalDialog'
import { useActions } from '@/modules/capture-triage/hooks/use-actions'
import { ActionsDataUnreadable } from '@/modules/capture-triage/components/ActionsDataUnreadable'
import { ScheduleActionDialog } from '@/modules/today/components/ScheduleActionDialog'
import { useToast } from '@/shared/components/toast/toast-context'
import type { Action } from '@/modules/capture-triage/types/action'
import { todayLocalIso } from '@/shared/lib/date'
import { compareActionsForList, isSettled } from '../lib/group-actions'
import { GoalGroup, type ActionRowCallbacks } from './GoalGroup'
import { ActionRowItem } from './ActionRowItem'
import { PathSection } from './PathSection'
import { InboxGroup } from './InboxGroup'

type ScheduleState = { action: Action } | null
type RenameState = { action: Action; name: string } | null
type NewGoalState = { pathId: string; pathName: string } | null
type DeleteState = { action: Action } | null

/**
 * The Actions view — the flat whole-app task list (docs/modules/actions.md).
 * Inbox group on top, one section per active Path (Goal groups nested,
 * standalone Actions after), an "Unassigned" fallback for anything orphaned,
 * and a Show-completed toggle. All writes ride the owning modules' hooks.
 */
export function ActionsPage() {
  const [showCompleted, setShowCompleted] = useState(false)
  const [schedule, setSchedule] = useState<ScheduleState>(null)
  const [rename, setRename] = useState<RenameState>(null)
  const [newGoal, setNewGoal] = useState<NewGoalState>(null)
  const [deleting, setDeleting] = useState<DeleteState>(null)
  // Persisted collapse choices per Goal id (edgecases #7) — undefined means
  // "use the group's default" (expanded, unless the Goal is inactive).
  const {
    value: expandedOverrides,
    setValue: setExpandedOverrides,
  } = useLocalStorageState<Record<string, boolean>>('actions-group-visibility', {})

  const { showToast } = useToast()
  const { activePaths, dataUnreadable: pathsUnreadable, resetPaths } = usePaths()
  const {
    goals,
    topLevelGoals,
    childGoals,
    createGoal,
    dataUnreadable: goalsUnreadable,
    resetGoals,
  } = useGoals()
  const {
    actions,
    inboxActions,
    createAction,
    renameAction,
    toggleActionFrog,
    scheduleAction,
    unscheduleAction,
    completeAction,
    uncompleteAction,
    deleteAction,
    dataUnreadable: actionsUnreadable,
    resetActions,
  } = useActions()

  if (pathsUnreadable) return <PathsDataUnreadable onReset={resetPaths} />
  if (goalsUnreadable) return <GoalsDataUnreadable onReset={resetGoals} />
  if (actionsUnreadable) return <ActionsDataUnreadable onReset={resetActions} />

  const rowCallbacks: ActionRowCallbacks = {
    onToggleDone: (action, done) => {
      if (done) {
        completeAction(action.id)
        showToast(`“${action.name}” done`)
      } else {
        uncompleteAction(action.id)
      }
    },
    onScheduleToday: (action) => {
      // The view's most frequent action: one click puts the row on today,
      // with an Undo restoring whatever day (or none) it had before.
      const previous = action.scheduledDate
      scheduleAction(action.id, todayLocalIso())
      showToast(`“${action.name}” added to today`, {
        label: 'Undo',
        onClick: () =>
          previous ? scheduleAction(action.id, previous) : unscheduleAction(action.id),
      })
    },
    onSchedule: (action) => setSchedule({ action }),
    onUnschedule: (action) => {
      const previous = action.scheduledDate
      unscheduleAction(action.id)
      showToast(`“${action.name}” unscheduled`, {
        label: 'Undo',
        onClick: () => previous && scheduleAction(action.id, previous),
      })
    },
    onRename: (action) => setRename({ action, name: action.name }),
    onToggleFrog: (action) => toggleActionFrog(action.id),
    onDelete: (action) => setDeleting({ action }),
  }

  // An assigned Action can end up pointing at a Goal that no longer exists
  // (hand-edited storage, or a pre-cascade snapshot restored by Undo). Rather
  // than silently drop it, surface it in a dimmed fallback group under the
  // Inbox — `useActions`' self-heal still runs underneath for Path orphans.
  const orphaned = actions.filter(
    (a) => a.state !== 'inbox' && a.goalId && !goals.some((g) => g.id === a.goalId),
  )
  // Orphans obey "Show completed" like every other group (edgecases #3), and
  // render as full actionable rows — an inert list would be a dead-end (edgecases #2).
  const orphanedVisible = [...orphaned]
    .filter((a) => (showCompleted ? true : !isSettled(a)))
    .sort(compareActionsForList)

  const toggleExpanded = (goalId: string, next: boolean) =>
    setExpandedOverrides((prev) => ({ ...prev, [goalId]: next }))

  const renderGoalGroup = (goalId: string, depth: number) => {
    const goal = goals.find((g) => g.id === goalId)
    if (!goal) return null
    // An inactive child renders only while it still holds open work — same
    // rule as top-level Goals (GoalGroup also self-checks, this trims the tree).
    const children = childGoals(goal.id).filter(
      (g) => g.state === 'active' || actions.some((a) => a.goalId === g.id && !isSettled(a)),
    )
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
        renderChild={(child, childDepth) => renderGoalGroup(child.id, childDepth)}
        expandedOverride={expandedOverrides[goal.id]}
        onToggleExpanded={toggleExpanded}
      />
    )
  }

  return (
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
        activePaths.map((path) => {
          const topLevel = topLevelGoals(path.id).filter(
            (g) => g.state === 'active' || actions.some((a) => a.goalId === g.id && !isSettled(a)),
          )
          return (
            <PathSection
              key={path.id}
              path={path}
              topLevelGoals={topLevel}
              standaloneActions={actions.filter((a) => a.pathId === path.id && !a.goalId && a.state !== 'inbox')}
              showCompleted={showCompleted}
              rowCallbacks={rowCallbacks}
              onQuickAddStandalone={(name, scheduledDate) =>
                createAction({ name, pathId: path.id, scheduledDate })
              }
              onNewGoal={() => setNewGoal({ pathId: path.id, pathName: path.name })}
              renderGoalGroup={(goal, depth) => renderGoalGroup(goal.id, depth)}
            />
          )
        })
      )}

      {schedule && (
        <ScheduleActionDialog
          open
          onOpenChange={(open) => !open && setSchedule(null)}
          actionName={schedule.action.name}
          initialDate={schedule.action.scheduledDate}
          title={`Schedule “${schedule.action.name}”`}
          description="Pick the day it should show up on in Today."
          submitLabel="Schedule"
          onSchedule={(date) => {
            // Symmetric safety with Unschedule: an Undo restores whatever the
            // row had before, including "nothing scheduled" (edgecases #5).
            const previous = schedule.action.scheduledDate
            scheduleAction(schedule.action.id, date)
            showToast(`“${schedule.action.name}” scheduled`, {
              label: 'Undo',
              onClick: () =>
                previous ? scheduleAction(schedule.action.id, previous) : unscheduleAction(schedule.action.id),
            })
          }}
        />
      )}

      {rename && (
        <Dialog open onOpenChange={(open) => !open && setRename(null)}>
          <DialogContent>
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault()
                renameAction(rename.action.id, rename.name)
                setRename(null)
              }}
            >
              <DialogHeader>
                <DialogTitle>Rename “{rename.action.name}”</DialogTitle>
                <DialogDescription>Pick a clearer name for this action.</DialogDescription>
              </DialogHeader>
              <Input
                value={rename.name}
                onChange={(e) => setRename({ ...rename, name: e.target.value })}
                aria-label="Action name"
                // eslint-disable-next-line jsx-a11y/no-autofocus -- dialog opens directly onto its one field
                autoFocus
              />
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setRename(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!rename.name.trim()}>
                  Rename
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {deleting && (
        <AlertDialog open onOpenChange={(open) => !open && setDeleting(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete “{deleting.action.name}”?</AlertDialogTitle>
              <AlertDialogDescription>
                This permanently removes the Action. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogClose render={<Button variant="ghost">Cancel</Button>} />
              <AlertDialogClose
                render={
                  <Button
                    variant="destructive"
                    onClick={() => {
                      const name = deleting.action.name
                      deleteAction(deleting.action.id)
                      showToast(`“${name}” deleted`)
                    }}
                  >
                    Delete
                  </Button>
                }
              />
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

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
  )
}
