import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CalendarRange } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { usePaths } from '@/modules/paths/hooks/use-paths'
import { PathsDataUnreadable } from '@/modules/paths/components/PathsDataUnreadable'
import { useActions } from '@/modules/capture-triage/hooks/use-actions'
import { ActionsDataUnreadable } from '@/modules/capture-triage/components/ActionsDataUnreadable'
import { useToast } from '@/shared/components/toast/toast-context'
import type { Action } from '@/modules/capture-triage/types/action'
import { formatDayLabel, todayLocalIso } from '@/shared/lib/date'
import { ActionRow } from './ActionRow'
import { ScheduleActionDialog } from './ScheduleActionDialog'

/**
 * Agenda: day header, that day's Actions across every Path, next day header,
 * its Actions — a wider look-ahead than the Path-sectioned single-day Today
 * view. Only days that actually have something scheduled show up; this is
 * not a full calendar.
 */
export function SchedulePage() {
  const [moving, setMoving] = useState<Action | null>(null)
  const { showToast } = useToast()

  const { getPath, dataUnreadable: pathsUnreadable, resetPaths } = usePaths()
  const {
    scheduledActionsForDate,
    upcomingScheduledDates,
    scheduleAction,
    unscheduleAction,
    completeAction,
    uncompleteAction,
    abandonAction,
    dataUnreadable: actionsUnreadable,
    resetActions,
  } = useActions()

  const dates = useMemo(() => upcomingScheduledDates(todayLocalIso()), [upcomingScheduledDates])

  if (pathsUnreadable) return <PathsDataUnreadable onReset={resetPaths} />
  if (actionsUnreadable) return <ActionsDataUnreadable onReset={resetActions} />

  const getPathName = (pathId: string | null) => (pathId ? (getPath(pathId)?.name ?? 'Unknown Path') : 'Standalone')

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link to="/today" className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'self-start' })}>
          <ArrowLeft aria-hidden="true" /> Today
        </Link>
        <h1 className="text-xl font-semibold">Schedule</h1>
      </div>

      {dates.length === 0 ? (
        <section className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <CalendarRange className="size-8 text-muted-foreground" aria-hidden="true" />
          <div className="max-w-sm">
            <h2 className="text-sm font-semibold">Nothing scheduled ahead</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Schedule an Action from Today or from a Goal to see it show up here.
            </p>
          </div>
        </section>
      ) : (
        <div className="flex flex-col gap-6">
          {dates.map((date) => (
            <section key={date} className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold">{formatDayLabel(date)}</h2>
              <ul className="flex flex-col gap-1.5">
                {scheduledActionsForDate(date).map((a) => (
                  <ActionRow
                    key={a.id}
                    action={a}
                    pathName={getPathName(a.pathId)}
                    onToggleDone={(done) => {
                      if (done) {
                        completeAction(a.id)
                        showToast(`“${a.name}” done`)
                      } else {
                        uncompleteAction(a.id)
                      }
                    }}
                    onMove={() => setMoving(a)}
                    onUnschedule={() => {
                      unscheduleAction(a.id)
                      showToast(`“${a.name}” unscheduled`, {
                        label: 'Undo',
                        onClick: () => scheduleAction(a.id, date),
                      })
                    }}
                    onAbandon={() => {
                      const undo = abandonAction(a.id)
                      showToast(`“${a.name}” abandoned`, { label: 'Undo', onClick: undo })
                    }}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {moving && (
        <ScheduleActionDialog
          open
          onOpenChange={(o) => !o && setMoving(null)}
          actionName={moving.name}
          initialDate={moving.scheduledDate}
          onSchedule={(newDate) => {
            scheduleAction(moving.id, newDate)
            showToast(`“${moving.name}” moved to ${formatDayLabel(newDate).toLowerCase()}`)
          }}
        />
      )}
    </div>
  )
}
