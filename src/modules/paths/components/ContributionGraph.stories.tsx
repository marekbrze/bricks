import type { Meta, StoryObj } from '@storybook/react-vite'
import { ContributionGraph } from './ContributionGraph'
import { MOCK_PATHS, Frame } from './story-helpers'

const meta: Meta<typeof ContributionGraph> = {
  title: 'Paths/ContributionGraph',
  component: ContributionGraph,
  decorators: [(Story) => <Frame><Story /></Frame>],
}
export default meta

type Story = StoryObj<typeof ContributionGraph>

export const Full: Story = {
  args: { winDays: MOCK_PATHS[0].winDays, weeks: 26, label: 'Sport wins' },
}

export const Compact: Story = {
  args: { winDays: MOCK_PATHS[0].winDays, weeks: 16, compact: true, label: 'Sport wins' },
}

export const NoWins: Story = {
  args: { winDays: {}, weeks: 26, label: 'New Path wins' },
}
