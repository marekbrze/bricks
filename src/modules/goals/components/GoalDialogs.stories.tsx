import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '@/components/ui/button'
import { GoalDialog } from './GoalDialog'
import { MoveGoalDialog } from './MoveGoalDialog'
import { DeleteGoalDialog } from './DeleteGoalDialog'
import { withGoals, MOCK_GOALS } from './story-helpers'

const meta: Meta = {
  title: 'Goals/Dialogs',
  decorators: [withGoals(MOCK_GOALS)],
}
export default meta

type Story = StoryObj

export const NewGoal: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open</Button>
        <GoalDialog
          open={open}
          onOpenChange={setOpen}
          title="New Goal"
          description="Top-level under “Sport”."
          submitLabel="Create Goal"
          onSubmit={(data) => console.log('create', data)}
        />
      </>
    )
  },
}

export const EditGoal: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open</Button>
        <GoalDialog
          open={open}
          onOpenChange={setOpen}
          title="Edit Goal"
          description="Name, description, deadline."
          submitLabel="Save"
          initial={{
            name: 'Pull-up program',
            description: 'Progressive overload toward a strict pull-up, then weighted work.',
            deadline: '2026-11-01',
          }}
          onSubmit={(data) => console.log('edit', data)}
        />
      </>
    )
  },
}

export const MoveToPath: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open</Button>
        <MoveGoalDialog
          open={open}
          onOpenChange={setOpen}
          goalName="Pull-up program"
          currentPathId="path-sport"
          onMove={(pathId) => console.log('move to', pathId)}
        />
      </>
    )
  },
}

export const DeleteWithContents: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    return (
      <>
        <Button variant="destructive" onClick={() => setOpen(true)}>
          Open
        </Button>
        <DeleteGoalDialog
          open={open}
          onOpenChange={setOpen}
          goalName="Pull-up program"
          counts={{ subGoals: 2, actions: 5 }}
          onConfirm={() => console.log('deleted')}
        />
      </>
    )
  },
}

export const DeleteEmptyGoal: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    return (
      <>
        <Button variant="destructive" onClick={() => setOpen(true)}>
          Open
        </Button>
        <DeleteGoalDialog
          open={open}
          onOpenChange={setOpen}
          goalName="Draft Goal"
          counts={{ subGoals: 0, actions: 0 }}
          onConfirm={() => console.log('deleted')}
        />
      </>
    )
  },
}
