import { useEffect, useMemo, useRef, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { usePaths } from '@/modules/paths/hooks/use-paths'
import { useGoals } from '@/modules/goals/hooks/use-goals'
import { PathPicker } from './PathPicker'

type Row =
  | { kind: 'standalone' }
  | { kind: 'goal'; id: string; name: string; depth: number }
  | { kind: 'create'; name: string }

/**
 * Flatten a Path's Goal tree into assign-order (parent, then its children,
 * depth-first) — only `active` Goals are offered, since assigning a new
 * Action to an already-achieved or abandoned Goal isn't a real choice.
 */
function flattenActiveGoals(
  pathId: string,
  topLevelGoals: (pathId: string) => { id: string; name: string; state: string }[],
  childGoals: (goalId: string) => { id: string; name: string; state: string }[],
): { id: string; name: string; depth: number }[] {
  const result: { id: string; name: string; depth: number }[] = []
  const walk = (list: { id: string; name: string; state: string }[], depth: number) => {
    for (const g of list) {
      if (g.state === 'active') result.push({ id: g.id, name: g.name, depth })
      walk(childGoals(g.id), depth + 1)
    }
  }
  walk(topLevelGoals(pathId), 0)
  return result
}

/**
 * Path → Goal picker used on the triage card — one step, then a search.
 * Step 1 (`PathPicker`) is a single chip pick, with number-key shortcuts.
 * Step 2 is a live search over that Path's Goals: typing filters the list,
 * arrow keys move the highlight, Enter (or a click) resolves the card
 * immediately — no separate "Assign" confirm. When nothing matches, a
 * "Create Goal" row appears in the same list; picking it creates the Goal
 * and promotes the Action into it right there, without leaving this screen
 * (see docs/adr/0024-triage-seamless-assign.md). Clearing the query with an
 * empty field surfaces "Standalone (no Goal)" first, so the common case —
 * a one-off Action with no Goal — is a single Enter press after the Path.
 */
export function AssignPicker({
  onAssignExisting,
  onCreateGoal,
}: {
  onAssignExisting: (pathId: string, goalId: string | null) => void
  onCreateGoal: (data: { name: string; pathId: string }) => void
}) {
  const { activePaths } = usePaths()
  const { topLevelGoals, childGoals } = useGoals()
  const [pathId, setPathId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [highlight, setHighlight] = useState(0)
  const searchRef = useRef<HTMLInputElement>(null)

  const allGoals = useMemo(
    () => (pathId ? flattenActiveGoals(pathId, topLevelGoals, childGoals) : []),
    [pathId, topLevelGoals, childGoals],
  )

  const q = query.trim().toLowerCase()
  const matches = q ? allGoals.filter((g) => g.name.toLowerCase().includes(q)) : allGoals
  const exactMatch = q !== '' && allGoals.some((g) => g.name.toLowerCase() === q)

  const rows: Row[] = [
    ...(q === '' ? [{ kind: 'standalone' as const }] : []),
    ...matches.map((g): Row => ({ kind: 'goal', id: g.id, name: g.name, depth: g.depth })),
    ...(q !== '' && !exactMatch ? [{ kind: 'create' as const, name: query.trim() }] : []),
  ]

  useEffect(() => setHighlight(0), [query, pathId])

  const currentPath = activePaths.find((p) => p.id === pathId)

  const selectRow = (row: Row) => {
    if (!pathId) return
    if (row.kind === 'standalone') onAssignExisting(pathId, null)
    else if (row.kind === 'goal') onAssignExisting(pathId, row.id)
    else onCreateGoal({ name: row.name, pathId })
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight((h) => (rows.length ? (h + 1) % rows.length : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => (rows.length ? (h - 1 + rows.length) % rows.length : 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const row = rows[highlight]
      if (row) selectRow(row)
    } else if (e.key === 'Escape') {
      if (query) setQuery('')
      else setPathId(null)
    } else if (e.key === 'Backspace' && query === '') {
      setPathId(null)
    }
  }

  // 'a' jumps back into the search once a Path is already chosen — e.g. after
  // Tab-ing away, or right after a number-key Path pick. Ignored while typing
  // elsewhere so it never steals a literal "a" from a Goal name.
  useEffect(() => {
    if (!pathId) return
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key !== 'a' && e.key !== 'A') return
      e.preventDefault()
      searchRef.current?.focus()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [pathId])

  if (!pathId) {
    return <PathPicker value={null} onChange={setPathId} shortcuts />
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="font-medium">Path</span>
        <button
          type="button"
          onClick={() => setPathId(null)}
          className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 font-medium text-secondary-foreground outline-none hover:bg-secondary/80 focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {currentPath?.name}
          <X className="size-3" aria-hidden="true" />
        </button>
      </div>

      <Input
        ref={searchRef}
        // eslint-disable-next-line jsx-a11y/no-autofocus -- deliberate: this input only mounts once the Owner has just picked a Path in this same triage card
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleSearchKeyDown}
        placeholder="Search or create a Goal…"
        aria-label="Goal"
        role="combobox"
        aria-expanded="true"
        aria-controls="assign-goal-listbox"
        aria-activedescendant={rows[highlight] ? `assign-goal-row-${highlight}` : undefined}
      />

      <div
        id="assign-goal-listbox"
        role="listbox"
        aria-label="Goal"
        className="flex max-h-48 flex-col overflow-y-auto rounded-lg border border-border"
      >
        {rows.length === 0 && <p className="px-2.5 py-2 text-sm text-muted-foreground">No matches.</p>}
        {rows.map((row, i) => (
          <button
            key={row.kind === 'goal' ? row.id : row.kind}
            id={`assign-goal-row-${i}`}
            type="button"
            role="option"
            aria-selected={i === highlight}
            onMouseEnter={() => setHighlight(i)}
            onClick={() => selectRow(row)}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 text-left text-sm outline-none',
              i === highlight ? 'bg-muted text-foreground' : 'hover:bg-muted/60',
            )}
          >
            {row.kind === 'standalone' && 'Standalone (no Goal)'}
            {row.kind === 'goal' && (
              <span className="truncate">
                {'— '.repeat(row.depth)}
                {row.name}
              </span>
            )}
            {row.kind === 'create' && (
              <>
                <Plus className="size-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">Create Goal “{row.name}”</span>
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
