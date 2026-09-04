import { Button } from '@/components/ui/button'
import type { Path } from '@/modules/paths/types/path'

/**
 * Single-select chip list scoping the Log page to one Path (or all of
 * them). Plain toggle buttons with `aria-pressed`, matching `PathPicker`'s
 * pattern — no shadcn `Select`/roving-tabindex primitive is installed, and
 * this matches the actual keyboard behavior (each chip its own Tab stop).
 * See docs/modules/winlog.md → "Open the Log (global)".
 */
export function PathFilterChips({
  paths,
  value,
  onChange,
}: {
  paths: Path[]
  value: string | null
  onChange: (pathId: string | null) => void
}) {
  return (
    <div aria-label="Filter by Path" className="flex flex-wrap gap-1.5">
      <Button
        type="button"
        aria-pressed={value === null}
        variant={value === null ? 'secondary' : 'outline'}
        size="sm"
        onClick={() => onChange(null)}
      >
        All Paths
      </Button>
      {paths.map((p) => {
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
  )
}
