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
import { PathPicker } from '@/modules/capture-triage/components/PathPicker'

/**
 * Moves a Goal (and its whole subtree + their Actions) to another Path —
 * always landing top-level on the destination, since a sub-Goal can't carry
 * its old parent across (the parent lives on the origin Path).
 */
export function MoveGoalDialog({
  open,
  onOpenChange,
  goalName,
  currentPathId,
  onMove,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  goalName: string
  currentPathId: string
  onMove: (pathId: string) => void
}) {
  const [pathId, setPathId] = useState<string | null>(null)

  useEffect(() => {
    if (open) setPathId(null)
  }, [open])

  const submit = () => {
    if (!pathId || pathId === currentPathId) return
    onMove(pathId)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move “{goalName}” to another Path</DialogTitle>
          <DialogDescription>
            Its whole sub-Goal tree and every Action under it move together, landing top-level on
            the destination.
          </DialogDescription>
        </DialogHeader>

        <PathPicker value={pathId} onChange={setPathId} />

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={submit} disabled={!pathId || pathId === currentPathId}>
            Move Goal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
