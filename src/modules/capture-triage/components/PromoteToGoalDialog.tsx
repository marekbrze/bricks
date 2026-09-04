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
  const [name, setName] = useState(actionName)
  const [pathId, setPathId] = useState<string | null>(null)
  const [confirmDiscard, setConfirmDiscard] = useState(false)

  useEffect(() => {
    if (open) {
      setName(actionName)
      setPathId(null)
      setConfirmDiscard(false)
    }
  }, [open, actionName])

  const dirty = name.trim() !== actionName.trim() || pathId !== null

  const close = () => onOpenChange(false)

  // Intercept every close attempt (Cancel, Escape, backdrop) — ask before losing
  // a typed Goal name or a chosen Path, same guard `NewPathDialog` uses.
  const handleOpenChange = (next: boolean) => {
    if (next) {
      onOpenChange(true)
      return
    }
    if (dirty) {
      setConfirmDiscard(true)
      return
    }
    close()
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !pathId) return
    onPromote({ name: name.trim(), pathId })
    close()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        {confirmDiscard ? (
          <div className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>Discard this Goal?</DialogTitle>
              <DialogDescription>
                You've started filling this in. Closing now loses the name and Path choice — the
                Inbox item stays untouched.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setConfirmDiscard(false)}>
                Keep editing
              </Button>
              <Button variant="destructive" onClick={close}>
                Discard
              </Button>
            </DialogFooter>
          </div>
        ) : (
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

            <PathPicker value={pathId} onChange={setPathId} />

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!name.trim() || !pathId}>
                Create Goal
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
