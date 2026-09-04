import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { usePaths } from '@/modules/paths/hooks/use-paths'
import { PathPicker } from './PathPicker'

export function PromoteToGoalDialog({
  open,
  onOpenChange,
  actionName,
  onPromote,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  actionName: string
  onPromote: (data: { name: string; pathId: string }) => void
}) {
  const { activePaths } = usePaths()
  const [name, setName] = useState(actionName)
  const [pathId, setPathId] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setName(actionName)
      setPathId(null)
    }
  }, [open, actionName])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !pathId) return
    onPromote({ name: name.trim(), pathId })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Promote to a Goal</DialogTitle>
            <DialogDescription>
              This idea needs more than one Action. It becomes a new Goal — the Inbox item is
              retired once created.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="promote-goal-name">Goal name</Label>
            <Input id="promote-goal-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <PathPicker paths={activePaths} value={pathId} onChange={setPathId} />

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || !pathId}>
              Create Goal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
