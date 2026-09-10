import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  withEssentials,
  seedCorruptEssentials,
  MOCK_ESSENTIALS,
} from './story-helpers'
import { EssentialsPage } from './EssentialsPage'

const meta: Meta<typeof EssentialsPage> = {
  title: 'Essentials/EssentialsPage',
  component: EssentialsPage,
  parameters: {
    docs: {
      description: {
        component:
          'The Path’s Essentials tab — define the few Absolutely Necessary Deeds for this Path, ' +
          'reorder them, and log each completion (which creates an already-done Action). ' +
          'Free-tracked: each row shows today’s count and its all-time count, no cadence target.',
      },
    },
  },
}
export default meta

type Story = StoryObj<typeof EssentialsPage>

/** A Path with a primal-movement set and real logged history from the mock Actions. */
export const WithData: Story = {
  decorators: [withEssentials(MOCK_ESSENTIALS, '/paths/path-sport/essentials')],
}

/** The sales example — Schwarzenegger’s own — on the earnings Path. */
export const SalesPath: Story = {
  decorators: [withEssentials(MOCK_ESSENTIALS, '/paths/path-earnings/essentials')],
}

/** No essentials yet — the concept, a call to action, and seed examples. */
export const EmptyState: Story = {
  decorators: [withEssentials([], '/paths/path-craft/essentials')],
}

/** Archived Path — read-only: no New essential, no Log, no reorder, restore banner. */
export const ArchivedPath: Story = {
  decorators: [withEssentials(MOCK_ESSENTIALS, '/paths/path-home/essentials')],
}

/** Corrupt `essentials` value — the recovery screen, distinct from the empty state. */
export const DataUnreadable: Story = {
  decorators: [seedCorruptEssentials()],
}

/** A Path id that no longer resolves — the shared Path-not-found screen. */
export const NotFound: Story = {
  decorators: [withEssentials(MOCK_ESSENTIALS, '/paths/does-not-exist/essentials')],
}
