import type { Meta, StoryObj } from '@storybook/react-vite'
import { TriagePage } from './TriagePage'
import { withActions, withActionsNoPaths, MOCK_INBOX_ACTIONS } from './story-helpers'

const meta: Meta<typeof TriagePage> = {
  title: 'CaptureTriage/TriagePage',
  component: TriagePage,
}
export default meta

type Story = StoryObj<typeof TriagePage>

export const InProgress: Story = {
  decorators: [withActions(MOCK_INBOX_ACTIONS, '/capture-triage/triage')],
}

export const SingleItem: Story = {
  decorators: [withActions([MOCK_INBOX_ACTIONS[0]], '/capture-triage/triage')],
}

/** Every Inbox item already resolved this session — the completion state. */
export const InboxZero: Story = {
  decorators: [withActions([], '/capture-triage/triage')],
}

/** No Paths exist yet — assign and promote both explain a Path is needed first. */
export const NoPathsYet: Story = {
  decorators: [withActionsNoPaths(MOCK_INBOX_ACTIONS, '/capture-triage/triage')],
}
