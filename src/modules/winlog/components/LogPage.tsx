import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Signpost, Trophy } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { PathsDataUnreadable } from '@/modules/paths/components/PathsDataUnreadable'
import { GoalsDataUnreadable } from '@/modules/goals/components/GoalsDataUnreadable'
import { ActionsDataUnreadable } from '@/modules/capture-triage/components/ActionsDataUnreadable'
import { useWinLog } from '../hooks/use-win-log'
import { ContributionGraph } from './ContributionGraph'
import { PathFilterChips } from './PathFilterChips'
import { WinRow } from './WinRow'

/** Rows shown before "Load more" — see docs/modules/winlog-edgecases.md #7. */
const PAGE_SIZE = 50

/**
 * The global Log — `winlog`'s dedicated page. Graph + Path filter + full
 * chronological history. See docs/modules/winlog.md → "Open the Log (global)".
 */
export function LogPage() {
  const {
    wins,
    winsForPath,
    winDaysGlobal,
    winDaysForPath,
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
  const winDays = pathId ? winDaysForPath(pathId) : winDaysGlobal
  const scopeLabel = pathId ? `${getPathName(pathId)} wins` : 'All wins'

  // Un-paginated history would already run to hundreds of rows with a few
  // months of daily use — see docs/modules/winlog-edgecases.md #7.
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  useEffect(() => setVisibleCount(PAGE_SIZE), [pathId])
  const visibleWins = filteredWins.slice(0, visibleCount)

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
              Complete an Action in Today or mark a Goal achieved — it’ll show up here, and start
              filling in the graph below.
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

      <section aria-labelledby="graph-heading" className="flex flex-col gap-2">
        <h2 id="graph-heading" className="text-sm font-semibold">
          Contribution graph
        </h2>
        <div className="rounded-lg border border-border p-3">
          <ContributionGraph winDays={winDays} weeks={52} label={scopeLabel} />
        </div>
      </section>

      <section aria-labelledby="history-heading" className="flex flex-col gap-2">
        <h2 id="history-heading" className="text-sm font-semibold">
          History
        </h2>
        {filteredWins.length === 0 ? (
          <p className="text-sm text-muted-foreground">No wins for this Path yet.</p>
        ) : (
          <>
            <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
              {visibleWins.map((win) => (
                <WinRow
                  key={win.id}
                  win={win}
                  pathName={getPathName(win.pathId)}
                  goalName={win.kind === 'action' && win.goalId ? getGoalName(win.goalId) : null}
                />
              ))}
            </ul>
            {visibleCount < filteredWins.length && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="self-start"
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              >
                Load more ({filteredWins.length - visibleCount} more)
              </Button>
            )}
          </>
        )}
      </section>
    </div>
  )
}
