import { CheckCircle2, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WinKindCounts } from '../lib/win-counts'

/**
 * The win balance — the two kinds as one block, a vertical hairline between
 * the tiles (one surface, not a pair of identical cards — DESIGN.md's
 * identical-grid ban). Honest zeros (ADR 0039): an empty scope reads
 * `0 · 0` with muted icons — the balance is always real, never cheering and
 * never hiding. Numbers sit on the type ramp's counter steps: 3xl for the
 * Log, 2xl for embedded scopes (docs/DESIGN.md Typography).
 */
export function WinBalance({
  counts,
  size = 'lg',
  className,
}: {
  counts: WinKindCounts
  /** `lg` — the Log page; `sm` — embedded scopes (Path overview, Goal progress). */
  size?: 'lg' | 'sm'
  className?: string
}) {
  return (
    <section
      aria-label="Win balance"
      className={cn(
        'grid grid-cols-2 divide-x divide-border rounded-lg border border-border',
        size === 'lg' ? 'p-4' : 'p-3',
        className,
      )}
    >
      <p className="sr-only">
        {`Small wins: ${counts.small}. Big wins: ${counts.big}.`}
      </p>
      <BalanceTile
        icon={<CheckCircle2 className="size-4" aria-hidden="true" />}
        label="Small wins"
        hint="actions completed"
        value={counts.small}
        size={size}
      />
      <BalanceTile
        icon={<Trophy className="size-4" aria-hidden="true" />}
        label="Big wins"
        hint="goals achieved"
        value={counts.big}
        size={size}
      />
    </section>
  )
}

function BalanceTile({
  icon,
  label,
  hint,
  value,
  size,
}: {
  icon: React.ReactNode
  label: string
  hint: string
  value: number
  size: 'lg' | 'sm'
}) {
  return (
    // aria-hidden: the sr-only sentence above already reads both kinds in one
    // breath; the tiles are the visual statement of it.
    <div aria-hidden="true" className={size === 'lg' ? 'px-1 first:pl-0 last:pr-0' : 'px-2 first:pl-0 last:pr-0'}>
      <div
        className={cn(
          'flex items-center gap-2',
          value > 0 ? 'text-win' : 'text-muted-foreground',
        )}
      >
        {icon}
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <p
        className={cn(
          'pt-1 font-semibold tabular-nums tracking-tight',
          size === 'lg' ? 'text-3xl' : 'text-2xl',
          value > 0 ? 'text-win-strong' : 'text-muted-foreground',
        )}
      >
        {value}
      </p>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  )
}
