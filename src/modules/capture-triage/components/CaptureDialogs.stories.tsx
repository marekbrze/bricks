import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '@/components/ui/button'
import { PromoteToGoalDialog } from './PromoteToGoalDialog'
import { QuickCaptureButton } from './QuickCaptureButton'
import { withActions, withActionsNoPaths } from './story-helpers'

const meta: Meta = {
  title: 'CaptureTriage/Dialogs',
}
export default meta

type Story = StoryObj

export const Promote: Story = {
  decorators: [withActions([])],
  render: () => {
    const [open, setOpen] = useState(true)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open</Button>
        <PromoteToGoalDialog
          open={open}
          onOpenChange={setOpen}
          actionName="Buy a resistance band"
          onPromote={(data) => console.log('promote', data)}
        />
      </>
    )
  },
}

/** No Paths yet — the dialog's picker offers an inline "New Path" instead of a dead end. */
export const PromoteWithNoPaths: Story = {
  decorators: [withActionsNoPaths([])],
  render: () => {
    const [open, setOpen] = useState(true)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open</Button>
        <PromoteToGoalDialog
          open={open}
          onOpenChange={setOpen}
          actionName="Buy a resistance band"
          onPromote={(data) => console.log('promote', data)}
        />
      </>
    )
  },
}

/** The global capture affordance mounted in `AppHeader`. */
export const QuickCapture: Story = {
  decorators: [withActions([])],
  render: () => <QuickCaptureButton />,
}
