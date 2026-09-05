import { useCallback, useState } from 'react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
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
import { useActions } from '@/modules/capture-triage/hooks/use-actions'
import { useGoals } from '@/modules/goals/hooks/use-goals'
import { usePaths } from '@/modules/paths/hooks/use-paths'
import { ScheduleActionDialog } from '@/modules/today/components/ScheduleActionDialog'
import { useToast } from '@/shared/components/toast/toast-context'
import type { Action } from '@/modules/capture-triage/types/action'
import { todayLocalIso } from '@/shared/lib/date'
import type { ActionRowCallbacks } from '../components/GoalGroup'
import type { ActionDropTarget } from '../components/action-dnd'
import { MoveActionDialog } from '../components/MoveActionDialog'

type ScheduleState = { action: Action } | null
type RenameState = { action: Action; name: string } | null
type MoveState = { action: Action } | null
type DeleteState = { action: Action } | null

/**
 * Everything an Action row can do, in one place: the callbacks a row needs
 * and the dialogs those callbacks open (schedule, rename, move, delete),
 * ready to render. The Actions view and a Path's Actions tab both mount it,
 * so the two screens behave identically without copying ~150 lines of dialog
 * wiring between them.
 *
 * `moveAction` is the same write the row menu's "Move to…" performs, exposed
 * separately so a page can hand it straight to `ActionDndProvider` — one
 * destination, one toast, whether the Owner dragged or used the keyboard.
 */
export function useActionRowActions(): {
  rowCallbacks: ActionRowCallbacks
  moveAction: (action: Action, target: ActionDropTarget) => void
  dialogs: ReactNode
} {
  const [schedule, setSchedule] = useState<ScheduleState>(null)
  const [rename, setRename] = useState<RenameState>(null)
  const [moving, setMoving] = useState<MoveState>(null)
  const [deleting, setDeleting] = useState<DeleteState>(null)

  const { showToast } = useToast()
  const { getPath } = usePaths()
  const { getGoal } = useGoals()
  const {
    renameAction,
    moveActionToGoal,
    toggleActionFrog,
    scheduleAction,
    unscheduleAction,
    completeAction,
    uncompleteAction,
    deleteAction,
  } = useActions()

  const moveAction = useCallback(
    (action: Action, target: ActionDropTarget) => {
      const undo = moveActionToGoal(action.id, target.pathId, target.goalId)
      // A no-op (dropped back where it started) stays silent — the toast is
      // also the screen-reader announcement, so it must describe a real change.
      if (!undo) return
      const destination = target.goalId
        ? `“${getGoal(target.goalId)?.name ?? 'Goal'}”`
        : `${getPath(target.pathId)?.name ?? 'Path'} (standalone)`
      showToast(`“${action.name}” moved to ${destination}`, { label: 'Undo', onClick: undo })
    },
    [moveActionToGoal, getGoal, getPath, showToast],
  )

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
    onMoveTo: (action) => setMoving({ action }),
    onDelete: (action) => setDeleting({ action }),
  }

  const dialogs = (
    <>
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
                previous
                  ? scheduleAction(schedule.action.id, previous)
                  : unscheduleAction(schedule.action.id),
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

      {moving && (
        <MoveActionDialog
          action={moving.action}
          onOpenChange={(open) => !open && setMoving(null)}
          onMove={(pathId, goalId) => moveAction(moving.action, { pathId, goalId })}
        />
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
    </>
  )

  return { rowCallbacks, moveAction, dialogs }
}
