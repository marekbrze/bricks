import { MoreVertical, CalendarClock, CalendarX, Ban } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

export function ActionOverflowMenu({
  actionName,
  done,
  onMove,
  onUnschedule,
  onAbandon,
}: {
  actionName: string
  /**
   * A completed Action can still be moved to another day (it stays a
   * visible win somewhere), but not unscheduled outright — that would pull
   * a finished Action out of every day view with no day left to show it
   * on, working against "the day stays visible as a record of what got
   * done". Abandoning a done Action doesn't make sense either — un-complete
   * it first. See docs/modules/today-edgecases.md #5.
   */
  done: boolean
  onMove: () => void
  onUnschedule: () => void
  onAbandon: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${actionName}`}>
            <MoreVertical aria-hidden="true" />
          </Button>
        }
      />
      <DropdownMenuContent>
        <DropdownMenuItem onClick={onMove}>
          <CalendarClock aria-hidden="true" /> Move to another day
        </DropdownMenuItem>
        {!done && (
          <DropdownMenuItem onClick={onUnschedule}>
            <CalendarX aria-hidden="true" /> Unschedule
          </DropdownMenuItem>
        )}
        {!done && (
          <DropdownMenuItem variant="destructive" onClick={onAbandon}>
            <Ban aria-hidden="true" /> Abandon
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
