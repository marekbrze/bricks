import type { Meta, StoryObj } from '@storybook/react-vite'
import { ActionsPage } from './ActionsPage'
import { withActionsData, seedCorruptActions, MOCK_PATHS, MOCK_ACTIONS } from './story-helpers'
import type { Action } from '@/modules/capture-triage/types/action'

const meta: Meta<typeof ActionsPage> = {
  title: 'Actions/ActionsPage',
  component: ActionsPage,
  parameters: {
    docs: {
      description: {
        component:
          'The flat whole-app task list: Inbox group on top, one section per active Path ' +
          '(Goal groups with nested sub-Goals, standalone Actions after), “Show completed” toggle. ' +
          'Use the toggle inside a story to reveal settled rows.',
      },
    },
  },
}
export default meta

type Story = StoryObj<typeof ActionsPage>

/** Full picture: Inbox group, Goal groups with sub-Goals, standalone Actions, done/abandoned hidden. */
export const WithData: Story = {
  decorators: [withActionsData()],
}

/** No Paths at all — the guided empty state pointing at `/paths`. */
export const NoPaths: Story = {
  decorators: [withActionsData([], [], [])],
}

/** A Path with no Goals and no Actions — still renders, carrying only its quick-add rows. */
export const EmptyPath: Story = {
  decorators: [withActionsData([], [], [MOCK_PATHS[0]].map((p) => ({ ...p, achievements: [] })))],
}

/** Stored `actions` value is present but unparseable — recovery screen, not a silently-empty list. */
export const ActionsDataUnreadable: Story = {
  decorators: [seedCorruptActions()],
}

/**
 * Two Actions point at a Goal that no longer exists — the dimmed "Unassigned"
 * fallback group under the Inbox renders them as full, actionable rows
 * (docs/modules/actions-edgecases.md #2/#3).
 */
export const OrphanedActions: Story = {
  decorators: [
    withActionsData([
      ...MOCK_ACTIONS,
      orphan('action-orphan-open', 'Follow up on the stalled refund'),
      orphan('action-orphan-done', 'Order new nameplate', { state: 'done', completedAt: new Date().toISOString() }),
    ]),
  ],
}

function orphan(id: string, name: string, overrides: Partial<Action> = {}): Action {
  const nowIso = new Date().toISOString()
  return {
    id,
    createdAt: nowIso,
    updatedAt: nowIso,
    name,
    state: 'assigned',
    pathId: 'path-sport',
    goalId: 'goal-does-not-exist',
    frog: false,
    scheduledDate: null,
    completedAt: null,
    ...overrides,
  }
}
