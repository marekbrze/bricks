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
  /** Completed Actions can still be moved/unscheduled, but abandoning a done Action doesn't make sense — un-complete it first. */
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
        <DropdownMenuItem onClick={onUnschedule}>
          <CalendarX aria-hidden="true" /> Unschedule
        </DropdownMenuItem>
        {!done && (
          <DropdownMenuItem variant="destructive" onClick={onAbandon}>
            <Ban aria-hidden="true" /> Abandon
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
