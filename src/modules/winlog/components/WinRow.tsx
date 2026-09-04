import { Link } from 'react-router-dom'
import { CheckCircle2, Trophy } from 'lucide-react'
import { formatDayLabel } from '@/shared/lib/date'
import type { Win } from '../types/win'

/**
 * One entry in the Log's chronological list. An action Win links to the
 * Action's *current* `scheduledDate` when it still has one (it may have
 * been moved to another day since completing — see
 * docs/modules/winlog-edgecases.md #2), falling back to the day it was
 * completed on; a goal Win links into that Goal's progress page. See
 * docs/modules/winlog.md → "Read a Win row" and ADR 0013.
 */
export function WinRow({ win, pathName, goalName }: { win: Win; pathName: string; goalName: string | null }) {
  const to =
    win.kind === 'action'
      ? `/today/${win.currentScheduledDate ?? win.date}`
      : `/paths/${win.pathId}/goals/${win.goalId}`

  return (
    <li>
      <Link
        to={to}
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 outline-none hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {win.kind === 'goal' ? (
          <Trophy className="size-4 shrink-0 text-primary" aria-hidden="true" />
        ) : (
          <CheckCircle2 className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{win.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {pathName}
            {goalName && ` · ${goalName}`}
            {win.kind === 'goal' && ' · Goal achieved'}
          </p>
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">{formatDayLabel(win.date)}</span>
      </Link>
    </li>
  )
}
