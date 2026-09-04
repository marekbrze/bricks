import { Button } from '@/components/ui/button'
import type { Path } from '@/modules/paths/types/path'

/**
 * Single-select chip list of active Paths. No shadcn `Select` primitive is
 * installed yet — a `radiogroup` of buttons keeps this keyboard-accessible
 * without adding one just for this module.
 */
export function PathPicker({
  paths,
  value,
  onChange,
  label = 'Path',
}: {
  paths: Path[]
  value: string | null
  onChange: (pathId: string) => void
  label?: string
}) {
  if (paths.length === 0) {
    return <p className="text-sm text-muted-foreground">No Paths yet — create one first.</p>
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
        {paths.map((p) => {
          const selected = p.id === value
          return (
            <Button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={selected}
              variant={selected ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => onChange(p.id)}
            >
              {p.name}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
