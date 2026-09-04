/**
 * Stand-in for real `Goal`s until the `goals` module is built — mirrors how
 * `paths/types/path.ts` uses `mock*` counters for the same reason. Keyed to
 * the same Path ids as `modules/paths/data/mock.ts` so the assign picker
 * lines up with real Paths in the `full` dev scenario. Delete once `goals`
 * ships its own `useGoals` hook and this module can query it directly.
 */
export interface MockGoalOption {
  id: string
  pathId: string
  name: string
}

export const MOCK_GOAL_OPTIONS: MockGoalOption[] = [
  { id: 'goal-pullup-program', pathId: 'path-sport', name: 'Pull-up program' },
  { id: 'goal-5k-block', pathId: 'path-sport', name: 'Sub-25 5K training block' },
  { id: 'goal-runway', pathId: 'path-earnings', name: 'Build a 3-month runway' },
  { id: 'goal-side-product', pathId: 'path-earnings', name: 'Ship a paid side product' },
  { id: 'goal-essays', pathId: 'path-craft', name: 'Write 10 essays' },
]
