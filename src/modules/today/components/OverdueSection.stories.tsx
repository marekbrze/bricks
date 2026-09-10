import { useState } from 'react'
import { MemoryRouter } from 'react-router-dom'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor } from 'storybook/test'
import { ToastProvider } from '@/shared/components/toast/toast-context'
import type { Action } from '@/modules/capture-triage/types/action'
import { addDaysIso, todayLocalIso } from '@/shared/lib/date'
import { OverdueSection } from './OverdueSection'

const today = todayLocalIso()

function make(id: string, name: string, daysAgo: number, frog = false): Action {
  return {
    id,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    name,
    state: 'assigned',
    pathId: 'path-earnings',
    goalId: null,
    frog,
    scheduledDate: addDaysIso(today, -daysAgo),
    completedAt: null,
  }
}

const meta: Meta<typeof OverdueSection> = {
  title: 'Today/OverdueSection',
  decorators: [
    (Story) => (
      <MemoryRouter>
        <ToastProvider>
          <div className="max-w-[720px] p-4">
            <Story />
          </div>
        </ToastProvider>
      </MemoryRouter>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof OverdueSection>

function Harness({ initial }: { initial: Action[] }) {
  const [actions, setActions] = useState(initial)
  const drop = (action: Action) => setActions((prev) => prev.filter((a) => a.id !== action.id))
  return (
    <OverdueSection
      actions={actions}
      getPathName={() => 'Earnings'}
      onToggleDone={(action, done) => done && drop(action)}
      onReschedule={drop}
      onAbandon={drop}
      onMoveAllToToday={() => setActions([])}
    />
  )
}

export const Several: Story = {
  render: () => (
    <Harness
      initial={[
        make('o1', 'Send the overdue invoice', 3, true),
        make('o2', 'Book the physio appointment', 1),
        make('o3', 'Reply to the landlord', 8),
      ]}
    />
  ),
}

export const SingleRow: Story = {
  render: () => <Harness initial={[make('o1', 'Renew the domain', 2)]} />,
}

/** Each row can be abandoned in place — no need to reschedule it onto today first. */
export const AbandonARow: Story = {
  render: () => (
    <Harness
      initial={[make('o1', 'Send the overdue invoice', 3, true), make('o2', 'Reply to the landlord', 8)]}
    />
  ),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: /abandon “reply to the landlord”/i }))
    await waitFor(() =>
      expect(canvas.queryByText('Reply to the landlord')).not.toBeInTheDocument(),
    )
  },
}
