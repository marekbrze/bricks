import type { Meta, StoryObj } from '@storybook/react-vite'
import { TodayPage } from './TodayPage'
import { withTodayData, seedCorruptActions, seedCorruptPaths, MOCK_ACTIONS } from './story-helpers'

const meta: Meta<typeof TodayPage> = {
  title: 'Today/TodayPage',
  component: TodayPage,
}
export default meta

type Story = StoryObj<typeof TodayPage>

export const WithData: Story = {
  decorators: [withTodayData(MOCK_ACTIONS)],
}

/** No Paths exist at all — Today has nothing to group by. */
export const NoPaths: Story = {
  decorators: [withTodayData([], [])],
}

/** Paths exist, but nothing is scheduled for today — the day-wide empty state, not N empty Path sections. */
export const NothingScheduledToday: Story = {
  decorators: [withTodayData(MOCK_ACTIONS.filter((a) => a.scheduledDate === null))],
}

/** Stored `actions` value is present but unparseable — recovery screen, not a silently-empty day. */
export const ActionsDataUnreadable: Story = {
  decorators: [seedCorruptActions()],
}

/** Stored `paths` value is present but unparseable. */
export const PathsDataUnreadable: Story = {
  decorators: [seedCorruptPaths()],
}