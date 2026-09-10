import type { Action } from '../types/action'
import { addDaysIso, todayLocalIso } from '@/shared/lib/date'

const nowIso = new Date().toISOString()
const today = todayLocalIso()
const tomorrow = addDaysIso(today, 1)
const threeDaysAgo = addDaysIso(today, -3)
const lastWeek = addDaysIso(today, -8)

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
  // Scheduled for a day that has already passed — the Today view's Overdue
  // bucket. One is a frog, so the "frog first" sort inside the section shows.
  assignedAction('action-overdue-invoice', 'Send the overdue invoice to the client', 'path-earnings', 'goal-cold-outreach', {
    frog: true,
    scheduledDate: threeDaysAgo,
  }),
  assignedAction('action-overdue-stretch', 'Do the prescribed hip-mobility routine', 'path-sport', 'goal-5k-block', {
    scheduledDate: lastWeek,
  }),
  // Scheduled today, then decided against — lives in Review abandoned instead of cluttering the day view.
  assignedAction('action-old-idea', 'Repaint the hallway', 'path-home', null, {
    state: 'abandoned',
    scheduledDate: today,
  }),
]

/**
 * Deterministic pseudo-random generator, same LCG shape used elsewhere in
 * the mock data (`paths`/`goals` used to key a fake win-days map with it;
 * now it drives real historical `done` Actions instead — see ADR 0013).
 */
function makeRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

/**
 * Backdated `done` Actions spread over the past several weeks, so `winlog`'s
 * contribution graphs (global, per-Path, per-Goal) have real history to show
 * instead of an empty grid. Weekday-biased density, deterministic per seed —
 * stable between reloads. `completedAt` is anchored at local noon on its day
 * so it round-trips through `winlog`'s local-date bucketing without drifting
 * to an adjacent day.
 */
function buildCompletedActions(
  idPrefix: string,
  pathId: string,
  goalPool: (string | null)[],
  namePool: string[],
  weeks: number,
  seed: number,
): Action[] {
  const rand = makeRand(seed)
  const items: Action[] = []
  let n = 0
  for (let i = weeks * 7; i >= 1; i--) {
    const dateIso = addDaysIso(today, -i)
    const weekday = new Date(`${dateIso}T12:00:00`).getDay()
    const chance = weekday === 0 || weekday === 6 ? 0.35 : 0.7
    if (rand() >= chance) continue
    n += 1
    const completedAt = new Date(`${dateIso}T12:00:00`).toISOString()
    items.push({
      id: `${idPrefix}-${n}`,
      createdAt: completedAt,
      updatedAt: completedAt,
      name: namePool[Math.floor(rand() * namePool.length)],
      state: 'done',
      pathId,
      goalId: goalPool[Math.floor(rand() * goalPool.length)],
      frog: false,
      scheduledDate: dateIso,
      completedAt,
    })
  }
  return items
}

const SPORT_WIN_NAMES = [
  'Pull-up negatives, 3 sets',
  'Tempo run, 5K pace',
  'Mobility routine before a run',
  'Interval session, 6x400m',
  'Strength: squats + rows',
  'Easy recovery run',
  'Assisted pull-up ladder',
  'Stretch + foam roll',
  'Long run, conversational pace',
  'Core circuit, 15 min',
]

const EARNINGS_WIN_NAMES = [
  'Cold outreach email batch',
  'Follow up on an open invoice',
  'Automatic savings transfer',
  'Review the monthly budget',
  'Draft a proposal for a lead',
  'Update the rate card',
  'Research a second income stream',
  'Client check-in call',
]

const CRAFT_WIN_NAMES = [
  'Write 500 words',
  'Edit an essay draft',
  'Read a chapter on craft',
  'Sketch practice, 20 min',
  'Outline the next essay',
]

/**
 * Months of real completion history so `winlog` has something to show —
 * global graph, per-Path (`path-sport`/`path-earnings`/`path-craft`) and
 * per-Goal (mixes in real Goal ids from `goals/data/mock.ts`, plus `null`
 * for standalone Actions directly on the Path).
 */
export const MOCK_HISTORICAL_ACTIONS: Action[] = [
  ...buildCompletedActions(
    'action-hist-sport',
    'path-sport',
    ['goal-pullup-program', 'goal-pullup-program', 'goal-pullup-negatives', 'goal-5k-block', 'goal-5k-block', 'goal-mobility', null],
    SPORT_WIN_NAMES,
    16,
    7,
  ),
  ...buildCompletedActions(
    'action-hist-earnings',
    'path-earnings',
    ['goal-runway', 'goal-runway', 'goal-side-product', 'goal-cold-outreach', null],
    EARNINGS_WIN_NAMES,
    14,
    42,
  ),
  ...buildCompletedActions(
    'action-hist-craft',
    'path-craft',
    ['goal-essays', 'goal-essays', null],
    CRAFT_WIN_NAMES,
    9,
    123,
  ),
]

/**
 * Logged `Essential` completions (`essentials` module) — already-`done`
 * standalone Actions carrying an `essentialId`, some stamped today and some a
 * few days back, so the Essentials tab's per-row counters and the Path
 * overview's all-time count show real history out of the box. `essentialId`s
 * line up with `essentials/data/mock.ts`.
 */
function loggedEssential(
  id: string,
  name: string,
  pathId: string,
  essentialId: string,
  dayOffset: number,
  note?: string,
): Action {
  const dateIso = addDaysIso(today, dayOffset)
  const completedAt = new Date(`${dateIso}T12:00:00`).toISOString()
  return {
    id,
    createdAt: completedAt,
    updatedAt: completedAt,
    name,
    state: 'done',
    pathId,
    goalId: null,
    frog: false,
    scheduledDate: null,
    completedAt,
    essentialId,
    ...(note ? { note } : {}),
  }
}

export const MOCK_ESSENTIAL_LOG_ACTIONS: Action[] = [
  loggedEssential('action-elog-hang-1', 'Hang from a bar — 60s total across the day', 'path-sport', 'essential-hang', 0, 'Full minute in one go today.'),
  loggedEssential('action-elog-hang-2', 'Hang from a bar — 60s total across the day', 'path-sport', 'essential-hang', -1),
  loggedEssential('action-elog-hang-3', 'Hang from a bar — 60s total across the day', 'path-sport', 'essential-hang', -2),
  loggedEssential('action-elog-barefoot-1', 'Walk barefoot outside', 'path-sport', 'essential-barefoot', 0),
  loggedEssential('action-elog-barefoot-2', 'Walk barefoot outside', 'path-sport', 'essential-barefoot', -3),
  loggedEssential('action-elog-getup-1', 'Get down to the floor and back up, 20×, no hands', 'path-sport', 'essential-getup', -1),
  loggedEssential('action-elog-calls-1', 'Call five prospective clients', 'path-earnings', 'essential-calls', 0, 'Two callbacks scheduled.'),
  loggedEssential('action-elog-calls-2', 'Call five prospective clients', 'path-earnings', 'essential-calls', -1),
  loggedEssential('action-elog-followup-1', 'Follow up on every open lead', 'path-earnings', 'essential-followup', -2),
]

export const MOCK_ACTIONS: Action[] = [
  ...MOCK_INBOX_ACTIONS,
  ...MOCK_ASSIGNED_ACTIONS,
  ...MOCK_HISTORICAL_ACTIONS,
  ...MOCK_ESSENTIAL_LOG_ACTIONS,
]
