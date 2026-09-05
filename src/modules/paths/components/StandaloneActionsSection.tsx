import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
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
import { useToast } from '@/shared/components/toast/toast-context'
import type { Action } from '@/modules/capture-triage/types/action'
import { todayLocalIso } from '@/shared/lib/date'
import { compareActionsForList, isSettled } from '@/modules/actions/lib/group-actions'
import { ActionRowItem } from '@/modules/actions/components/ActionRowItem'
import { QuickAddActionRow } from '@/modules/actions/components/QuickAddActionRow'
import { ScheduleActionDialog } from '@/modules/today/components/ScheduleActionDialog'

type ScheduleState = { action: Action } | null
type RenameState = { action: Action; name: string } | null
type DeleteState = { action: Action } | null

/**
 * The Path overview's missing piece: Actions assigned straight to this Path
 * with no Goal in between (`goalId === null`). The Actions view shows these
 * under a "Standalone" sub-header per Path, but until now the Path's own page
 * had no place to see or manage them — this section fills that gap with the
 * same row (schedule, complete, rename, delete, frog) and quick-add
 * affordances as the Actions view.
 */
export function StandaloneActionsSection({
  pathId,
  readOnly,
}: {
  pathId: string
  readOnly: boolean
}) {
  const [showCompleted, setShowCompleted] = useState(false)
  const [schedule, setSchedule] = useState<ScheduleState>(null)
  const [rename, setRename] = useState<RenameState>(null)
  const [deleting, setDeleting] = useState<DeleteState>(null)

  const { showToast } = useToast()
  const {
    actions,
    createAction,
    renameAction,
    toggleActionFrog,
    scheduleAction,
    unscheduleAction,
    completeAction,
    uncompleteAction,
    deleteAction,
  } = useActions()

  const standalone = actions.filter((a) => a.pathId === pathId && !a.goalId && a.state !== 'inbox')
  const visible = [...standalone]
    .filter((a) => (showCompleted ? true : !isSettled(a)))
    .sort(compareActionsForList)

  return (
    <section aria-labelledby="standalone-actions-heading" className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="standalone-actions-heading" className="text-sm font-semibold">
          Actions without a goal
        </h2>
        {standalone.some(isSettled) && (
          <div className="flex items-center gap-2">
            <Checkbox
              id="standalone-show-completed"
              checked={showCompleted}
              onCheckedChange={(v) => setShowCompleted(Boolean(v))}
            />
            <Label htmlFor="standalone-show-completed" className="text-xs text-muted-foreground">
              Show completed
            </Label>
          </div>
        )}
      </div>

      {standalone.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {readOnly
            ? 'No Actions were assigned directly to this Path.'
            : 'Actions assigned straight to this Path — not under any Goal — show up here.'}
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {visible.map((a) => (
            <ActionRowItem
              key={a.id}
              action={a}
              onToggleDone={(done) => {
                if (done) {
                  completeAction(a.id)
                  showToast(`“${a.name}” done`)
                } else {
                  uncompleteAction(a.id)
                }
              }}
              onScheduleToday={() => {
                const previous = a.scheduledDate
                scheduleAction(a.id, todayLocalIso())
                showToast(`“${a.name}” added to today`, {
                  label: 'Undo',
                  onClick: () => (previous ? scheduleAction(a.id, previous) : unscheduleAction(a.id)),
                })
              }}
              onSchedule={() => setSchedule({ action: a })}
              onUnschedule={() => {
                const previous = a.scheduledDate
                unscheduleAction(a.id)
                showToast(`“${a.name}” unscheduled`, {
                  label: 'Undo',
                  onClick: () => previous && scheduleAction(a.id, previous),
                })
              }}
              onRename={() => setRename({ action: a, name: a.name })}
              onToggleFrog={() => toggleActionFrog(a.id)}
              onDelete={() => setDeleting({ action: a })}
            />
          ))}
          {visible.length === 0 && standalone.length > 0 && (
            <li className="px-2 py-1 text-xs text-muted-foreground" aria-live="polite">
              All clear
            </li>
          )}
        </ul>
      )}

      {!readOnly && (
        <QuickAddActionRow
          label="Add an action without a goal"
          onCreate={(name, scheduledDate) => createAction({ name, pathId, scheduledDate })}
        />
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
    </section>
  )
}
