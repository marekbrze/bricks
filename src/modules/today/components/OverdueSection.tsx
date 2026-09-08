import { AlertTriangle, CalendarClock, Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { Action } from '@/modules/capture-triage/types/action'
import { SchedulePopover } from '@/shared/components/SchedulePopover'
import { formatDayLabel } from '@/shared/lib/date'

/**
 * The Overdue bucket at the top of the Today view — Actions whose
 * `scheduledDate` slipped into the past. Todoist / TickTick pattern: one
 * "Move all to today" button, plus each row reschedulable on its own through
 * the shared SchedulePopover. Only rendered when the viewed day is today and
 * there is at least one overdue Action (TodayPage gates both).
 */
export function OverdueSection({
  actions,
  getPathName,
  onToggleDone,
  onReschedule,
  onMoveAllToToday,
}: {
  actions: Action[]
  getPathName: (pathId: string | null) => string
  onToggleDone: (action: Action, done: boolean) => void
  /** `iso` is a concrete day from the popover; `null` means "No date" → unschedule. */
  onReschedule: (action: Action, iso: string | null) => void
  onMoveAllToToday: () => void
}) {
  return (
    <section className="flex flex-col gap-2 rounded-xl border border-destructive/25 bg-destructive/5 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-destructive">
          <AlertTriangle className="size-4" aria-hidden="true" />
          Overdue
          <span className="rounded-full bg-destructive/10 px-1.5 text-xs tabular-nums">
            {actions.length}
          </span>
        </h2>
        <Button variant="outline" size="sm" onClick={onMoveAllToToday}>
          Move all to today
        </Button>
      </div>

      <ul className="flex flex-col gap-1.5">
        {actions.map((action) => {
          const done = action.state === 'done'
          return (
            <li
              key={action.id}
              className="group flex items-center gap-3 rounded-lg border border-border bg-card p-2"
            >
              <Checkbox
                checked={done}
                onCheckedChange={(value) => onToggleDone(action, Boolean(value))}
                aria-label={done ? `Mark “${action.name}” not done` : `Mark “${action.name}” done`}
              />
              <span className="min-w-0 flex-1">
                <span
                  className={cn('block text-sm break-words', done && 'text-muted-foreground line-through')}
                >
                  {action.name}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {getPathName(action.pathId)}
                </span>
              </span>
              {action.frog && !done && (
                <span aria-label="Frog" className="inline-flex shrink-0">
                  <Flame className="size-4 text-frog" aria-hidden="true" />
                </span>
              )}
              {action.scheduledDate && (
                <span className="shrink-0 rounded-full bg-destructive/10 px-2 py-0.5 text-xs text-destructive">
                  {formatDayLabel(action.scheduledDate)}
                </span>
              )}
              <SchedulePopover
                value={action.scheduledDate}
                onChange={(iso) => onReschedule(action, iso)}
                align="end"
                trigger={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Reschedule “${action.name}”`}
                    title="Reschedule"
                    className="shrink-0 text-muted-foreground"
                  >
                    <CalendarClock aria-hidden="true" />
                  </Button>
                }
              />
            </li>
          )
        })}
      </ul>
    </section>
  )
}
