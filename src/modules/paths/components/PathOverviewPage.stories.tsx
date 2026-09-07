import type { Meta, StoryObj } from '@storybook/react-vite'
import { PathOverviewPage } from './PathOverviewPage'
import { withPaths, withPathsAndVisions, MOCK_PATHS } from './story-helpers'
import { MOCK_VISIONS } from '@/modules/vision/data/mock'

const meta: Meta<typeof PathOverviewPage> = {
  title: 'Paths/PathOverviewPage',
  component: PathOverviewPage,
}
export default meta

type Story = StoryObj<typeof PathOverviewPage>

export const WithData: Story = {
  decorators: [withPathsAndVisions(MOCK_PATHS, MOCK_VISIONS, '/paths/path-sport', '/paths/:pathId')],
}

/** The summary card shows no achievements line while the board holds none. */
export const NoAchievements: Story = {
  decorators: [
    withPathsAndVisions(
      [{ ...MOCK_PATHS[0], mockGoalCount: 0, visionSnippet: '' }],
      [
        {
          id: 'vision-no-achievements',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          pathId: 'path-sport',
          tiles: [
            {
              id: 'vision-no-ach-note-1',
              type: 'note',
              text: 'Move without pain, feel strong and light.',
            },
          ],
        },
      ],
      '/paths/path-sport',
      '/paths/:pathId',
    ),
  ],
}

/** Every achievement tile on the board achieved — the summary reports 5/5. */
export const AllAchieved: Story = {
  decorators: [
    withPathsAndVisions(
      [MOCK_PATHS[0]],
      [
        {
          ...MOCK_VISIONS[0],
          tiles: MOCK_VISIONS[0].tiles.map((tile) =>
            tile.type === 'achievement'
              ? { ...tile, state: 'achieved' as const, achievedOn: tile.achievedOn ?? '2026-08-01' }
              : tile,
          ),
        },
      ],
      '/paths/path-sport',
      '/paths/:pathId',
    ),
  ],
}

export const ArchivedPath: Story = {
  decorators: [withPathsAndVisions(MOCK_PATHS, MOCK_VISIONS, '/paths/path-home', '/paths/:pathId')],
}

export const NotFound: Story = {
  decorators: [withPaths(MOCK_PATHS, '/paths/does-not-exist')],
}
