import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '@/components/ui/button'
import { NewPathDialog } from './NewPathDialog'
import { DeletePathDialog } from './DeletePathDialog'
import { RenamePathDialog } from './RenamePathDialog'
import { Frame } from './story-helpers'

const meta: Meta = {
  title: 'Paths/Dialogs',
  decorators: [(Story) => <Frame><Story /></Frame>],
}
export default meta

type Story = StoryObj

export const NewPath: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open</Button>
        <NewPathDialog
          open={open}
          onOpenChange={setOpen}
          onCreate={(name, achievements) => console.log('create', name, achievements)}
        />
      </>
    )
  },
}

export const DeletePathWithContents: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    return (
      <>
        <Button variant="destructive" onClick={() => setOpen(true)}>
          Open
        </Button>
        <DeletePathDialog
          open={open}
          onOpenChange={setOpen}
          pathName="Sport"
          counts={{ visionTiles: 6, achievements: 5, goals: 3, actions: 24 }}
          onConfirm={() => console.log('deleted')}
        />
      </>
    )
  },
}

export const DeleteEmptyPath: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    return (
      <>
        <Button variant="destructive" onClick={() => setOpen(true)}>
          Open
        </Button>
        <DeletePathDialog
          open={open}
          onOpenChange={setOpen}
          pathName="Draft Path"
          counts={{ visionTiles: 0, achievements: 0, goals: 0, actions: 0 }}
          onConfirm={() => console.log('deleted')}
        />
      </>
    )
  },
}

export const Rename: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open</Button>
        <RenamePathDialog
          open={open}
          onOpenChange={setOpen}
          currentName="Sport"
          onRename={(name) => console.log('rename', name)}
        />
      </>
    )
  },
}
