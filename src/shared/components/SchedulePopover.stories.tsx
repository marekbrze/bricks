import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, screen, userEvent, waitFor } from 'storybook/test'
import { addDaysIso, formatDayLabel, todayLocalIso } from '@/shared/lib/date'
import { SchedulePopover, SchedulePopoverPanel } from './SchedulePopover'

const meta: Meta<typeof SchedulePopover> = {
  title: 'Shared/SchedulePopover',
}
export default meta

type Story = StoryObj<typeof SchedulePopover>

function Harness({ initial = null }: { initial?: string | null }) {
  const [value, setValue] = useState<string | null>(initial)
  return (
    <div className="flex flex-col items-start gap-3 p-4">
      <SchedulePopover value={value} onChange={setValue} />
      <p className="text-sm text-muted-foreground">
        Selected: {value ? formatDayLabel(value) : 'no date'}
      </p>
    </div>
  )
}

export const Default: Story = {
  render: () => <Harness />,
}

export const WithDatePreselected: Story = {
  render: () => <Harness initial={addDaysIso(todayLocalIso(), 2)} />,
}

/** The bare panel, as embedded in ScheduleActionDialog's body. */
export const Panel: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>(todayLocalIso())
    return (
      <div className="max-w-72 p-4">
        <SchedulePopoverPanel value={value} onSelect={setValue} />
      </div>
    )
  },
}

/** Opening the popover and picking "Tomorrow" resolves to the right ISO day. */
export const PickTomorrow: Story = {
  render: () => <Harness />,
  play: async () => {
    await userEvent.click(screen.getByRole('button', { name: /set a due date/i }))
    await userEvent.click(await screen.findByRole('button', { name: /^Tomorrow/ }))
    await waitFor(() =>
      expect(screen.getByText(`Selected: ${formatDayLabel(addDaysIso(todayLocalIso(), 1))}`)).toBeInTheDocument(),
    )
  },
}
