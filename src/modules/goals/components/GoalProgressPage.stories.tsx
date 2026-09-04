import type { Meta, StoryObj } from '@storybook/react-vite'
import { GoalProgressPage } from './GoalProgressPage'
import { withGoals, MOCK_GOALS } from './story-helpers'

const meta: Meta<typeof GoalProgressPage> = {
  title: 'Goals/GoalProgressPage',
  component: GoalProgressPage,
}
export default meta

type Story = StoryObj<typeof GoalProgressPage>

export const WithSubGoalsAndActions: Story = {
  decorators: [withGoals(MOCK_GOALS, '/paths/path-sport/goals/goal-pullup-program')],
}

export const LeafNoSubGoals: Story = {
  decorators: [withGoals(MOCK_GOALS, '/paths/path-earnings/goals/goal-side-product')],
}

export const Achieved: Story = {
  decorators: [withGoals(MOCK_GOALS, '/paths/path-sport/goals/goal-mobility')],
}

export const Abandoned: Story = {
  decorators: [withGoals(MOCK_GOALS, '/paths/path-earnings/goals/goal-cold-outreach')],
}

export const OverdueDeadline: Story = {
  decorators: [withGoals(MOCK_GOALS, '/paths/path-sport/goals/goal-5k-block')],
}

export const NotFound: Story = {
  decorators: [withGoals(MOCK_GOALS, '/paths/path-sport/goals/does-not-exist')],
}
