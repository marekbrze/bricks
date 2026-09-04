import type { Goal } from '../types/goal'

/**
 * Deterministic {ISO date -> win count} map, same generator shape as
 * `paths/data/mock.ts` — a stand-in for the real per-Goal graph `winlog`
 * will compute from completed Actions.
 */
function buildWinDays(weeks: number, seed: number): Record<string, number> {
  const days: Record<string, number> = {}
  const today = new Date()
  let s = seed
  const rand = () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
  for (let i = weeks * 7; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const iso = d.toISOString().slice(0, 10)
    const weekday = d.getDay()
    const base = weekday === 0 || weekday === 6 ? 0.2 : 0.5
    const r = rand()
    if (r < base) days[iso] = 1 + Math.floor(rand() * 2)
  }
  return days
}

const nowIso = new Date().toISOString()

function goal(partial: Partial<Goal> & Pick<Goal, 'id' | 'name' | 'pathId'>): Goal {
  return {
    createdAt: nowIso,
    updatedAt: nowIso,
    description: '',
    parentGoalId: null,
    order: 0,
    deadline: null,
    state: 'active',
    achievedOn: null,
    frog: false,
    mockWinDays: {},
    ...partial,
  }
}

/**
 * Ids `goal-pullup-program`, `goal-5k-block` and `goal-runway` are shared
 * with `capture-triage/data/mock.ts` (`MOCK_ASSIGNED_ACTIONS`), so those
 * already-triaged Actions line up with real Goals here.
 */
export const MOCK_GOALS: Goal[] = [
  goal({
    id: 'goal-pullup-program',
    pathId: 'path-sport',
    name: 'Pull-up program',
    description: 'Progressive overload toward a strict pull-up, then weighted work.',
    order: 0,
    deadline: '2026-11-01',
    frog: true,
    mockWinDays: buildWinDays(20, 11),
  }),
  goal({
    id: 'goal-pullup-negatives',
    pathId: 'path-sport',
    parentGoalId: 'goal-pullup-program',
    name: 'Negatives block (4 weeks)',
    description: 'Slow eccentric negatives, 3x/week, before moving to assisted pull-ups.',
    order: 0,
  }),
  goal({
    id: 'goal-pullup-assisted',
    pathId: 'path-sport',
    parentGoalId: 'goal-pullup-program',
    name: 'Assisted pull-ups block',
    order: 1,
  }),
  goal({
    id: 'goal-5k-block',
    pathId: 'path-sport',
    name: 'Sub-25 5K training block',
    description: 'An 8-week block of tempo and interval runs toward a sub-25:00 5K.',
    order: 1,
    // Overdue relative to the project's current date (2026-09-04) — exercises the overdue badge.
    deadline: '2026-08-20',
  }),
  goal({
    id: 'goal-mobility',
    pathId: 'path-sport',
    name: 'Daily mobility routine',
    description: 'A 10-minute routine before every run — hips, ankles, shoulders.',
    order: 2,
    state: 'achieved',
    achievedOn: '2026-07-02',
  }),
  goal({
    id: 'goal-runway',
    pathId: 'path-earnings',
    name: 'Build a 3-month runway',
    description: 'Automate savings until three months of expenses sit untouched.',
    order: 0,
    deadline: '2026-12-15',
    mockWinDays: buildWinDays(20, 42),
  }),
  goal({
    id: 'goal-side-product',
    pathId: 'path-earnings',
    name: 'Ship a paid side product',
    order: 1,
  }),
  goal({
    id: 'goal-cold-outreach',
    pathId: 'path-earnings',
    name: 'Cold outreach for a second client',
    description: 'Tried for six weeks — not the right lever right now.',
    order: 2,
    state: 'abandoned',
  }),
  goal({
    id: 'goal-essays',
    pathId: 'path-craft',
    name: 'Write 10 essays',
    description: 'Publish one short essay every couple of weeks — learning in public.',
    order: 0,
  }),
]
