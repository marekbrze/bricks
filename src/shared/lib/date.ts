/**
 * Local-calendar-date (YYYY-MM-DD) helpers shared across modules that key
 * data by day — `today` (day nav, scheduling), `goals` (deadlines, win-day
 * maps), `vision` (achievement-tile dates). Always local, never UTC, so
 * "today" matches the Owner's own day rather than flipping at UTC midnight.
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

/** Day of week for an ISO date, 0 = Sunday … 6 = Saturday (local calendar). */
export function weekdayIndex(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).getDay()
}

/**
 * The first Saturday strictly after `from` (1–7 days forward) — the
 * SchedulePopover's "This weekend" shortcut. The popover hides that option on
 * Sat/Sun, so the strict-forward rule is only a safety net.
 */
export function comingSaturdayIso(fromIso: string = todayLocalIso()): string {
  const delta = (6 - weekdayIndex(fromIso) + 7) % 7 || 7
  return addDaysIso(fromIso, delta)
}

/** The first Monday strictly after `from` (1–7 days forward) — the "Next week" shortcut. */
export function comingMondayIso(fromIso: string = todayLocalIso()): string {
  const delta = (1 - weekdayIndex(fromIso) + 7) % 7 || 7
  return addDaysIso(fromIso, delta)
}

/** True calendar-day comparison — safe for `<`, `>`, `===` on the raw ISO strings too, this just reads better at call sites. */
export function compareIso(a: string, b: string): number {
  return a.localeCompare(b)
}

/**
 * Local HH:MM for a full ISO timestamp — the time-of-day line inside a
 * day-grouped list (the group header already carries the date). Only ever
 * called with full timestamps; a bare date (`YYYY-MM-DD`, as Goals'
 * `achievedOn` is) parses as UTC midnight and must not be time-labeled.
 */
export function formatTimeLabel(iso: string): string {
  const d = new Date(iso)
  const offsetMs = d.getTimezoneOffset() * 60_000
  return new Date(d.getTime() - offsetMs).toISOString().slice(11, 16)
}

/**
 * The muted right-hand hint on a SchedulePopover quick row — the concrete day
 * the shortcut resolves to, so it is never a mystery: a short weekday ("Sat")
 * within the coming week, a short month + day ("Sep 22") beyond it.
 */
export function quickDayHint(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const withinWeek = compareIso(iso, addDaysIso(todayLocalIso(), 6)) <= 0
  return date.toLocaleDateString(
    undefined,
    withinWeek ? { weekday: 'short' } : { month: 'short', day: 'numeric' },
  )
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
