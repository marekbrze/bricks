import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Kbd } from '@/shared/components/Kbd'
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
  shortcuts = false,
}: {
  value: string | null
  onChange: (pathId: string) => void
  label?: string
  /** Triage only: number-key shortcuts (1-9) jump straight to a Path, shown as `Kbd` hints on the first 9 chips. */
  shortcuts?: boolean
}) {
  const { activePaths, createPath } = usePaths()
  const [creating, setCreating] = useState(false)

  // Ignore keys while the Owner is typing elsewhere (e.g. the inline New Path
  // name field) so a digit in a Path name doesn't get hijacked mid-entry.
  useEffect(() => {
    if (!shortcuts) return
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (!/^[1-9]$/.test(e.key)) return
      const path = activePaths[Number(e.key) - 1]
      if (!path) return
      e.preventDefault()
      onChange(path.id)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [shortcuts, activePaths, onChange])

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
        {activePaths.map((p, i) => {
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
              {shortcuts && i < 9 && <Kbd>{i + 1}</Kbd>}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
