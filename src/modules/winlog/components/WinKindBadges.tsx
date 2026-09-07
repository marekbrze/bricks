import { CheckCircle2, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WinKindCounts } from '../lib/win-counts'

/**
 * The two win kinds side by side, icon + count — the inline form of the win
 * vocabulary (day-group headers, PathCard). Green only when non-zero: an empty
 * kind doesn't celebrate (honest zeros, ADR 0039). Badge-level numbers use
 * `text-win-strong` to hold the 4.5:1 small-text floor; the icons sit at the
 * 3:1 icon floor.
 */
export function WinKindBadges({ counts, className }: { counts: WinKindCounts; className?: string }) {
  return (
    <span className={cn('flex items-center gap-3', className)}>
      <span className="sr-only">
        {`Small wins: ${counts.small}. Big wins: ${counts.big}.`}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          'flex items-center gap-1 text-xs tabular-nums',
          counts.small > 0 ? 'text-win-strong' : 'text-muted-foreground',
        )}
      >
        <CheckCircle2 className={cn('size-3.5', counts.small > 0 && 'text-win')} aria-hidden="true" />
        {counts.small}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          'flex items-center gap-1 text-xs tabular-nums',
          counts.big > 0 ? 'text-win-strong' : 'text-muted-foreground',
        )}
      >
        <Trophy className={cn('size-3.5', counts.big > 0 && 'text-win')} aria-hidden="true" />
        {counts.big}
      </span>
    </span>
  )
}
