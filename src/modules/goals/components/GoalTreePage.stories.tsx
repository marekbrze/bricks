import type { Meta, StoryObj } from '@storybook/react-vite'
import { GoalTreePage } from './GoalTreePage'
import { withGoals, seedCorruptGoals, MOCK_GOALS } from './story-helpers'

const meta: Meta<typeof GoalTreePage> = {
  title: 'Goals/GoalTreePage',
  component: GoalTreePage,
}
export default meta

type Story = StoryObj<typeof GoalTreePage>

export const WithData: Story = {
  decorators: [withGoals(MOCK_GOALS)],
}

export const EmptyState: Story = {
  decorators: [withGoals([])],
}

export const SingleTopLevelGoal: Story = {
  decorators: [withGoals([{ ...MOCK_GOALS[0], parentGoalId: null }])],
}

/** Stored value is present but unparseable — recovery screen, not the empty state. */
export const DataUnreadable: Story = {
  decorators: [seedCorruptGoals()],
}
