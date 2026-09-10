import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor } from 'storybook/test'
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

/**
 * Achieved Goals sink below the open ones and collapse by default (ADR 0046) —
 * `path-sport` carries one achieved Goal ("Daily mobility routine"). Click
 * "Achieved" to expand.
 */
export const WithAchievedGoals: Story = {
  decorators: [withGoals(MOCK_GOALS)],
  play: async ({ canvas }) => {
    // Open Goals render; the achieved one is tucked behind the collapsed toggle.
    expect(canvas.getByRole('link', { name: 'Pull-up program' })).toBeInTheDocument()
    expect(canvas.queryByRole('link', { name: 'Daily mobility routine' })).not.toBeInTheDocument()

    const toggle = canvas.getByRole('button', { name: /achieved/i })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(toggle)

    await waitFor(() =>
      expect(canvas.getByRole('link', { name: 'Daily mobility routine' })).toBeInTheDocument(),
    )
  },
}

/** Path where every top-level Goal is achieved — the open list falls back to a note. */
export const AllGoalsAchieved: Story = {
  decorators: [
    withGoals([
      { ...MOCK_GOALS[0], parentGoalId: null, state: 'achieved', achievedOn: '2026-06-01' },
      { ...MOCK_GOALS[3], state: 'achieved', achievedOn: '2026-07-15' },
    ]),
  ],
}

/** An archived Path's Goals render read-only — no New Goal, reorder, or row menu. */
export const ArchivedPathReadOnly: Story = {
  args: { pathId: 'path-home', readOnly: true },
  decorators: [withArchivedPathGoals(ARCHIVED_PATH_GOALS)],
}
