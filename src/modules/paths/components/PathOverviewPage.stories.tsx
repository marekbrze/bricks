import type { Meta, StoryObj } from '@storybook/react-vite'
import { PathOverviewPage } from './PathOverviewPage'
import {
  withPaths,
  withPathsAndVisions,
  withPathHub,
  withPathHubCorrupt,
  MOCK_PATHS,
  MOCK_VISIONS,
} from './story-helpers'

const meta: Meta<typeof PathOverviewPage> = {
  title: 'Paths/PathOverviewPage',
  component: PathOverviewPage,
}
export default meta

type Story = StoryObj<typeof PathOverviewPage>

/** The full hub: Vision summary, Stats row, and the inline Goal tree. */
export const WithData: Story = {
  decorators: [withPathHub(MOCK_PATHS, MOCK_VISIONS, undefined, undefined, '/paths/path-sport')],
}

/** No Goals under this Path — the Goals section shows its own empty state. */
export const NoGoals: Story = {
  decorators: [withPathHub(MOCK_PATHS, MOCK_VISIONS, [], undefined, '/paths/path-sport')],
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

/** Archived Path — restore banner on top, the Goal section read-only. */
export const ArchivedPath: Story = {
  decorators: [withPathHub(MOCK_PATHS, MOCK_VISIONS, undefined, undefined, '/paths/path-home')],
}

export const NotFound: Story = {
  decorators: [withPaths(MOCK_PATHS, '/paths/does-not-exist')],
}

/** Corrupt `goals` value — the overview shows the Goals recovery screen, not a wrong zero. */
export const GoalsDataUnreadable: Story = {
  decorators: [withPathHubCorrupt('goals')],
}

/** Corrupt `actions` value — the overview shows the Actions recovery screen. */
export const ActionsDataUnreadable: Story = {
  decorators: [withPathHubCorrupt('actions')],
}
