import type { Meta, StoryObj } from '@storybook/react-vite'
import type { Goal } from '../types/goal'
import { GoalTreePage } from './GoalTreePage'
import {
  withGoals,
  withArchivedPathGoals,
  seedCorruptGoals,
  seedCorruptActions,
  MOCK_GOALS,
} from './story-helpers'

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
    mockWinDays: {},
  },
]

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

/** Corrupt `actions` shouldn't silently show `0 Actions` everywhere — same recovery screen as `paths`/`capture-triage`. */
export const ActionsDataUnreadable: Story = {
  decorators: [seedCorruptActions()],
}

/** An archived Path's Goals render read-only — restore banner, no create/edit/reorder/delete controls. */
export const ArchivedPathReadOnly: Story = {
  decorators: [withArchivedPathGoals(ARCHIVED_PATH_GOALS)],
}
