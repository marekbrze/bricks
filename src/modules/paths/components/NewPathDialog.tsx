import { useState } from 'react'
import { Plus, X } from 'lucide-react'
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

export function NewPathDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (name: string, achievements: string[]) => void
}) {
  const [name, setName] = useState('')
  const [rows, setRows] = useState<string[]>(['', ''])
  const [showError, setShowError] = useState(false)

  const reset = () => {
    setName('')
    setRows(['', ''])
    setShowError(false)
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) reset()
    onOpenChange(next)
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setShowError(true)
      return
    }
    onCreate(name, rows)
    handleOpenChange(false)
  }

  const setRow = (i: number, value: string) =>
    setRows((r) => r.map((v, idx) => (idx === i ? value : v)))
  const addRow = () => setRows((r) => [...r, ''])
  const removeRow = (i: number) => setRows((r) => (r.length === 1 ? [''] : r.filter((_, idx) => idx !== i)))

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>New Path</DialogTitle>
            <DialogDescription>
              A never-ending direction in life — the sport path, the earnings path. You can add its
              Vision later.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-path-name">Name</Label>
            <Input
              id="new-path-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (showError) setShowError(false)
              }}
              placeholder="e.g. Sport"
              aria-invalid={showError || undefined}
              aria-describedby={showError ? 'new-path-name-error' : undefined}
            />
            {showError && (
              <p id="new-path-name-error" className="text-xs text-destructive">
                Give the Path a name.
              </p>
            )}
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium">Achievements along the way</legend>
            <p className="text-xs text-muted-foreground">
              Things you want to be able to do one day — not tasks. Optional.
            </p>
            <ul className="flex flex-col gap-2">
              {rows.map((value, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Input
                    value={value}
                    onChange={(e) => setRow(i, e.target.value)}
                    placeholder="e.g. I can do a pull-up"
                    aria-label={`Achievement ${i + 1}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeRow(i)}
                    aria-label={`Remove achievement ${i + 1}`}
                  >
                    <X aria-hidden="true" />
                  </Button>
                </li>
              ))}
            </ul>
            <Button type="button" variant="ghost" size="sm" onClick={addRow} className="self-start">
              <Plus aria-hidden="true" /> Add another
            </Button>
          </fieldset>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Path</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
