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
import { cn } from '@/lib/utils'

export interface GoalFormData {
  name: string
  description: string
  deadline: string | null
}

const EMPTY: GoalFormData = { name: '', description: '', deadline: null }

/**
 * Shared create/edit form for a Goal or sub-Goal — no Path picker here, since
 * a Goal is always created in the context of the Path/parent it's opened
 * from (top-level via **New Goal**, nested via a row's **Add sub-Goal**).
 * Moving to a different Path afterward is a separate action (`MoveGoalDialog`).
 */
export function GoalDialog({
  open,
  onOpenChange,
  title,
  description,
  initial,
  submitLabel,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  initial?: GoalFormData
  submitLabel: string
  onSubmit: (data: GoalFormData) => void
}) {
  const [form, setForm] = useState<GoalFormData>(initial ?? EMPTY)
  const [showError, setShowError] = useState(false)
  const [confirmDiscard, setConfirmDiscard] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(initial ?? EMPTY)
      setShowError(false)
      setConfirmDiscard(false)
    }
    // Only resync when the dialog opens — not on every `initial` identity change.
  }, [open])

  const baseline = initial ?? EMPTY
  const dirty =
    form.name.trim() !== baseline.name.trim() ||
    form.description.trim() !== baseline.description.trim() ||
    form.deadline !== baseline.deadline

  const close = () => onOpenChange(false)

  // Intercept every close attempt (Cancel, Escape, backdrop) — same guard as `NewPathDialog`.
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
    if (!form.name.trim()) {
      setShowError(true)
      return
    }
    onSubmit({ name: form.name.trim(), description: form.description.trim(), deadline: form.deadline })
    close()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        {confirmDiscard ? (
          <div className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>Discard changes?</DialogTitle>
              <DialogDescription>Closing now loses what you've typed.</DialogDescription>
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
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="goal-name">Name</Label>
              <Input
                id="goal-name"
                value={form.name}
                onChange={(e) => {
                  setForm((f) => ({ ...f, name: e.target.value }))
                  if (showError) setShowError(false)
                }}
                placeholder="e.g. Build a 10K base"
                aria-invalid={showError || undefined}
                aria-describedby={showError ? 'goal-name-error' : undefined}
                // eslint-disable-next-line jsx-a11y/no-autofocus -- dialog opens directly onto its primary field
                autoFocus
              />
              {showError && (
                <p id="goal-name-error" className="text-xs text-destructive">
                  Give the Goal a name.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="goal-description">Description (optional)</Label>
              <textarea
                id="goal-description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="What does done look like?"
                rows={2}
                className={cn(
                  'flex w-full min-w-0 resize-none rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm outline-none',
                  'placeholder:text-muted-foreground',
                  'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="goal-deadline">Deadline (optional)</Label>
              <Input
                id="goal-deadline"
                type="date"
                value={form.deadline ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value || null }))}
                className="w-fit"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">{submitLabel}</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
