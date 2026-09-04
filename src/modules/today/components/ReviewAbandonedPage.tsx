import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Ban, CalendarPlus, Flame, Trash2 } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogClose,
} from '@/components/ui/alert-dialog'
import { usePaths } from '@/modules/paths/hooks/use-paths'
import { PathsDataUnreadable } from '@/modules/paths/components/PathsDataUnreadable'
import { useActions } from '@/modules/capture-triage/hooks/use-actions'
import { ActionsDataUnreadable } from '@/modules/capture-triage/components/ActionsDataUnreadable'
import { useToast } from '@/shared/components/toast/toast-context'
import type { Action } from '@/modules/capture-triage/types/action'
import { formatDayLabel } from '@/shared/lib/date'
import { ScheduleActionDialog } from './ScheduleActionDialog'

/**
 * Abandoned Actions live outside the active day view so they don't clutter
 * the daily focus — they accumulate here until the Owner decides, per
 * Action, to reschedule it back onto a day or delete it for good.
 */
export function ReviewAbandonedPage() {
  const [rescheduling, setRescheduling] = useState<Action | null>(null)
  const [deleting, setDeleting] = useState<Action | null>(null)
  const { showToast } = useToast()

  const { getPath, dataUnreadable: pathsUnreadable, resetPaths } = usePaths()
  const {
    abandonedActions,
    scheduleAction,
    deleteAction,
    dataUnreadable: actionsUnreadable,
    resetActions,
  } = useActions()

  if (pathsUnreadable) return <PathsDataUnreadable onReset={resetPaths} />
  if (actionsUnreadable) return <ActionsDataUnreadable onReset={resetActions} />

  const getPathName = (pathId: string | null) => (pathId ? (getPath(pathId)?.name ?? 'Unknown Path') : 'Standalone')

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link to="/today" className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'self-start' })}>
          <ArrowLeft aria-hidden="true" /> Today
        </Link>
        <h1 className="text-xl font-semibold">Review abandoned</h1>
      </div>

      {abandonedActions.length === 0 ? (
        <section className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <Ban className="size-8 text-muted-foreground" aria-hidden="true" />
          <div className="max-w-sm">
            <h2 className="text-sm font-semibold">Nothing abandoned</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Actions you decide against for a scheduled day land here instead of just disappearing.
            </p>
          </div>
        </section>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {abandonedActions.map((a) => (
            <li
              key={a.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-background p-2"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium break-words">{a.name}</span>
                <span className="block text-xs text-muted-foreground">{getPathName(a.pathId)}</span>
              </span>
              {a.frog && (
                <span aria-label="Frog" className="inline-flex shrink-0">
                  <Flame className="size-4 text-destructive" aria-hidden="true" />
                </span>
              )}
              <Button variant="outline" size="sm" onClick={() => setRescheduling(a)}>
                <CalendarPlus aria-hidden="true" /> Reschedule
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Delete “${a.name}” for good`}
                onClick={() => setDeleting(a)}
              >
                <Trash2 aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {rescheduling && (
        <ScheduleActionDialog
          open
          onOpenChange={(o) => !o && setRescheduling(null)}
          actionName={rescheduling.name}
          submitLabel="Reschedule"
          onSchedule={(dateIso) => {
            scheduleAction(rescheduling.id, dateIso)
            showToast(`“${rescheduling.name}” rescheduled to ${formatDayLabel(dateIso).toLowerCase()}`)
          }}
        />
      )}

      {deleting && (
        <AlertDialog open onOpenChange={(o) => !o && setDeleting(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete “{deleting.name}” for good?</AlertDialogTitle>
              <AlertDialogDescription>
                This permanently removes the Action, including its history. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogClose render={<Button variant="ghost">Cancel</Button>} />
              <AlertDialogClose
                render={
                  <Button
                    variant="destructive"
                    onClick={() => {
                      const name = deleting.name
                      deleteAction(deleting.id)
                      showToast(`“${name}” deleted`)
                    }}
                  >
                    Delete for good
                  </Button>
                }
              />
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
