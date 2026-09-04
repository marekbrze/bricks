/**
 * Local-calendar-date (YYYY-MM-DD) helpers shared across modules that key
 * data by day — `today` (day nav, scheduling), `paths`/`goals` (win-day
 * maps, Achievement dates). Always local, never UTC, so "today" matches the
 * Owner's own day rather than flipping at UTC midnight.
 */

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

/** True for a well-formed `YYYY-MM-DD` string that round-trips to a real calendar date (rejects e.g. `2026-02-30`). */
export function isValidIso(value: string | undefined): value is string {
  if (!value || !ISO_DATE_RE.test(value)) return false
  const [y, m, d] = value.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d
}

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

/**
 * "Today", "Tomorrow", "Yesterday", or a short weekday + date label — with
 * the year appended whenever `iso` falls outside the current calendar year,
 * since nothing constrains how far out an Action can be scheduled/moved to.
 */
export function formatDayLabel(iso: string): string {
  const today = todayLocalIso()
  if (iso === today) return 'Today'
  if (iso === addDaysIso(today, 1)) return 'Tomorrow'
  if (iso === addDaysIso(today, -1)) return 'Yesterday'
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const sameYear = y === new Date().getFullYear()
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: sameYear ? undefined : 'numeric',
  })
}
