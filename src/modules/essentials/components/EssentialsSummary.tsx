import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { useActions } from '@/modules/capture-triage/hooks/use-actions'
import { useEssentials } from '../hooks/use-essentials'

/**
 * Embedded on the Path overview between **Wins** and **Goals** (ADR 0051) — a
 * read-only count of the Path's Essentials and how many completions have been
 * logged for them. `essentials`-owned, mirroring how `winlog` owns `WinBalance`
 * and `vision` owns `VisionSummaryCard`. Data-unreadable recovery is the
 * overview's job — this assumes readable `essentials` / `actions`.
 */
export function EssentialsSummary({ pathId }: { pathId: string }) {
  const { essentialCountForPath } = useEssentials()
  const { essentialCompletionCountsForPath } = useActions()

  const count = essentialCountForPath(pathId)
  const { total, today } = essentialCompletionCountsForPath(pathId)

  return (
    <section aria-labelledby="essentials-heading" className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 id="essentials-heading" className="text-sm font-semibold">
          Essentials
        </h2>
        <Link
          to={`/paths/${pathId}/essentials`}
          className={buttonVariants({ variant: 'ghost', size: 'sm' })}
        >
          {count === 0 ? 'Set them up' : 'Open Essentials'} <ArrowRight aria-hidden="true" />
        </Link>
      </div>

      {count === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-card p-3 text-sm text-muted-foreground">
          Define this Path’s necessary deeds — the few things you must keep doing, logged each time
          you do them.
        </p>
      ) : (
        <div className="rounded-lg border border-border bg-card p-3">
          <p className="text-sm tabular-nums">
            <span className="font-medium">{count}</span>{' '}
            <span className="text-muted-foreground">
              {count === 1 ? 'essential' : 'essentials'}
            </span>
            <span className="text-muted-foreground"> · </span>
            <span className="font-medium">{total}</span>{' '}
            <span className="text-muted-foreground">completed all-time</span>
            {today > 0 && (
              <>
                <span className="text-muted-foreground"> · </span>
                <span className="font-medium">{today}</span>{' '}
                <span className="text-muted-foreground">today</span>
              </>
            )}
          </p>
        </div>
      )}
    </section>
  )
}
