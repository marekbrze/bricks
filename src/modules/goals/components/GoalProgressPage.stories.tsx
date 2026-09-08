import type { Meta, StoryObj } from '@storybook/react-vite'
import type { Goal } from '../types/goal'
import { GoalProgressPage } from './GoalProgressPage'
import { withGoals, withArchivedPathGoals, seedCorruptActions, MOCK_GOALS } from './story-helpers'

const ARCHIVED_PATH_GOAL: Goal = {
  id: 'goal-declutter',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  name: 'Declutter every room',
  description: 'One room a weekend.',
  pathId: 'path-home',
  parentGoalId: null,
  order: 0,
  deadline: null,
  state: 'active',
  achievedOn: null,
  frog: false,
}

const meta: Meta<typeof GoalProgressPage> = {
  title: 'Goals/GoalProgressPage',
  component: GoalProgressPage,
}
export default meta

type Story = StoryObj<typeof GoalProgressPage>

export const WithSubGoalsAndActions: Story = {
  decorators: [withGoals(MOCK_GOALS, '/paths/path-sport/goals/goal-pullup-program', '/paths/:pathId/goals/:goalId')],
}

export const LeafNoSubGoals: Story = {
  decorators: [withGoals(MOCK_GOALS, '/paths/path-earnings/goals/goal-side-product', '/paths/:pathId/goals/:goalId')],
}

/** No Actions and no sub-Goals yet — both empty sections still invite input:
 * the quick-add row is mounted under the Actions message, and the Sub-Goals
 * header keeps its Add button. */
export const EmptyLeaf: Story = {
  decorators: [withGoals(MOCK_GOALS, '/paths/path-sport/goals/goal-pullup-assisted', '/paths/:pathId/goals/:goalId')],
}

export const Achieved: Story = {
  decorators: [withGoals(MOCK_GOALS, '/paths/path-sport/goals/goal-mobility', '/paths/:pathId/goals/:goalId')],
}

export const Abandoned: Story = {
  decorators: [withGoals(MOCK_GOALS, '/paths/path-earnings/goals/goal-cold-outreach', '/paths/:pathId/goals/:goalId')],
}

export const OverdueDeadline: Story = {
  decorators: [withGoals(MOCK_GOALS, '/paths/path-sport/goals/goal-5k-block', '/paths/:pathId/goals/:goalId')],
}

export const NotFound: Story = {
  decorators: [withGoals(MOCK_GOALS, '/paths/path-sport/goals/does-not-exist', '/paths/:pathId/goals/:goalId')],
}

/** Corrupt `actions` shouldn't silently show `0 Actions` — same recovery screen as `paths`/`capture-triage`. */
export const ActionsDataUnreadable: Story = {
  decorators: [seedCorruptActions('/paths/path-sport/goals/goal-pullup-program')],
}

/** An archived Path's Goal renders read-only — restore banner, no overflow menu, no Add sub-Goal, no quick-add row. */
export const ArchivedPathReadOnly: Story = {
  decorators: [withArchivedPathGoals([ARCHIVED_PATH_GOAL], '/paths/path-home/goals/goal-declutter')],
}
