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

/**
 * `/today/:date` — the viewed day survives a refresh instead of always
 * snapping back to today. See docs/modules/today-edgecases.md #2.
 */
export const DeepLinkedDate: Story = {
  decorators: [withTodayData(MOCK_ACTIONS, undefined, '/today/2026-12-25')],
}

/** A malformed `:date` in the URL falls back to today instead of erroring. */
export const InvalidDeepLinkedDate: Story = {
  decorators: [withTodayData(MOCK_ACTIONS, undefined, '/today/not-a-date')],
}

/** Stored `actions` value is present but unparseable — recovery screen, not a silently-empty day. */
export const ActionsDataUnreadable: Story = {
  decorators: [seedCorruptActions()],
}

/** Stored `paths` value is present but unparseable. */
export const PathsDataUnreadable: Story = {
  decorators: [seedCorruptPaths()],
}