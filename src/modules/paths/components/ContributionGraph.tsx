import { useMemo } from 'react'
import { cn } from '@/lib/utils'

/**
 * Lightweight GitHub-style contribution grid. The real `ContributionGraph` is
 * owned by the `winlog` module — this is a stand-in so the `paths` prototype can
 * show accumulation on the Path card and overview. Emphasis is on "how much I've
 * already done", not percent-complete.
 */
export function ContributionGraph({
  winDays,
  weeks = 20,
  compact = false,
  label,
}: {
  winDays: Record<string, number>
  weeks?: number
  compact?: boolean
  label: string
}) {
  const columns = useMemo(() => {
    const today = new Date()
    // Walk back to the most recent Sunday so columns align to weeks.
    const end = new Date(today)
    end.setDate(today.getDate() - today.getDay() + 6)
    const cols: { iso: string; count: number; future: boolean }[][] = []
    for (let w = weeks - 1; w >= 0; w--) {
      const col: { iso: string; count: number; future: boolean }[] = []
      for (let d = 0; d < 7; d++) {
        const date = new Date(end)
        date.setDate(end.getDate() - w * 7 - (6 - d))
        const iso = date.toISOString().slice(0, 10)
        col.push({ iso, count: winDays[iso] ?? 0, future: date > today })
      }
      cols.push(col)
    }
    return cols
  }, [winDays, weeks])

  const total = useMemo(
    () => Object.values(winDays).reduce((s, n) => s + n, 0),
    [winDays],
  )

  const cell = compact ? 'h-2 w-2' : 'h-2.5 w-2.5'

  function tone(count: number, future: boolean): string {
    if (future) return 'bg-transparent'
    if (count === 0) return 'bg-muted'
    if (count === 1) return 'bg-primary/30'
    if (count === 2) return 'bg-primary/60'
    return 'bg-primary'
  }

  return (
    <figure className="flex flex-col gap-1.5">
      <div
        className="flex gap-[3px]"
        role="img"
        aria-label={`${label}: ${total} wins over the last ${weeks} weeks`}
      >
        {columns.map((col, ci) => (
          <div key={ci} className="flex flex-col gap-[3px]">
            {col.map((c) => (
              <span
                key={c.iso}
                className={cn('rounded-[2px]', cell, tone(c.count, c.future))}
              />
            ))}
          </div>
        ))}
      </div>
      {!compact && (
        <figcaption className="text-xs text-muted-foreground">
          {total} {total === 1 ? 'win' : 'wins'} in the last {weeks} weeks
        </figcaption>
      )}
    </figure>
  )
}
