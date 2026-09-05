import { Flame, MoreVertical, CalendarClock, CalendarPlus, CalendarX, FolderInput, GripVertical, Pencil, Star, StarOff, RotateCcw, Trash2 } from 'lucide-react'
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
import { useActionDragSource } from './action-dnd'

/**
 * One Action row in the Actions view: checkbox, name, frog flame, due-date
 * chip, one-click "add to today" (the view's most frequent action — hover-
 * revealed on desktop, always visible on touch), overflow menu. `done` rows
 * render struck-through and offer only Un-complete (plus Delete); `abandoned`
 * rows render dimmed with an "abandoned" tag and offer reschedule (which
 * returns them to `assigned` via `scheduleAction`), rename, and delete. Delete
 * always opens a confirm dialog (owned by the page) — it's permanent.
 *
 * Inside an `ActionDndProvider` the row also becomes a drag source: grab it
 * (a grip appears) and drop it on another Goal group or a Path's Standalone
 * block to re-file it. The keyboard-accessible twin is the menu's "Move to…",
 * which is why `onMoveTo` and the drag affordance appear together.
 */
export function ActionRowItem({
  action,
  onToggleDone,
  onScheduleToday,
  onSchedule,
  onUnschedule,
  onRename,
  onToggleFrog,
  onMoveTo,
  onDelete,
}: {
  action: Action
  onToggleDone: (done: boolean) => void
  onScheduleToday: () => void
  onSchedule: () => void
  onUnschedule: () => void
  onRename: () => void
  onToggleFrog: () => void
  /** Opens the move picker. Omitted where re-filing isn't offered (e.g. the Path overview's standalone list). */
  onMoveTo?: () => void
  onDelete: () => void
}) {
  const done = action.state === 'done'
  const abandoned = action.state === 'abandoned'
  const chip = action.scheduledDate ? scheduledDateChip(action.scheduledDate) : null
  const { draggable, isDragging, dragProps } = useActionDragSource(action)

  return (
    // Pointer drag to re-file the row; the keyboard-accessible path is the
    // overflow menu's "Move to…".
    <li
      draggable={draggable}
      {...dragProps}
      className={cn(
        'group flex items-center gap-3 rounded-lg border border-border bg-background p-2',
        abandoned && 'opacity-60',
        isDragging && 'opacity-50',
      )}
    >
      {draggable && (
        <GripVertical
          className="-ml-1 size-4 shrink-0 cursor-grab text-muted-foreground active:cursor-grabbing"
          aria-hidden="true"
        />
      )}
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
            <>
              <DropdownMenuItem onClick={() => onToggleDone(false)}>
                <RotateCcw aria-hidden="true" /> Un-complete
              </DropdownMenuItem>
              {onMoveTo && (
                <DropdownMenuItem onClick={onMoveTo}>
                  <FolderInput aria-hidden="true" /> Move to…
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={onDelete}>
                <Trash2 aria-hidden="true" /> Delete
              </DropdownMenuItem>
            </>
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
              {onMoveTo && (
                <DropdownMenuItem onClick={onMoveTo}>
                  <FolderInput aria-hidden="true" /> Move to…
                </DropdownMenuItem>
              )}
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
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={onDelete}>
                <Trash2 aria-hidden="true" /> Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  )
}
