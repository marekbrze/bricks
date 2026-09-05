import type { Meta, StoryObj } from '@storybook/react-vite'
import { QuickCaptureButton } from './QuickCaptureButton'
import { withActions } from './story-helpers'

const meta: Meta = {
  title: 'CaptureTriage/Dialogs',
}
export default meta

type Story = StoryObj

/** The global capture affordance mounted in `AppHeader`. */
export const QuickCapture: Story = {
  decorators: [withActions([])],
  render: () => <QuickCaptureButton />,
}
