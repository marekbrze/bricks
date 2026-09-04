import type { Meta, StoryObj } from '@storybook/react-vite'
import { PathsPage } from './PathsPage'
import { withPaths, MOCK_PATHS } from './story-helpers'

const meta: Meta<typeof PathsPage> = {
  title: 'Paths/PathsPage',
  component: PathsPage,
}
export default meta

type Story = StoryObj<typeof PathsPage>

export const WithData: Story = {
  decorators: [withPaths(MOCK_PATHS)],
}

export const SinglePath: Story = {
  decorators: [withPaths([{ ...MOCK_PATHS[0], order: 0 }])],
}

export const EmptyState: Story = {
  decorators: [withPaths([])],
}

export const OnlyArchived: Story = {
  decorators: [withPaths(MOCK_PATHS.filter((p) => p.archived))],
}
