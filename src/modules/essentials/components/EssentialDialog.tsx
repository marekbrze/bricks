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

export interface EssentialFormData {
  name: string
  detail: string
}

const EMPTY: EssentialFormData = { name: '', detail: '' }

/**
 * Create / edit an Essential. No Path picker — an Essential is always created
 * in the context of the Path it's opened from. Same dirty-form guard as
 * `GoalDialog` / `NewPathDialog`.
 */
export function EssentialDialog({
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
  initial?: EssentialFormData
  submitLabel: string
  onSubmit: (data: EssentialFormData) => void
}) {
  const [form, setForm] = useState<EssentialFormData>(initial ?? EMPTY)
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
    form.name.trim() !== baseline.name.trim() || form.detail.trim() !== baseline.detail.trim()

  const close = () => onOpenChange(false)

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
    onSubmit({ name: form.name.trim(), detail: form.detail.trim() })
    close()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        {confirmDiscard ? (
          <div className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>Discard changes?</DialogTitle>
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
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="essential-name">Deed</Label>
              <Input
                id="essential-name"
                value={form.name}
                onChange={(e) => {
                  setForm((f) => ({ ...f, name: e.target.value }))
                  if (showError) setShowError(false)
                }}
                placeholder="e.g. Call five prospective clients"
                aria-invalid={showError || undefined}
                aria-describedby={showError ? 'essential-name-error' : undefined}
                // eslint-disable-next-line jsx-a11y/no-autofocus -- dialog opens directly onto its primary field
                autoFocus
              />
              {showError && (
                <p id="essential-name-error" className="text-xs text-destructive">
                  Name the deed.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="essential-detail">Why / how (optional)</Label>
              <textarea
                id="essential-detail"
                value={form.detail}
                onChange={(e) => setForm((f) => ({ ...f, detail: e.target.value }))}
                placeholder="A one-line reminder — when, how much, why it matters"
                rows={2}
                className={cn(
                  'flex w-full min-w-0 resize-none rounded-lg border border-border bg-card px-2.5 py-1.5 text-sm outline-none',
                  'placeholder:text-muted-foreground',
                  'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
                )}
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
