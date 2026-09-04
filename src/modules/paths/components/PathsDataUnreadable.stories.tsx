import type { Meta, StoryObj } from '@storybook/react-vite'
import { PathsDataUnreadable } from './PathsDataUnreadable'
import { Frame } from './story-helpers'

const meta: Meta<typeof PathsDataUnreadable> = {
  title: 'Paths/PathsDataUnreadable',
  component: PathsDataUnreadable,
  decorators: [(Story) => <Frame><Story /></Frame>],
}
export default meta

type Story = StoryObj<typeof PathsDataUnreadable>

export const Default: Story = {
  args: { onReset: () => console.log('reset') },
}
