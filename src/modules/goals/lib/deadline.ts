/**
 * Days remaining until an ISO (YYYY-MM-DD) deadline, using local calendar
 * dates on both sides — negative means overdue. Matches the local-date
 * convention `paths`/`goals` use for Achievement dates and win-day keys.
 */
export function daysUntil(deadlineIso: string): number {
  const [y, m, d] = deadlineIso.split('-').map(Number)
  const target = new Date(y, m - 1, d)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((target.getTime() - today.getTime()) / 86_400_000)
}

export function deadlineLabel(days: number): string {
  if (days === 0) return 'Due today'
  if (days > 0) return `${days} ${days === 1 ? 'day' : 'days'} left`
  const overdue = -days
  return `${overdue} ${overdue === 1 ? 'day' : 'days'} overdue`
}
