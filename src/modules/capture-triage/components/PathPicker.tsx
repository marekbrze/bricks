import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePaths } from '@/modules/paths/hooks/use-paths'
import { NewPathDialog } from '@/modules/paths/components/NewPathDialog'

/**
 * Single-select chip list of active Paths, with an inline "create a Path"
 * fallback when there aren't any yet — used from inside triage, so the
 * Owner never has to leave (and lose their session) just to unblock
 * assigning or promoting. Plain toggle buttons with `aria-pressed`, not a
 * `radiogroup` — no shadcn `Select`/roving-tabindex primitive is installed,
 * and this matches the actual keyboard behavior (each chip is its own Tab
 * stop) instead of promising ARIA radiogroup semantics it doesn't implement.
 */
export function PathPicker({
  value,
  onChange,
  label = 'Path',
}: {
  value: string | null
  onChange: (pathId: string) => void
  label?: string
}) {
  const { activePaths, createPath } = usePaths()
  const [creating, setCreating] = useState(false)

  if (activePaths.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">No Paths yet — create one first.</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setCreating(true)}
          className="self-start"
        >
          <Plus aria-hidden="true" /> New Path
        </Button>
        <NewPathDialog
          open={creating}
          onOpenChange={setCreating}
          onCreate={(name, achievements) => {
            const id = createPath(name, achievements)
            onChange(id)
          }}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div aria-label={label} className="flex flex-wrap gap-1.5">
        {activePaths.map((p) => {
          const selected = p.id === value
          return (
            <Button
              key={p.id}
              type="button"
              aria-pressed={selected}
              variant={selected ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => onChange(p.id)}
              className="max-w-full whitespace-normal text-left"
            >
              {p.name}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
