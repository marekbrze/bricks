import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from '@/shared/navigation'

/** Desktop top-bar navigation. Hidden on mobile (BottomTabs takes over). */
export function TopNav({ className }: { className?: string }) {
  return (
    <nav aria-label="Główna nawigacja" className={cn('items-center gap-1', className)}>
      {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) =>
            cn(
              'inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors outline-none',
              'focus-visible:ring-3 focus-visible:ring-ring/50',
              isActive
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
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
