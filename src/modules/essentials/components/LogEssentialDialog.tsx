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
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

/**
 * Log one completion of an Essential. The Essential's name is the title; the
 * only field is an optional comment. On submit the caller creates an
 * already-`done` `Action` (`useActions().logEssentialCompletion`). Dirty-form
 * guard only kicks in once the comment has text — an empty log is one click,
 * Cancel, done.
 */
export function LogEssentialDialog({
  open,
  onOpenChange,
  essentialName,
  onLog,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  essentialName: string
  onLog: (note: string) => void
}) {
  const [note, setNote] = useState('')
  const [confirmDiscard, setConfirmDiscard] = useState(false)

  useEffect(() => {
    if (open) {
      setNote('')
      setConfirmDiscard(false)
    }
  }, [open])

  const close = () => onOpenChange(false)

  const handleOpenChange = (next: boolean) => {
    if (next) {
      onOpenChange(true)
      return
    }
    if (note.trim()) {
      setConfirmDiscard(true)
      return
    }
    close()
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    onLog(note.trim())
    close()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        {confirmDiscard ? (
          <div className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>Discard this note?</DialogTitle>
              <DialogDescription>Closing now loses what you’ve typed.</DialogDescription>
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
              <DialogTitle>{essentialName}</DialogTitle>
              <DialogDescription>
                Log this as done. It creates a completed action under this Path — add a note if you
                want to.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="essential-log-note">Note (optional)</Label>
              <textarea
                id="essential-log-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="How did it go?"
                rows={3}
                className={cn(
                  'flex w-full min-w-0 resize-none rounded-lg border border-border bg-card px-2.5 py-1.5 text-sm outline-none',
                  'placeholder:text-muted-foreground',
                  'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
                )}
                // eslint-disable-next-line jsx-a11y/no-autofocus -- dialog opens directly onto its only field
                autoFocus
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Log it</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
