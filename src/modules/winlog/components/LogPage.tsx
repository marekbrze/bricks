import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Signpost, Trophy } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { PathsDataUnreadable } from '@/modules/paths/components/PathsDataUnreadable'
import { GoalsDataUnreadable } from '@/modules/goals/components/GoalsDataUnreadable'
import { ActionsDataUnreadable } from '@/modules/capture-triage/components/ActionsDataUnreadable'
import { formatDayLabel } from '@/shared/lib/date'
import { useWinLog } from '../hooks/use-win-log'
import { winKindCounts } from '../lib/win-counts'
import type { Win } from '../types/win'
import { WinBalance } from './WinBalance'
import { WinKindBadges } from './WinKindBadges'
import { PathFilterChips } from './PathFilterChips'
import { WinRow } from './WinRow'

/** Day groups shown before "Load more" — a page never splits a day (ADR 0039). */
const PAGE_DAYS = 14

interface DayGroup {
  date: string
  wins: Win[]
}

/** Group a newest-first Win list by calendar day, preserving the list's order. */
function groupByDay(wins: Win[]): DayGroup[] {
  const groups: DayGroup[] = []
  const indexByDate = new Map<string, number>()
  for (const win of wins) {
    const i = indexByDate.get(win.date)
    if (i === undefined) {
      indexByDate.set(win.date, groups.length)
      groups.push({ date: win.date, wins: [win] })
    } else {
      groups[i].wins.push(win)
    }
  }
  return groups
}

/**
 * The global Log — `winlog`'s dedicated page. Win balance (small/big) +
 * Path filter + the day-grouped history. See docs/modules/winlog.md →
 * "Open the Log (global)" and ADR 0039.
 */
export function LogPage() {
  const {
    wins,
    winsForPath,
    activePaths,
    archivedPaths,
    getPathName,
    getGoalName,
    isKnownPathId,
    pathsUnreadable,
    goalsUnreadable,
    actionsUnreadable,
    resetPaths,
    resetGoals,
    resetActions,
  } = useWinLog()

  // The Path filter lives in the URL (?path=<id>) rather than component
  // state, so refreshing or sharing/bookmarking a scoped view keeps it —
  // mirrors `today`'s `/today/:date`. An unknown/stale id (e.g. a Path
  // deleted since the link was made) falls back to "All Paths" rather than
  // erroring. See docs/modules/winlog-edgecases.md #3.
  const [searchParams, setSearchParams] = useSearchParams()
  const rawPathId = searchParams.get('path')
  const pathId = rawPathId && isKnownPathId(rawPathId) ? rawPathId : null

  const setPathId = (next: string | null) => {
    const params = new URLSearchParams(searchParams)
    if (next) params.set('path', next)
    else params.delete('path')
    setSearchParams(params, { replace: true })
  }

  const filterablePaths = useMemo(() => [...activePaths, ...archivedPaths], [activePaths, archivedPaths])

  const filteredWins = useMemo(() => winsForPath(pathId), [winsForPath, pathId])
  const balance = useMemo(() => winKindCounts(filteredWins), [filteredWins])
  const dayGroups = useMemo(() => groupByDay(filteredWins), [filteredWins])

  // Un-paginated history would already run to hundreds of days with a few
  // months of daily use — see docs/modules/winlog-edgecases.md #7. Paging by
  // days (not rows) keeps every visible day whole.
  const [visibleDays, setVisibleDays] = useState(PAGE_DAYS)
  useEffect(() => setVisibleDays(PAGE_DAYS), [pathId])
  const shownDays = dayGroups.slice(0, visibleDays)

  if (pathsUnreadable) return <PathsDataUnreadable onReset={resetPaths} />
  if (goalsUnreadable) return <GoalsDataUnreadable onReset={resetGoals} />
  if (actionsUnreadable) return <ActionsDataUnreadable onReset={resetActions} />

  // No Paths at all — neither "complete an Action" nor "achieve a Goal" is
  // reachable yet, so point at creating a first Path instead, matching
  // `today`'s own "No Paths at all" state. See docs/modules/winlog-edgecases.md #5.
  if (activePaths.length === 0 && archivedPaths.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-xl font-semibold">Log</h1>
        <section className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <Signpost className="size-8 text-muted-foreground" aria-hidden="true" />
          <div className="max-w-sm">
            <h2 className="text-sm font-semibold">No Paths yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Wins accumulate under a Path — create one first, then completing Actions or
              achieving Goals will start filling this page.
            </p>
          </div>
          <Link to="/paths" className={buttonVariants({ variant: 'default' })}>
            Go to Paths
          </Link>
        </section>
      </div>
    )
  }

  if (wins.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-xl font-semibold">Log</h1>
        <section className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <Trophy className="size-8 text-muted-foreground" aria-hidden="true" />
          <div className="max-w-sm">
            <h2 className="text-sm font-semibold">No wins yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Complete an Action in Today or close a Goal — every finished Action lands here as a
              small win, every achieved Goal as a big one.
            </p>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Log</h1>

      <PathFilterChips paths={filterablePaths} value={pathId} onChange={setPathId} />

      <WinBalance counts={balance} size="lg" />

      <section aria-labelledby="history-heading" className="flex flex-col gap-2">
        <h2 id="history-heading" className="text-sm font-semibold">
          History
        </h2>
        {dayGroups.length === 0 ? (
          <p className="text-sm text-muted-foreground">No wins on this Path yet.</p>
        ) : (
          <>
            <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
              {shownDays.map((day) => (
                <li key={day.date} className="flex flex-col">
                  <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/30 px-3 py-1.5">
                    <h3 className="text-xs font-medium">{formatDayLabel(day.date)}</h3>
                    <WinKindBadges counts={winKindCounts(day.wins)} />
                  </div>
                  <ul className="flex flex-col divide-y divide-border/60">
                    {day.wins.map((win) => (
                      <WinRow
                        key={win.id}
                        win={win}
                        pathName={getPathName(win.pathId)}
                        goalName={win.kind === 'action' && win.goalId ? getGoalName(win.goalId) : null}
                      />
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
            {visibleDays < dayGroups.length && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="self-start"
                onClick={() => setVisibleDays((d) => d + PAGE_DAYS)}
              >
                Load more ({dayGroups.length - visibleDays} more{' '}
                {dayGroups.length - visibleDays === 1 ? 'day' : 'days'})
              </Button>
            )}
          </>
        )}
      </section>
    </div>
  )
}
