import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Path } from '@/modules/paths/types/path'
import type { Action } from '@/modules/capture-triage/types/action'
import { ActionRow } from './ActionRow'

/**
 * One Path's slice of the day view. Always renders, even with nothing
 * scheduled — a Path silently disappearing would read as "did this get
 * lost?" rather than "nothing planned here today". See docs/modules/today.md
 * Edge Cases.
 */
export function PathSection({
  path,
  actions,
  onAdd,
  onToggleDone,
  onMove,
  onUnschedule,
  onAbandon,
}: {
  path: Path
  actions: Action[]
  onAdd: () => void
  onToggleDone: (action: Action, done: boolean) => void
  onMove: (action: Action) => void
  onUnschedule: (action: Action) => void
  onAbandon: (action: Action) => void
}) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">{path.name}</h2>
        <Button variant="ghost" size="sm" onClick={onAdd}>
          <Plus aria-hidden="true" /> Add
        </Button>
      </div>
      {actions.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-3 py-2.5 text-sm text-muted-foreground">
          Nothing scheduled today.
        </p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {actions.map((a) => (
            <ActionRow
              key={a.id}
              action={a}
              onToggleDone={(done) => onToggleDone(a, done)}
              onMove={() => onMove(a)}
              onUnschedule={() => onUnschedule(a)}
              onAbandon={() => onAbandon(a)}
            />
          ))}
        </ul>
      )}
    </section>
  )
}
