import type { Meta, StoryObj } from '@storybook/react-vite'
import { withEssentials, MOCK_ESSENTIALS } from './story-helpers'
import { EssentialsSummary } from './EssentialsSummary'

const meta: Meta<typeof EssentialsSummary> = {
  title: 'Essentials/EssentialsSummary',
  component: EssentialsSummary,
  parameters: {
    docs: {
      description: {
        component:
          'Embedded on the Path overview between Wins and Goals — a read-only count of the ' +
          'Path’s Essentials and how many completions have been logged for them, in the same ' +
          'accumulation spirit as the win balance.',
      },
    },
  },
}
export default meta

type Story = StoryObj<typeof EssentialsSummary>

/** A Path with essentials and logged history. */
export const WithData: Story = {
  decorators: [withEssentials(MOCK_ESSENTIALS, '/paths/path-sport', '/paths/:pathId')],
  render: () => <EssentialsSummary pathId="path-sport" />,
}

/** A Path that has none yet — the one-line prompt into the tab. */
export const NoEssentials: Story = {
  decorators: [withEssentials([], '/paths/path-craft', '/paths/:pathId')],
  render: () => <EssentialsSummary pathId="path-craft" />,
}
