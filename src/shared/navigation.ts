import { CalendarDays, Signpost, Inbox, Trophy, type LucideIcon } from 'lucide-react'

/**
 * Top-level navigation. Only 4 of the 6 design modules are nav destinations —
 * `vision` and `goals` are reached from inside a Path, not the main nav.
 * See docs/UI-STRATEGY.md.
 *
 * Route segment == module code name from docs/MODULES.md, so proto-lofi can
 * map each route straight to its module folder.
 */
export interface NavItem {
  /** Module code name from docs/MODULES.md — also the route segment. */
  module: string
  /** Display label shown in the nav. */
  label: string
  path: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { module: 'today', label: 'Today', path: '/today', icon: CalendarDays },
  { module: 'paths', label: 'Paths', path: '/paths', icon: Signpost },
  { module: 'capture-triage', label: 'Inbox', path: '/capture-triage', icon: Inbox },
  { module: 'winlog', label: 'Log', path: '/winlog', icon: Trophy },
]

/** Where `/` sends the user — straight into the Today view. */
export const HOME_PATH = '/today'
