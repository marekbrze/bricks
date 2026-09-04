import { Flame, MoreVertical, CalendarClock, CalendarPlus, CalendarX, Pencil, Star, StarOff, RotateCcw } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { Action } from '@/modules/capture-triage/types/action'
import { scheduledDateChip } from '../lib/group-actions'
import { todayLocalIso } from '@/shared/lib/date'

/**
 * One Action row in the Actions view: checkbox, name, frog flame, due-date
 * chip, one-click "add to today" (the view's most frequent action — hover-
 * revealed on desktop, always visible on touch), overflow menu. `done` rows
 * render struck-through and offer only Un-complete; `abandoned` rows render
 * dimmed with an "abandoned" tag and offer reschedule (which returns them to
 * `assigned` via `scheduleAction`) and rename. Delete stays owned by Review
 * abandoned — this view never destroys.
 */
export function ActionRowItem({
  action,
  onToggleDone,
  onScheduleToday,
  onSchedule,
  onUnschedule,
  onRename,
  onToggleFrog,
}: {
  action: Action
  onToggleDone: (done: boolean) => void
  onScheduleToday: () => void
  onSchedule: () => void
  onUnschedule: () => void
  onRename: () => void
  onToggleFrog: () => void
}) {
  const done = action.state === 'done'
  const abandoned = action.state === 'abandoned'
  const chip = action.scheduledDate ? scheduledDateChip(action.scheduledDate) : null

  return (
    <li
      className={cn(
        'group flex items-center gap-3 rounded-lg border border-border bg-background p-2',
        abandoned && 'opacity-60',
      )}
    >
      <Checkbox
        checked={done}
        disabled={abandoned}
        onCheckedChange={(value) => onToggleDone(Boolean(value))}
        aria-label={done ? `Mark “${action.name}” not done` : `Mark “${action.name}” done`}
      />
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            'block text-sm break-words',
            (done || abandoned) && 'text-muted-foreground line-through',
          )}
        >
          {action.name}
        </span>
        {abandoned && <span className="block text-xs text-muted-foreground">abandoned</span>}
      </span>
      {action.frog && !done && (
        <span aria-label="Frog" className="inline-flex shrink-0">
          <Flame className="size-4 text-destructive" aria-hidden="true" />
        </span>
      )}
      {/* A stale date chip on an abandoned row is noise — the "abandoned" tag says enough. (edgecases #4) */}
      {chip && !done && !abandoned && (
        <span
          className={cn(
            'shrink-0 rounded-full px-2 py-0.5 text-xs',
            chip.overdue
              ? 'bg-destructive/10 text-destructive'
              : 'bg-muted text-muted-foreground',
          )}
        >
          {chip.label}
        </span>
      )}
      {/* One-click "add to today" — the most frequent action in this view, so
          it gets a dedicated button per row. Hidden when the row is already
          on today (the Today chip is its own confirmation) or done. Touch
          devices have no hover, so it stays visible there; on desktop it
          reveals on row hover or keyboard focus. */}
      {!done && action.scheduledDate !== todayLocalIso() && (
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Add “${action.name}” to today`}
          title="Add to today"
          onClick={onScheduleToday}
          className="shrink-0 text-muted-foreground opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100 aria-[expanded=true]:opacity-100"
        >
          <CalendarPlus aria-hidden="true" />
        </Button>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${action.name}`}>
              <MoreVertical aria-hidden="true" />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          {done ? (
            <DropdownMenuItem onClick={() => onToggleDone(false)}>
              <RotateCcw aria-hidden="true" /> Un-complete
            </DropdownMenuItem>
          ) : (
            <>
              <DropdownMenuItem onClick={onSchedule}>
                <CalendarClock aria-hidden="true" /> {action.scheduledDate ? 'Reschedule…' : 'Schedule…'}
              </DropdownMenuItem>
              {action.scheduledDate && (
                <DropdownMenuItem onClick={onUnschedule}>
                  <CalendarX aria-hidden="true" /> Unschedule
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={onRename}>
                <Pencil aria-hidden="true" /> Rename
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onToggleFrog}>
                {action.frog ? (
                  <>
                    <StarOff aria-hidden="true" /> Remove frog
                  </>
                ) : (
                  <>
                    <Star aria-hidden="true" /> Mark as frog
                  </>
                )}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  )
}
