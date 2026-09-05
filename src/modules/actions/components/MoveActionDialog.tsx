import { useMemo, useState } from 'react'
import { Signpost, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { usePaths } from '@/modules/paths/hooks/use-paths'
import { useGoals } from '@/modules/goals/hooks/use-goals'
import type { Goal } from '@/modules/goals/types/goal'
import type { Action } from '@/modules/capture-triage/types/action'

interface Destination {
  key: string
  pathId: string
  pathName: string
  goalId: string | null
  /** Goal name, or null for the Path's standalone bucket. */
  goalName: string | null
  depth: number
}

/**
 * Flatten every active Path into move destinations: the Path's standalone
 * bucket first, then its active Goals depth-first (parent before children).
 * Inactive Goals are left out for the same reason `AssignPicker` leaves them
 * out — filing new work under an achieved Goal isn't a real choice.
 */
function useDestinations(): Destination[] {
  const { activePaths } = usePaths()
  const { topLevelGoals, childGoals } = useGoals()

  return useMemo(() => {
    const rows: Destination[] = []
    for (const path of activePaths) {
      rows.push({
        key: `${path.id}:standalone`,
        pathId: path.id,
        pathName: path.name,
        goalId: null,
        goalName: null,
        depth: 0,
      })
      const walk = (goals: Goal[], depth: number) => {
        for (const g of goals) {
          if (g.state === 'active') {
            rows.push({
              key: `${path.id}:${g.id}`,
              pathId: path.id,
              pathName: path.name,
              goalId: g.id,
              goalName: g.name,
              depth,
            })
          }
          walk(childGoals(g.id), depth + 1)
        }
      }
      walk(topLevelGoals(path.id), 0)
    }
    return rows
  }, [activePaths, topLevelGoals, childGoals])
}

/**
 * The keyboard-accessible twin of dragging a row between Goals: pick a
 * destination from a searchable list of every active Path and its Goals.
 * Reached from the row menu's "Move to…" — pointer users can drag instead
 * (docs/adr/0026-path-actions-tab-and-drag-and-drop.md).
 *
 * The Action's current home renders as a disabled "Current" row rather than
 * being hidden, so the list never silently reshuffles under the Owner.
 */
export function MoveActionDialog({
  action,
  onOpenChange,
  onMove,
}: {
  action: Action
  onOpenChange: (open: boolean) => void
  onMove: (pathId: string, goalId: string | null) => void
}) {
  const destinations = useDestinations()
  const [query, setQuery] = useState('')
  const [highlight, setHighlight] = useState(0)

  const q = query.trim().toLowerCase()
  const rows = q
    ? destinations.filter(
        (d) =>
          (d.goalName ?? 'standalone').toLowerCase().includes(q) ||
          d.pathName.toLowerCase().includes(q),
      )
    : destinations

  const isCurrent = (d: Destination) => d.pathId === action.pathId && d.goalId === action.goalId

  const select = (d: Destination) => {
    if (isCurrent(d)) return
    onMove(d.pathId, d.goalId)
    onOpenChange(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight((h) => (rows.length ? (h + 1) % rows.length : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => (rows.length ? (h - 1 + rows.length) % rows.length : 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const row = rows[highlight]
      if (row) select(row)
    }
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent>
        <div className="flex flex-col gap-3">
          <DialogHeader>
            <DialogTitle>Move “{action.name}”</DialogTitle>
            <DialogDescription>
              Pick the Goal it should live under, or a Path to keep it standalone.
            </DialogDescription>
          </DialogHeader>

          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setHighlight(0)
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search Goals and Paths…"
            aria-label="Search destinations"
            role="combobox"
            aria-expanded="true"
            aria-controls="move-action-listbox"
            aria-activedescendant={rows[highlight] ? `move-action-row-${highlight}` : undefined}
            // eslint-disable-next-line jsx-a11y/no-autofocus -- dialog opens directly onto its one field
            autoFocus
          />

          <div
            id="move-action-listbox"
            role="listbox"
            aria-label="Destination"
            className="flex max-h-72 flex-col overflow-y-auto rounded-lg border border-border"
          >
            {rows.length === 0 && (
              <p className="px-2.5 py-2 text-sm text-muted-foreground">No matching Goal or Path.</p>
            )}
            {rows.map((d, i) => {
              const current = isCurrent(d)
              return (
                <button
                  key={d.key}
                  id={`move-action-row-${i}`}
                  type="button"
                  role="option"
                  aria-selected={i === highlight}
                  aria-disabled={current}
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => select(d)}
                  className={cn(
                    'flex items-center gap-2 px-2.5 py-1.5 text-left text-sm outline-none',
                    current && 'text-muted-foreground',
                    i === highlight && !current ? 'bg-muted text-foreground' : 'hover:bg-muted/60',
                  )}
                >
                  {d.goalId ? (
                    <Target className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  ) : (
                    <Signpost className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  )}
                  <span className="min-w-0 flex-1 truncate" style={{ paddingLeft: d.depth * 12 }}>
                    {d.goalName ?? 'Standalone (no Goal)'}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">{d.pathName}</span>
                  {current && (
                    <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs">Current</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
