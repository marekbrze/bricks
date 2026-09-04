import type { Action } from '../types/action'
import { addDaysIso, todayLocalIso } from '@/shared/lib/date'

const nowIso = new Date().toISOString()
const today = todayLocalIso()
const tomorrow = addDaysIso(today, 1)

function inboxAction(id: string, name: string): Action {
  return {
    id,
    createdAt: nowIso,
    updatedAt: nowIso,
    name,
    state: 'inbox',
    pathId: null,
    goalId: null,
    frog: false,
    scheduledDate: null,
    completedAt: null,
  }
}

function assignedAction(
  id: string,
  name: string,
  pathId: string,
  goalId: string | null,
  overrides: Partial<Action> = {},
): Action {
  return {
    id,
    createdAt: nowIso,
    updatedAt: nowIso,
    name,
    state: 'assigned',
    pathId,
    goalId,
    frog: false,
    scheduledDate: null,
    completedAt: null,
    ...overrides,
  }
}

/** A handful of uncategorized ideas waiting for a triage pass. */
export const MOCK_INBOX_ACTIONS: Action[] = [
  inboxAction('action-band', 'Buy a resistance band'),
  inboxAction('action-podcast', 'Listen to that pricing podcast episode'),
  inboxAction('action-invoice-tool', 'Look into a better invoicing tool'),
  inboxAction('action-mobility', 'Try a mobility routine before runs'),
  inboxAction('action-declutter-desk', 'Declutter the desk drawer'),
]

/**
 * A few already-triaged Actions, so `today` / `goals` have something to
 * show. Mixes scheduled (today + tomorrow, one already `done`), one plain
 * unscheduled backlog item (for the "Add to today" picker), and one
 * `abandoned` item (for Review abandoned) — enough states for `today`'s
 * day view, Schedule view, and Review abandoned to each have something real
 * to render out of the box.
 */
export const MOCK_ASSIGNED_ACTIONS: Action[] = [
  // Frog propagated from `goal-pullup-program` (frog: true in goals/data/mock.ts) — scheduled today.
  assignedAction('action-pullup-negatives', 'Practice pull-up negatives, 3 sets', 'path-sport', 'goal-pullup-program', {
    frog: true,
    scheduledDate: today,
  }),
  assignedAction('action-5k-tempo', 'Tempo run, 5K pace', 'path-sport', 'goal-5k-block', {
    scheduledDate: tomorrow,
  }),
  assignedAction('action-savings-transfer', 'Set up automatic savings transfer', 'path-earnings', 'goal-runway', {
    scheduledDate: today,
  }),
  // Completed earlier today — stays visible in its completed style for the rest of the day.
  assignedAction('action-standalone-plant', 'Water the office plant', 'path-craft', null, {
    state: 'done',
    scheduledDate: today,
    completedAt: nowIso,
  }),
  // Assigned but not yet scheduled — shows up in the "Add to today" picker.
  assignedAction('action-outreach-list', 'Draft a list of 10 cold-outreach targets', 'path-earnings', 'goal-cold-outreach'),
  // Scheduled today, then decided against — lives in Review abandoned instead of cluttering the day view.
  assignedAction('action-old-idea', 'Repaint the hallway', 'path-home', null, {
    state: 'abandoned',
    scheduledDate: today,
  }),
]

export const MOCK_ACTIONS: Action[] = [...MOCK_INBOX_ACTIONS, ...MOCK_ASSIGNED_ACTIONS]
