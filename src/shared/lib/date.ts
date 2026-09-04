/**
 * Local-calendar-date (YYYY-MM-DD) helpers shared across modules that key
 * data by day — `today` (day nav, scheduling), `paths`/`goals` (win-day
 * maps, Achievement dates). Always local, never UTC, so "today" matches the
 * Owner's own day rather than flipping at UTC midnight.
 */

export function todayLocalIso(): string {
  const d = new Date()
  const offsetMs = d.getTimezoneOffset() * 60_000
  return new Date(d.getTime() - offsetMs).toISOString().slice(0, 10)
}

/** Add (or subtract, with a negative count) whole days to an ISO date. */
export function addDaysIso(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d + days)
  const offsetMs = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 10)
}

/** True calendar-day comparison — safe for `<`, `>`, `===` on the raw ISO strings too, this just reads better at call sites. */
export function compareIso(a: string, b: string): number {
  return a.localeCompare(b)
}

/** "Today", "Tomorrow", "Yesterday", or a short weekday + date label. */
export function formatDayLabel(iso: string): string {
  const today = todayLocalIso()
  if (iso === today) return 'Today'
  if (iso === addDaysIso(today, 1)) return 'Tomorrow'
  if (iso === addDaysIso(today, -1)) return 'Yesterday'
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}
