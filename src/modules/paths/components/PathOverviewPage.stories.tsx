import type { Meta, StoryObj } from '@storybook/react-vite'
import { PathOverviewPage } from './PathOverviewPage'
import { withPaths, MOCK_PATHS } from './story-helpers'

const meta: Meta<typeof PathOverviewPage> = {
  title: 'Paths/PathOverviewPage',
  component: PathOverviewPage,
}
export default meta

type Story = StoryObj<typeof PathOverviewPage>

export const WithData: Story = {
  decorators: [withPaths(MOCK_PATHS, '/paths/path-sport')],
}

export const NoAchievements: Story = {
  decorators: [
    withPaths(
      [{ ...MOCK_PATHS[0], achievements: [], mockGoalCount: 0, visionSnippet: '' }],
      '/paths/path-sport',
    ),
  ],
}

export const AllAchieved: Story = {
  decorators: [
    withPaths(
      [
        {
          ...MOCK_PATHS[0],
          achievements: MOCK_PATHS[0].achievements.map((a) => ({
            ...a,
            state: 'achieved' as const,
            achievedOn: a.achievedOn ?? '2026-08-01',
          })),
        },
      ],
      '/paths/path-sport',
    ),
  ],
}

export const ArchivedPath: Story = {
  decorators: [withPaths(MOCK_PATHS, '/paths/path-home')],
}

export const NotFound: Story = {
  decorators: [withPaths(MOCK_PATHS, '/paths/does-not-exist')],
}
