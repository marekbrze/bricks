import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, CalendarDays, History, Signpost } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { usePaths } from '@/modules/paths/hooks/use-paths'
import { PathsDataUnreadable } from '@/modules/paths/components/PathsDataUnreadable'
import { useActions } from '@/modules/capture-triage/hooks/use-actions'
import { ActionsDataUnreadable } from '@/modules/capture-triage/components/ActionsDataUnreadable'
import { useToast } from '@/shared/components/toast/toast-context'
import type { Action } from '@/modules/capture-triage/types/action'
import { addDaysIso, formatDayLabel, isValidIso, todayLocalIso } from '@/shared/lib/date'
import { PathSection } from './PathSection'
import { AddToTodayDialog } from './AddToTodayDialog'
import { OverdueSection } from './OverdueSection'
import { ScheduleActionDialog } from './ScheduleActionDialog'

type DialogState = { type: 'add'; pathId: string | null } | { type: 'move'; action: Action } | null

export function TodayPage() {
  // The viewed day lives in the URL (`/today/:date`) so a refresh, or
  // sharing/bookmarking the link, keeps day-nav position instead of always
  // snapping back to today. An invalid or malformed `:date` (hand-edited
  // URL) falls back to today rather than erroring. See
  // docs/modules/today-edgecases.md #2.
  const params = useParams<{ date?: string }>()
  const navigate = useNavigate()
  const date = isValidIso(params.date) ? params.date : todayLocalIso()
  const goToDate = (next: string) =>
    navigate(next === todayLocalIso() ? '/today' : `/today/${next}`, { replace: true })

  // A hand-edited / stale `:date` that isn't a real calendar date still renders
  // today's content (above), but the bad URL lingers in the address bar and a
  // refresh just re-runs the fallback — canonicalise it to `/today`. See
  // docs/modules/today-edgecases.md #18.
  useEffect(() => {
    if (params.date !== undefined && !isValidIso(params.date)) {
      navigate('/today', { replace: true })
    }
  }, [params.date, navigate])

  const [dialog, setDialog] = useState<DialogState>(null)
  const { showToast } = useToast()

  const { activePaths, getPath, dataUnreadable: pathsUnreadable, resetPaths } = usePaths()
  const {
    scheduledActionsForDate,
    unscheduledActions,
    overdueActions,
    rescheduleOverdueToday,
    abandonedActions,
    scheduleAction,
    unscheduleAction,
    completeAction,
    completeOverdueAction,
    uncompleteAction,
    abandonAction,
    dataUnreadable: actionsUnreadable,
    resetActions,
  } = useActions()

  // Only Actions on a still-active Path belong in the day view. An archived
  // Path's Actions have a valid `pathId` (archiving isn't deleting, so the
  // self-heal leaves them alone) but no section to render in — without this
  // filter a today-dated one silently blocks the empty state, and an overdue
  // one leaks into the Overdue bucket + "Move all to today". See
  // docs/modules/today-edgecases.md #13.
  const activePathIds = useMemo(() => new Set(activePaths.map((p) => p.id)), [activePaths])

  const dayActions = useMemo(
    () => scheduledActionsForDate(date).filter((a) => a.pathId != null && activePathIds.has(a.pathId)),
    [scheduledActionsForDate, date, activePathIds],
  )
  const visibleOverdue = useMemo(
    () => overdueActions.filter((a) => a.pathId != null && activePathIds.has(a.pathId)),
    [overdueActions, activePathIds],
  )
  const isToday = date === todayLocalIso()
  const showOverdue = isToday && visibleOverdue.length > 0

  if (pathsUnreadable) return <PathsDataUnreadable onReset={resetPaths} />
  if (actionsUnreadable) return <ActionsDataUnreadable onReset={resetActions} />

  const handleToggleDone = (action: Action, done: boolean) => {
    if (done) {
      completeAction(action.id)
      showToast(`“${action.name}” done`)
    } else {
      uncompleteAction(action.id)
    }
  }

  // Completing straight from the Overdue bucket also pulls the Action onto
  // today, so a finished overdue row shows as a win in today's list rather
  // than vanishing (past-dated + done = in no day view). See
  // docs/modules/today-edgecases.md #21.
  const handleToggleDoneOverdue = (action: Action, done: boolean) => {
    if (done) {
      completeOverdueAction(action.id)
      showToast(`“${action.name}” done`)
    } else {
      uncompleteAction(action.id)
    }
  }

  const handleUnschedule = (action: Action) => {
    unscheduleAction(action.id)
    showToast(`“${action.name}” unscheduled`, { label: 'Undo', onClick: () => scheduleAction(action.id, date) })
  }

  const handleAbandon = (action: Action) => {
    const undo = abandonAction(action.id)
    showToast(`“${action.name}” abandoned`, { label: 'Undo', onClick: undo })
  }

  const handleRescheduleOverdue = (action: Action, iso: string | null) => {
    const previous = action.scheduledDate
    if (iso) {
      scheduleAction(action.id, iso)
      showToast(`“${action.name}” moved to ${formatDayLabel(iso).toLowerCase()}`, {
        label: 'Undo',
        onClick: () => previous && scheduleAction(action.id, previous),
      })
    } else {
      unscheduleAction(action.id)
      showToast(`“${action.name}” unscheduled`, {
        label: 'Undo',
        onClick: () => previous && scheduleAction(action.id, previous),
      })
    }
  }

  const handleMoveAllOverdue = () => {
    const count = visibleOverdue.length
    const undo = rescheduleOverdueToday()
    showToast(`${count} ${count === 1 ? 'Action' : 'Actions'} moved to today`, {
      label: 'Undo',
      onClick: undo,
    })
  }

  const getPathName = (pathId: string | null) => (pathId ? (getPath(pathId)?.name ?? 'Unknown Path') : 'Standalone')

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Previous day"
              onClick={() => goToDate(addDaysIso(date, -1))}
            >
              <ChevronLeft aria-hidden="true" />
            </Button>
            <h1 className="min-w-32 px-1 text-center text-xl font-semibold whitespace-nowrap">
              {formatDayLabel(date)}
            </h1>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Next day"
              onClick={() => goToDate(addDaysIso(date, 1))}
            >
              <ChevronRight aria-hidden="true" />
            </Button>
            {date !== todayLocalIso() && (
              <Button variant="outline" size="sm" onClick={() => goToDate(todayLocalIso())}>
                Today
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link to="/today/abandoned" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
              <History aria-hidden="true" /> Review abandoned
              {abandonedActions.length > 0 && (
                <span className="ml-1 rounded-full bg-muted px-1.5 text-xs tabular-nums">
                  {abandonedActions.length}
                </span>
              )}
            </Link>
            <Link to="/today/schedule" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              <CalendarDays aria-hidden="true" /> Schedule view
            </Link>
          </div>
        </div>
      </div>

      {showOverdue && (
        <OverdueSection
          actions={visibleOverdue}
          getPathName={getPathName}
          onToggleDone={handleToggleDoneOverdue}
          onReschedule={handleRescheduleOverdue}
          onAbandon={handleAbandon}
          onMoveAllToToday={handleMoveAllOverdue}
        />
      )}

      {activePaths.length === 0 ? (
        <section className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card py-16 text-center">
          <Signpost className="size-8 text-muted-foreground" aria-hidden="true" />
          <div className="max-w-sm">
            <h2 className="text-sm font-semibold">No Paths yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Today groups your scheduled Actions by Path. Create a Path first to give the day
              something to organize around.
            </p>
          </div>
          <Link to="/paths" className={buttonVariants()}>
            Go to Paths
          </Link>
        </section>
      ) : dayActions.length === 0 && showOverdue ? (
        // The day isn't really empty — the Overdue section above needs
        // attention. One quiet line instead of a second full-height empty
        // state contradicting it. See docs/modules/today-edgecases.md #14.
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-dashed border-border bg-card px-3 py-2.5 text-sm text-muted-foreground">
          <span>Nothing new scheduled — clear the overdue list above, or add something.</span>
          <Button variant="outline" size="sm" onClick={() => setDialog({ type: 'add', pathId: null })}>
            Add to this day
          </Button>
        </div>
      ) : dayActions.length === 0 ? (
        <section className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card py-16 text-center">
          <CalendarDays className="size-8 text-muted-foreground" aria-hidden="true" />
          <div className="max-w-sm">
            <h2 className="text-sm font-semibold">Nothing scheduled for {formatDayLabel(date).toLowerCase()}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Pull something in from what's already assigned, or head to a Path to plan ahead.
            </p>
          </div>
          <Button onClick={() => setDialog({ type: 'add', pathId: null })}>Add to this day</Button>
        </section>
      ) : (
        <div className="flex flex-col gap-6">
          {activePaths.map((path) => (
            <PathSection
              key={path.id}
              path={path}
              actions={dayActions.filter((a) => a.pathId === path.id)}
              onAdd={() => setDialog({ type: 'add', pathId: path.id })}
              onToggleDone={handleToggleDone}
              onMove={(action) => setDialog({ type: 'move', action })}
              onUnschedule={handleUnschedule}
              onAbandon={handleAbandon}
            />
          ))}
        </div>
      )}

      {dialog?.type === 'add' && (
        <AddToTodayDialog
          open
          onOpenChange={(o) => !o && setDialog(null)}
          dateIso={date}
          actions={dialog.pathId ? unscheduledActions.filter((a) => a.pathId === dialog.pathId) : unscheduledActions}
          pathName={dialog.pathId ? getPathName(dialog.pathId) : undefined}
          totalUnscheduledCount={unscheduledActions.length}
          getPathName={getPathName}
          onPick={(action) => {
            scheduleAction(action.id, date)
            showToast(`“${action.name}” added to ${formatDayLabel(date).toLowerCase()}`, {
              label: 'Undo',
              onClick: () => unscheduleAction(action.id),
            })
            setDialog(null)
          }}
        />
      )}

      {dialog?.type === 'move' && (
        <ScheduleActionDialog
          open
          onOpenChange={(o) => !o && setDialog(null)}
          actionName={dialog.action.name}
          initialDate={date}
          onSchedule={(newDate) => {
            scheduleAction(dialog.action.id, newDate)
            showToast(`“${dialog.action.name}” moved to ${formatDayLabel(newDate).toLowerCase()}`)
          }}
          onClear={() => {
            const { id, name } = dialog.action
            unscheduleAction(id)
            showToast(`“${name}” unscheduled`, { label: 'Undo', onClick: () => scheduleAction(id, date) })
          }}
        />
      )}
    </div>
  )
}
