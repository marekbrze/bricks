import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor } from 'storybook/test'
import type { Action } from '@/modules/capture-triage/types/action'
import { addDaysIso, todayLocalIso } from '@/shared/lib/date'
import { TodayPage } from './TodayPage'
import {
  withTodayData,
  seedCorruptActions,
  seedCorruptPaths,
  MOCK_ACTIONS,
  MOCK_PATHS,
} from './story-helpers'

const today = todayLocalIso()

/** Two Actions whose scheduled day has already passed — the Overdue bucket. */
const OVERDUE_ACTIONS: Action[] = [
  {
    id: 'overdue-1',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    name: 'Send the overdue invoice',
    state: 'assigned',
    pathId: 'path-earnings',
    goalId: null,
    frog: true,
    scheduledDate: addDaysIso(today, -3),
    completedAt: null,
  },
  {
    id: 'overdue-2',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    name: 'Book the physio appointment',
    state: 'assigned',
    pathId: 'path-sport',
    goalId: null,
    frog: false,
    scheduledDate: addDaysIso(today, -1),
    completedAt: null,
  },
]

const meta: Meta<typeof TodayPage> = {
  title: 'Today/TodayPage',
  component: TodayPage,
}
export default meta

type Story = StoryObj<typeof TodayPage>

export const WithData: Story = {
  decorators: [withTodayData(MOCK_ACTIONS)],
}

/** No Paths exist at all — Today has nothing to group by. */
export const NoPaths: Story = {
  decorators: [withTodayData([], [])],
}

/** Paths exist, but nothing is scheduled for today — the day-wide empty state, not N empty Path sections. */
export const NothingScheduledToday: Story = {
  decorators: [withTodayData(MOCK_ACTIONS.filter((a) => a.scheduledDate === null))],
}

/**
 * `/today/:date` — the viewed day survives a refresh instead of always
 * snapping back to today. See docs/modules/today-edgecases.md #2.
 */
export const DeepLinkedDate: Story = {
  decorators: [withTodayData(MOCK_ACTIONS, undefined, '/today/2026-12-25')],
}

/** A malformed `:date` in the URL falls back to today instead of erroring. */
export const InvalidDeepLinkedDate: Story = {
  decorators: [withTodayData(MOCK_ACTIONS, undefined, '/today/not-a-date')],
}

/**
 * Overdue Actions surface in a dedicated section above the Path sections —
 * only when the viewed day is today. Each row reschedules on its own; the
 * header's "Move all to today" clears the whole bucket in one undoable step.
 */
export const WithOverdue: Story = {
  decorators: [withTodayData([...MOCK_ACTIONS, ...OVERDUE_ACTIONS])],
}

/** The Overdue section is hidden on any day that isn't today. */
export const OverdueHiddenOnOtherDays: Story = {
  decorators: [withTodayData([...MOCK_ACTIONS, ...OVERDUE_ACTIONS], undefined, '/today/2026-12-25')],
}

/**
 * Overdue work exists but nothing is scheduled *exactly* today — the day
 * isn't really empty, so the big "Nothing scheduled" empty state is replaced
 * by one quiet line under the Overdue section. See docs/modules/today-edgecases.md #14.
 */
export const OverdueButNothingToday: Story = {
  decorators: [withTodayData([...OVERDUE_ACTIONS])],
  play: async ({ canvas }) => {
    expect(await canvas.findByRole('heading', { name: /overdue/i })).toBeInTheDocument()
    expect(canvas.getByText(/nothing new scheduled/i)).toBeInTheDocument()
    expect(canvas.queryByRole('heading', { name: /nothing scheduled for/i })).not.toBeInTheDocument()
  },
}

/**
 * An Action on an *archived* Path is dropped from the day view entirely — it
 * has no section to render in. Here `overdue-archived` sits on the archived
 * "Home & calm" Path: it must not appear in the Overdue bucket, and the
 * remaining `overdue-2` (active Path) still does. See docs/modules/today-edgecases.md #13.
 */
export const ArchivedPathActionsExcluded: Story = {
  decorators: [
    withTodayData(
      [
        ...OVERDUE_ACTIONS,
        {
          id: 'overdue-archived',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
          name: 'Repaint the hallway',
          state: 'assigned',
          pathId: 'path-home',
          goalId: null,
          frog: false,
          scheduledDate: addDaysIso(today, -2),
          completedAt: null,
        },
      ],
      MOCK_PATHS, // includes the archived "Home & calm"
    ),
  ],
  play: async ({ canvas }) => {
    expect(await canvas.findByRole('heading', { name: /overdue/i })).toBeInTheDocument()
    expect(canvas.getByText('Book the physio appointment')).toBeInTheDocument()
    expect(canvas.queryByText('Repaint the hallway')).not.toBeInTheDocument()
  },
}

/** "Move all to today" empties the Overdue section and shows an Undo toast. */
export const MoveAllOverdueToToday: Story = {
  decorators: [withTodayData([...MOCK_ACTIONS, ...OVERDUE_ACTIONS])],
  play: async ({ canvas }) => {
    expect(await canvas.findByRole('heading', { name: /overdue/i })).toBeInTheDocument()
    await userEvent.click(canvas.getByRole('button', { name: /move all to today/i }))
    await waitFor(() =>
      expect(canvas.queryByRole('heading', { name: /overdue/i })).not.toBeInTheDocument(),
    )
    expect(await canvas.findByText(/moved to today/i)).toBeInTheDocument()
  },
}

/** Stored `actions` value is present but unparseable — recovery screen, not a silently-empty day. */
export const ActionsDataUnreadable: Story = {
  decorators: [seedCorruptActions()],
}

/** Stored `paths` value is present but unparseable. */
export const PathsDataUnreadable: Story = {
  decorators: [seedCorruptPaths()],
}