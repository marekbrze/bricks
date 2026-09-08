import type { Meta, StoryObj } from '@storybook/react-vite'
import type { Goal } from '../types/goal'
import { PathGoalsSection } from './PathGoalsSection'
import { withGoals, withArchivedPathGoals, MOCK_GOALS } from './story-helpers'

const ARCHIVED_PATH_GOALS: Goal[] = [
  {
    id: 'goal-declutter',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    name: 'Declutter every room',
    description: '',
    pathId: 'path-home',
    parentGoalId: null,
    order: 0,
    deadline: null,
    state: 'active',
    achievedOn: null,
    frog: false,
  },
]

const meta: Meta<typeof PathGoalsSection> = {
  title: 'Goals/PathGoalsSection',
  component: PathGoalsSection,
  args: { pathId: 'path-sport', readOnly: false },
}
export default meta

type Story = StoryObj<typeof PathGoalsSection>

/** The Goal tree as it renders inside the Path overview. */
export const WithData: Story = {
  decorators: [withGoals(MOCK_GOALS)],
}

export const EmptyState: Story = {
  decorators: [withGoals([])],
}

export const SingleTopLevelGoal: Story = {
  decorators: [withGoals([{ ...MOCK_GOALS[0], parentGoalId: null }])],
}

/** An archived Path's Goals render read-only — no New Goal, reorder, or row menu. */
export const ArchivedPathReadOnly: Story = {
  args: { pathId: 'path-home', readOnly: true },
  decorators: [withArchivedPathGoals(ARCHIVED_PATH_GOALS)],
}
