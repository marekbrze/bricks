import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import { ToastProvider } from '@/shared/components/toast/toast-context'
import { Toaster } from '@/shared/components/toast/Toaster'
import { Button } from '@/components/ui/button'
import { EssentialDialog } from './EssentialDialog'
import { LogEssentialDialog } from './LogEssentialDialog'
import { DeleteEssentialDialog } from './DeleteEssentialDialog'

const meta: Meta = {
  title: 'Essentials/Dialogs',
  decorators: [
    (Story) => (
      <MemoryRouter>
        <ToastProvider>
          <div className="mx-auto max-w-[1200px] p-4">
            <Story />
          </div>
          <Toaster />
        </ToastProvider>
      </MemoryRouter>
    ),
  ],
}
export default meta

type Story = StoryObj

export const NewEssential: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open</Button>
        <EssentialDialog
          open={open}
          onOpenChange={setOpen}
          title="New Essential"
          description="A necessary deed for “Sport”."
          submitLabel="Create"
          onSubmit={(data) => console.log('create', data)}
        />
      </>
    )
  },
}

export const EditEssential: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open</Button>
        <EssentialDialog
          open={open}
          onOpenChange={setOpen}
          title="Edit Essential"
          description="Name and the one-line reminder."
          submitLabel="Save"
          initial={{
            name: 'Hang from a bar — 60s total across the day',
            detail: 'Grip + shoulders. Split it however you like.',
          }}
          onSubmit={(data) => console.log('edit', data)}
        />
      </>
    )
  },
}

export const LogWithComment: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open</Button>
        <LogEssentialDialog
          open={open}
          onOpenChange={setOpen}
          essentialName="Call five prospective clients"
          onLog={(note) => console.log('logged', note)}
        />
      </>
    )
  },
}

export const DeleteWithHistory: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    return (
      <>
        <Button variant="destructive" onClick={() => setOpen(true)}>
          Open
        </Button>
        <DeleteEssentialDialog
          open={open}
          onOpenChange={setOpen}
          essentialName="Hang from a bar"
          completionsTotal={128}
          onConfirm={() => console.log('deleted')}
        />
      </>
    )
  },
}

export const DeleteNeverLogged: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    return (
      <>
        <Button variant="destructive" onClick={() => setOpen(true)}>
          Open
        </Button>
        <DeleteEssentialDialog
          open={open}
          onOpenChange={setOpen}
          essentialName="Draft essential"
          completionsTotal={0}
          onConfirm={() => console.log('deleted')}
        />
      </>
    )
  },
}
