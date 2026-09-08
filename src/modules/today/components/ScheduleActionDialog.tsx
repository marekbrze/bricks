import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { SchedulePopoverPanel } from '@/shared/components/SchedulePopover'

/**
 * Picks a date for one Action — reused for flows that all boil down
 * to "set `scheduledDate`": moving an already-scheduled Action to another
 * day, rescheduling an abandoned Action back onto a day from Review
 * abandoned, and scheduling from the Actions view's row menu. (Pulling an
 * *unscheduled* Action onto the currently-viewed day needs no date picker at
 * all — see `AddToTodayDialog`.) `title`/`description` let a caller match
 * its own flow's wording; the defaults read as the "move between days" flow.
 *
 * The picker itself is the shared `SchedulePopoverPanel` (quick rows + inline
 * calendar) in a dialog shell — one tap on a row or a day schedules and
 * closes, so there is no separate submit button. Choosing "No date" clears
 * the schedule when the caller passes `onClear`, otherwise it just closes.
 */
export function ScheduleActionDialog({
  open,
  onOpenChange,
  actionName,
  initialDate,
  title,
  description = 'Pick the day it should show up on instead.',
  onSchedule,
  onClear,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  actionName: string
  initialDate?: string | null
  title?: string
  description?: string
  onSchedule: (dateIso: string) => void
  /** Wire this to also allow "No date" (clear `scheduledDate`) from the dialog. */
  onClear?: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title ?? `Move “${actionName}”`}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <SchedulePopoverPanel
          value={initialDate}
          onSelect={(iso) => {
            if (iso) onSchedule(iso)
            else onClear?.()
            onOpenChange(false)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
