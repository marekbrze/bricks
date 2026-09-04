import { Inbox } from 'lucide-react'
import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'
import type { Action } from '@/modules/capture-triage/types/action'

/**
 * The Inbox group pinned to the top of the Actions view — only when it holds
 * anything. Items are locked to a "needs triage" hint: assigning them is
 * triage's job (card-by-card), so this group has no quick-add, no schedule,
 * no checkboxes — it's a pointer to `/capture-triage`, not a second triage UI.
 */
export function InboxGroup({ actions }: { actions: Action[] }) {
  if (actions.length === 0) return null

  return (
    <section
      aria-label={`Inbox — ${actions.length} item${actions.length === 1 ? '' : 's'} waiting for triage`}
      className="flex flex-col gap-2 rounded-xl border border-dashed border-border p-4"
    >
      <div className="flex items-center gap-2">
        <Inbox className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <h2 className="min-w-0 flex-1 text-base font-semibold">Inbox</h2>
        <Link to="/capture-triage" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          Triage
        </Link>
      </div>
      <ul className="flex flex-col gap-1">
        {actions.map((a) => (
          <li
            key={a.id}
            className="flex items-center gap-3 rounded-lg border border-border bg-background p-2"
          >
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm">{a.name}</span>
              <span className="block text-xs text-muted-foreground">needs triage</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
