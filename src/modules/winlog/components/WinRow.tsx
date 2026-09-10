import { Link } from 'react-router-dom'
import { CheckCircle2, Trophy } from 'lucide-react'
import { formatTimeLabel } from '@/shared/lib/date'
import type { Win } from '../types/win'

/**
 * One entry in the Log's day-grouped list — the day itself is the group
 * header's job, so this row carries only the time of day (Action wins have a
 * full timestamp; a Goal's `achievedOn` is a bare date, so it shows none).
 * An action Win links to the Action's *current* `scheduledDate` when it still
 * has one (it may have been moved to another day since completing — see
 * docs/modules/winlog-edgecases.md #2), falling back to the day it was
 * completed on; a goal Win links into that Goal's progress page. A Win logged
 * from an `Essential` (`win.viaEssential`) is labelled `· Essential` and, when
 * a comment was left (`win.note`), quotes it under the name. See
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
          <Trophy className="size-4 shrink-0 text-win" aria-hidden="true" />
        ) : (
          <CheckCircle2 className="size-4 shrink-0 text-win" aria-hidden="true" />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{win.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {pathName}
            {goalName && ` · ${goalName}`}
            {win.kind === 'goal' && ' · Goal achieved'}
            {win.viaEssential && ' · Essential'}
          </p>
          {win.note && (
            <p className="mt-0.5 line-clamp-2 text-xs italic text-muted-foreground">
              “{win.note}”
            </p>
          )}
        </div>
        {win.kind === 'action' && (
          <time
            dateTime={win.at}
            className="shrink-0 text-xs tabular-nums text-muted-foreground"
          >
            {formatTimeLabel(win.at)}
          </time>
        )}
      </Link>
    </li>
  )
}
