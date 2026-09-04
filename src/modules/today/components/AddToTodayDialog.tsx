import { Link } from 'react-router-dom'
import { Inbox } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { buttonVariants } from '@/components/ui/button'
import type { Action } from '@/modules/capture-triage/types/action'
import { formatDayLabel } from '@/shared/lib/date'

/**
 * Pulls an already-triaged-but-unscheduled Action onto the day currently in
 * view. No date field — the date is implicit (whatever day the Owner opened
 * this from); moving an Action to a *different* day afterward is
 * `ScheduleActionDialog`.
 */
export function AddToTodayDialog({
  open,
  onOpenChange,
  dateIso,
  actions,
  getPathName,
  onPick,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  dateIso: string
  /** Assigned Actions with no `scheduledDate` yet. */
  actions: Action[]
  getPathName: (pathId: string | null) => string
  onPick: (action: Action) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to {formatDayLabel(dateIso)}</DialogTitle>
          <DialogDescription>Actions that are assigned but not yet scheduled.</DialogDescription>
        </DialogHeader>

        {actions.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <Inbox className="size-6 text-muted-foreground" aria-hidden="true" />
            <p className="max-w-xs text-sm text-muted-foreground">
              Nothing waiting to be scheduled. New ideas start in the Inbox and get triaged to a Goal
              or Path first.
            </p>
            <Link to="/capture-triage" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              Open Inbox
            </Link>
          </div>
        ) : (
          <ul className="flex max-h-80 flex-col gap-1 overflow-y-auto">
            {actions.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => onPick(a)}
                  className="flex w-full flex-col items-start gap-0.5 rounded-lg border border-border bg-background p-2 text-left outline-none hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <span className="text-sm font-medium break-words">{a.name}</span>
                  <span className="text-xs text-muted-foreground">{getPathName(a.pathId)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  )
}
