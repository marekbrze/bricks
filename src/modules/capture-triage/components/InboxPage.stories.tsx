import type { Meta, StoryObj } from '@storybook/react-vite'
import { InboxPage } from './InboxPage'
import { withActions, seedCorruptActions, MOCK_INBOX_ACTIONS } from './story-helpers'

const meta: Meta<typeof InboxPage> = {
  title: 'CaptureTriage/InboxPage',
  component: InboxPage,
}
export default meta

type Story = StoryObj<typeof InboxPage>

export const WithData: Story = {
  decorators: [withActions(MOCK_INBOX_ACTIONS)],
}

export const EmptyState: Story = {
  decorators: [withActions([])],
}

/** Stored value is present but unparseable — recovery screen, not the empty state. */
export const DataUnreadable: Story = {
  decorators: [seedCorruptActions()],
}
