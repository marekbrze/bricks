import type { Meta, StoryObj } from '@storybook/react-vite'
import { SchedulePage } from './SchedulePage'
import { withTodayData, MOCK_ACTIONS } from './story-helpers'

const meta: Meta<typeof SchedulePage> = {
  title: 'Today/SchedulePage',
  component: SchedulePage,
}
export default meta

type Story = StoryObj<typeof SchedulePage>

export const WithData: Story = {
  decorators: [withTodayData(MOCK_ACTIONS, undefined, '/today/schedule')],
}

/** No upcoming day has anything scheduled — distinct from a calendar showing empty days. */
export const NothingAhead: Story = {
  decorators: [
    withTodayData(
      MOCK_ACTIONS.filter((a) => a.scheduledDate === null),
      undefined,
      '/today/schedule',
    ),
  ],
}
