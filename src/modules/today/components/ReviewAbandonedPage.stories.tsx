import type { Meta, StoryObj } from '@storybook/react-vite'
import { ReviewAbandonedPage } from './ReviewAbandonedPage'
import { withTodayData, MOCK_ACTIONS } from './story-helpers'

const meta: Meta<typeof ReviewAbandonedPage> = {
  title: 'Today/ReviewAbandonedPage',
  component: ReviewAbandonedPage,
}
export default meta

type Story = StoryObj<typeof ReviewAbandonedPage>

export const WithData: Story = {
  decorators: [withTodayData(MOCK_ACTIONS, undefined, '/today/abandoned')],
}

export const EmptyState: Story = {
  decorators: [
    withTodayData(
      MOCK_ACTIONS.filter((a) => a.state !== 'abandoned'),
      undefined,
      '/today/abandoned',
    ),
  ],
}
