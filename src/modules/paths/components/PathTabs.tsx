import { NavLink } from 'react-router-dom'
import { Image, ListTodo, Signpost, Target } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * The Path's own tab bar. A Path used to be one overview page that linked out
 * to its Goals and Vision; those screens are siblings, not destinations you
 * leave the Path for, so they sit on one bar instead — Overview, Actions,
 * Goals, Vision (docs/adr/0026-path-actions-tab-and-drag-and-drop.md).
 *
 * Plain links, not an ARIA tablist: each tab is its own route, so browser
 * back/forward and "open in new tab" have to keep working. `aria-current`
 * (set by `NavLink`) carries which one is showing.
 */
const TABS = [
  { to: '', label: 'Overview', icon: Signpost, end: true },
  { to: '/actions', label: 'Actions', icon: ListTodo, end: false },
  { to: '/goals', label: 'Goals', icon: Target, end: false },
  { to: '/vision', label: 'Vision', icon: Image, end: false },
]

export function PathTabs({ pathId }: { pathId: string }) {
  return (
    <nav
      aria-label="Path sections"
      className="-mx-1 flex gap-1 overflow-x-auto border-b border-border px-1"
    >
      {TABS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={label}
          to={`/paths/${pathId}${to}`}
          end={end}
          className={({ isActive }) =>
            cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-t-md border-b-2 px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50',
              isActive
                ? 'border-primary font-medium text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )
          }
        >
          <Icon className="size-4" aria-hidden="true" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
