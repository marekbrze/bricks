import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/shared/components/toast/toast-context'
import { useActions } from '../hooks/use-actions'

/**
 * The capture half of `capture-triage` — name only, always available, never
 * navigates away. Used inline on the Inbox page and inside the global
 * `QuickCaptureButton` popover so an idea can be dropped from anywhere.
 */
export function QuickCaptureInput({ focusOnOpen = false }: { focusOnOpen?: boolean }) {
  const { captureAction } = useActions()
  const { showToast } = useToast()
  const [name, setName] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    captureAction(name)
    showToast('Added to Inbox')
    setName('')
  }

  return (
    <form onSubmit={submit} className="flex items-end gap-2">
      <div className="flex flex-1 flex-col gap-1.5">
        <Label htmlFor="quick-capture-name" className="sr-only">
          Capture an idea
        </Label>
        <Input
          id="quick-capture-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Capture an idea…"
          // eslint-disable-next-line jsx-a11y/no-autofocus -- opened deliberately by the user via the capture affordance
          autoFocus={focusOnOpen}
        />
      </div>
      <Button type="submit" disabled={!name.trim()}>
        <Plus aria-hidden="true" /> Add
      </Button>
    </form>
  )
}
