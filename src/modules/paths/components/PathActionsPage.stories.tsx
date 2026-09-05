import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  withActionsData,
  MOCK_ACTIONS,
  MOCK_GOALS,
  MOCK_PATHS,
} from '@/modules/actions/components/story-helpers'
import { PathActionsPage } from './PathActionsPage'

const meta: Meta<typeof PathActionsPage> = {
  title: 'Paths/PathActionsPage',
  component: PathActionsPage,
  parameters: {
    docs: {
      description: {
        component:
          'A Path’s Actions tab: this Path’s Goal groups (sub-Goals nested), its standalone ' +
          'Actions, then closed Goals still holding open work — the same groups the whole-app ' +
          'Actions view shows, scoped to one Path. Rows drag between Goal groups and onto the ' +
          'Standalone block; the row menu’s “Move to…” is the keyboard-accessible twin and ' +
          'reaches every other Path.',
      },
    },
  },
}
export default meta

type Story = StoryObj<typeof PathActionsPage>

/** The full picture: nested Goal groups, a deadline chip, standalone Actions, quick-add rows. */
export const WithData: Story = {
  decorators: [
    withActionsData(MOCK_ACTIONS, MOCK_GOALS, MOCK_PATHS, '/paths/path-sport/actions'),
  ],
}

/** A Path with no Goals and no Actions — the guided empty state plus a live quick-add row. */
export const EmptyPath: Story = {
  decorators: [withActionsData([], [], MOCK_PATHS, '/paths/path-craft/actions')],
}

/** Archived Path: same content, read-only — no quick-add, no New goal, no dragging. */
export const ArchivedPath: Story = {
  decorators: [
    withActionsData(MOCK_ACTIONS, MOCK_GOALS, MOCK_PATHS, '/paths/path-home/actions'),
  ],
}

/** An id that no longer resolves — the shared Path-not-found screen, not a blank tab. */
export const NotFound: Story = {
  decorators: [
    withActionsData(MOCK_ACTIONS, MOCK_GOALS, MOCK_PATHS, '/paths/does-not-exist/actions'),
  ],
}
