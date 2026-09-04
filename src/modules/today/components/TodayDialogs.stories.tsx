import { useState } from 'react'
import { MemoryRouter } from 'react-router-dom'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '@/components/ui/button'
import { AddToTodayDialog } from './AddToTodayDialog'
import { ScheduleActionDialog } from './ScheduleActionDialog'

// AddToTodayDialog's empty state links to /capture-triage — needs a Router.
const meta: Meta = {
  title: 'Today/Dialogs',
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
}
export default meta

type Story = StoryObj

const getPathName = (pathId: string | null) =>
  pathId === 'path-sport' ? 'Sport' : pathId === 'path-earnings' ? 'Earnings' : 'Standalone'

function mockAction(id: string, name: string, pathId: string | null) {
  const now = new Date().toISOString()
  return {
    id,
    createdAt: now,
    updatedAt: now,
    name,
    state: 'assigned' as const,
    pathId,
    goalId: null,
    frog: false,
    scheduledDate: null,
    completedAt: null,
  }
}

export const AddToToday: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open</Button>
        <AddToTodayDialog
          open={open}
          onOpenChange={setOpen}
          dateIso="2026-09-04"
          actions={[
            mockAction('a1', 'Draft a list of 10 cold-outreach targets', 'path-earnings'),
            mockAction('a2', 'Sharpen the kitchen knives', null),
          ]}
          totalUnscheduledCount={2}
          getPathName={getPathName}
          onPick={(a) => console.log('picked', a)}
        />
      </>
    )
  },
}

/** Nothing at all is waiting to be scheduled, anywhere. */
export const AddToTodayEmpty: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open</Button>
        <AddToTodayDialog
          open={open}
          onOpenChange={setOpen}
          dateIso="2026-09-04"
          actions={[]}
          totalUnscheduledCount={0}
          getPathName={getPathName}
          onPick={(a) => console.log('picked', a)}
        />
      </>
    )
  },
}

/**
 * Opened scoped to one Path with nothing waiting *for that Path* — but other
 * Paths do have unscheduled Actions. See docs/modules/today-edgecases.md #4.
 */
export const AddToTodayEmptyForThisPathOnly: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open</Button>
        <AddToTodayDialog
          open={open}
          onOpenChange={setOpen}
          dateIso="2026-09-04"
          actions={[]}
          pathName="Sport"
          totalUnscheduledCount={3}
          getPathName={getPathName}
          onPick={(a) => console.log('picked', a)}
        />
      </>
    )
  },
}

export const MoveToAnotherDay: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open</Button>
        <ScheduleActionDialog
          open={open}
          onOpenChange={setOpen}
          actionName="Tempo run, 5K pace"
          initialDate="2026-09-04"
          onSchedule={(date) => console.log('moved to', date)}
        />
      </>
    )
  },
}

export const RescheduleAbandoned: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open</Button>
        <ScheduleActionDialog
          open={open}
          onOpenChange={setOpen}
          actionName="Repaint the hallway"
          submitLabel="Reschedule"
          onSchedule={(date) => console.log('rescheduled to', date)}
        />
      </>
    )
  },
}
