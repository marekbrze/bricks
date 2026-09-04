import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { formatDayLabel } from '@/shared/lib/date'

/** Local calendar date (YYYY-MM-DD), matching how win days are keyed in `useWinLog`. */
function localIso(date: Date): string {
  const offsetMs = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 10)
}

/**
 * GitHub-style contribution grid — the visual core of the `winlog` module.
 * Fed a {date -> win count} map (global, per-Path, or per-Goal, all from
 * `useWinLog`) and renders one column per week, one cell per day. Emphasis
 * is on "how much I've already done", not percent-complete — see
 * docs/modules/winlog.md.
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
        const iso = localIso(date)
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

  // Six tiers (0, 1, 2, 3, 4, 5+) so an unusually prolific day still reads as
  // more saturated than an ordinary one instead of capping out early — see
  // docs/modules/winlog-edgecases.md #6.
  function tone(count: number, future: boolean): string {
    if (future) return 'bg-transparent'
    if (count === 0) return 'bg-muted'
    if (count === 1) return 'bg-primary/20'
    if (count === 2) return 'bg-primary/40'
    if (count === 3) return 'bg-primary/60'
    if (count === 4) return 'bg-primary/80'
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
            {col.map((c) =>
              c.future ? (
                <span key={c.iso} className={cn('rounded-[2px]', cell, tone(c.count, c.future))} />
              ) : (
                // Per-cell text alternative (docs/modules/winlog-edgecases.md #8) —
                // the aggregate figcaption/aria-label below covers the whole
                // grid, but a screen-reader/keyboard user on an embedded
                // graph (Path overview, Goal progress) has no adjacent list
                // to fall back on otherwise.
                <span
                  key={c.iso}
                  title={`${formatDayLabel(c.iso)}: ${c.count} ${c.count === 1 ? 'win' : 'wins'}`}
                  className={cn('rounded-[2px]', cell, tone(c.count, c.future))}
                />
              ),
            )}
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
