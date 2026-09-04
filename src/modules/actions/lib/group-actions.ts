import type { Action } from '@/modules/capture-triage/types/action'
import { addDaysIso, formatDayLabel, todayLocalIso } from '@/shared/lib/date'

/**
 * List-model helpers for the Actions view — pure functions over the shared
 * `Action` / `Goal` entities, so grouping and sorting stay testable and the
 * screen components stay dumb. Sort order per docs/modules/actions.md:
 * frog-first, then Actions with a `scheduledDate` ascending, then creation
 * order. A `done`/`abandoned` Action keeps this order too — it just renders
 * in place once "Show completed" is on.
 */
export function compareActionsForList(a: Action, b: Action): number {
  if (a.frog !== b.frog) return a.frog ? -1 : 1
  // Frogs sort by date among themselves as well; then scheduled before unscheduled.
  if (a.scheduledDate !== b.scheduledDate) {
    if (!a.scheduledDate) return 1
    if (!b.scheduledDate) return -1
    return a.scheduledDate.localeCompare(b.scheduledDate)
  }
  return a.createdAt.localeCompare(b.createdAt)
}

/** True when the row is hidden behind the "Show completed" toggle. */
export function isSettled(action: Action): boolean {
  return action.state === 'done' || action.state === 'abandoned'
}

/** A `scheduledDate` as a short human chip: "Today", "Tomorrow", or a date — plus an overdue flag. */
export function scheduledDateChip(iso: string): { label: string; overdue: boolean } {
  const today = todayLocalIso()
  return { label: formatDayLabel(iso), overdue: iso < today }
}

/** Tomorrow as a local ISO date — one of the quick-add popover's shortcuts. */
export function tomorrowIso(): string {
  return addDaysIso(todayLocalIso(), 1)
}
