import type { Meta, StoryObj } from '@storybook/react-vite'
import { LogPage } from './LogPage'
import {
  withWinLogData,
  seedCorruptActions,
  MOCK_PATHS,
  MOCK_GOALS,
  MOCK_ACTIONS,
} from './story-helpers'

const meta: Meta<typeof LogPage> = {
  title: 'WinLog/LogPage',
  component: LogPage,
}
export default meta

type Story = StoryObj<typeof LogPage>

export const WithData: Story = {
  decorators: [withWinLogData()],
}

/** No completed Actions and no achieved Goals anywhere — the global empty state, no filter chips. */
export const NoWinsAtAll: Story = {
  decorators: [
    withWinLogData(
      MOCK_ACTIONS.filter((a) => a.state !== 'done'),
      MOCK_GOALS.map((g) => (g.state === 'achieved' ? { ...g, state: 'active', achievedOn: null } : g)),
      MOCK_PATHS,
    ),
  ],
}

/**
 * Wins exist elsewhere, but "Craft" has none — click its chip to see the
 * scoped empty message (graph still renders, all-empty cells) instead of
 * the Path silently vanishing from the filter.
 */
export const NoWinsForFilteredPath: Story = {
  decorators: [
    withWinLogData(
      MOCK_ACTIONS.filter((a) => a.pathId !== 'path-craft'),
      MOCK_GOALS,
      MOCK_PATHS,
    ),
  ],
}

/** Stored `actions` value is present but unparseable. */
export const ActionsDataUnreadable: Story = {
  decorators: [seedCorruptActions()],
}
