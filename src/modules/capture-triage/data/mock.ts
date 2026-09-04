import type { Action } from '../types/action'

const nowIso = new Date().toISOString()

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

/** A few already-triaged Actions, so `today` / `goals` have something to show later. */
export const MOCK_ASSIGNED_ACTIONS: Action[] = [
  assignedAction('action-pullup-negatives', 'Practice pull-up negatives, 3 sets', 'path-sport', 'goal-pullup-program'),
  assignedAction('action-5k-tempo', 'Tempo run, 5K pace', 'path-sport', 'goal-5k-block'),
  assignedAction('action-savings-transfer', 'Set up automatic savings transfer', 'path-earnings', 'goal-runway'),
  assignedAction('action-standalone-plant', 'Water the office plant', 'path-craft', null),
]

export const MOCK_ACTIONS: Action[] = [...MOCK_INBOX_ACTIONS, ...MOCK_ASSIGNED_ACTIONS]
