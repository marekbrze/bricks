import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { todayLocalIso } from '@/shared/lib/date'

/**
 * Picks a date for one Action — reused for three flows that all boil down
 * to "set `scheduledDate`": moving an already-scheduled Action to another
 * day, and rescheduling an abandoned Action back onto a day from Review
 * abandoned. (Pulling an *unscheduled* Action onto the currently-viewed day
 * needs no date picker at all — see `AddToTodayDialog`.)
 */
export function ScheduleActionDialog({
  open,
  onOpenChange,
  actionName,
  initialDate,
  submitLabel = 'Move',
  onSchedule,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  actionName: string
  initialDate?: string | null
  submitLabel?: string
  onSchedule: (dateIso: string) => void
}) {
  const [date, setDate] = useState(initialDate || todayLocalIso())

  useEffect(() => {
    if (open) setDate(initialDate || todayLocalIso())
  }, [open, initialDate])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!date) return
    onSchedule(date)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Move “{actionName}”</DialogTitle>
            <DialogDescription>Pick the day it should show up on instead.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="schedule-date">Date</Label>
            <Input
              id="schedule-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-fit"
              // eslint-disable-next-line jsx-a11y/no-autofocus -- dialog opens directly onto its one field
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!date}>
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
