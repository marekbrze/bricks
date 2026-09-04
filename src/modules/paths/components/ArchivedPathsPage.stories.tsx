import type { Meta, StoryObj } from '@storybook/react-vite'
import { ArchivedPathsPage } from './ArchivedPathsPage'
import { withPaths, MOCK_PATHS } from './story-helpers'

const meta: Meta<typeof ArchivedPathsPage> = {
  title: 'Paths/ArchivedPathsPage',
  component: ArchivedPathsPage,
}
export default meta

type Story = StoryObj<typeof ArchivedPathsPage>

export const WithArchived: Story = {
  decorators: [
    withPaths(
      [
        ...MOCK_PATHS.filter((p) => p.archived),
        { ...MOCK_PATHS[2], id: 'path-old', name: 'Learn piano', archived: true, archivedAt: '2026-02-01T09:00:00.000Z' },
      ],
      '/paths/archived',
    ),
  ],
}

export const Empty: Story = {
  decorators: [withPaths(MOCK_PATHS.filter((p) => !p.archived), '/paths/archived')],
}
