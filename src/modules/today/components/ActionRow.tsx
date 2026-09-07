import { Flame } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { Action } from '@/modules/capture-triage/types/action'
import { ActionOverflowMenu } from './ActionOverflowMenu'

/** One scheduled Action, in a Path section or an agenda day block. */
export function ActionRow({
  action,
  pathName,
  onToggleDone,
  onMove,
  onUnschedule,
  onAbandon,
}: {
  action: Action
  /** Shown under the name when the row isn't already inside a Path-labeled section (the Schedule/agenda view). */
  pathName?: string
  onToggleDone: (done: boolean) => void
  onMove: () => void
  onUnschedule: () => void
  onAbandon: () => void
}) {
  const done = action.state === 'done'

  return (
    <li
      className={cn(
        'group flex items-center gap-3 rounded-lg border border-border bg-background p-2 transition-colors',
        done && 'border-win/25 bg-win-soft',
      )}
    >
      <Checkbox
        checked={done}
        onCheckedChange={(value) => onToggleDone(Boolean(value))}
        aria-label={done ? `Mark “${action.name}” not done` : `Mark “${action.name}” done`}
      />
      <span className="min-w-0 flex-1">
        <span className={cn('block text-sm break-words', done && 'text-muted-foreground line-through')}>
          {action.name}
        </span>
        {pathName && <span className="block text-xs text-muted-foreground">{pathName}</span>}
      </span>
      {/* Frog hidden once done, matching the actions module's row — the win
          wash already tells the story; the flag is a call to act. */}
      {action.frog && !done && (
        <span aria-label="Frog" className="inline-flex shrink-0">
          <Flame className="size-4 text-frog" aria-hidden="true" />
        </span>
      )}
      <ActionOverflowMenu
        actionName={action.name}
        done={done}
        onMove={onMove}
        onUnschedule={onUnschedule}
        onAbandon={onAbandon}
      />
    </li>
  )
}
