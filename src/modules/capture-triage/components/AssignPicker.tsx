import { Button } from '@/components/ui/button'
import { useGoals } from '@/modules/goals/hooks/use-goals'
import { PathPicker } from './PathPicker'

export interface AssignSelection {
  pathId: string
  /** null = standalone on the Path, no Goal. */
  goalId: string | null
}

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
 * Path → Goal cascading picker used on the triage card. Paths and Goals are
 * both real (`PathPicker` / `useGoals` own loading + inline Path creation);
 * sub-Goals render indented, in tree order.
 */
export function AssignPicker({
  value,
  onChange,
}: {
  value: AssignSelection | null
  onChange: (selection: AssignSelection | null) => void
}) {
  const { topLevelGoals, childGoals } = useGoals()
  const goalsForPath = value ? flattenActiveGoals(value.pathId, topLevelGoals, childGoals) : []

  return (
    <div className="flex flex-col gap-3">
      <PathPicker value={value?.pathId ?? null} onChange={(pathId) => onChange({ pathId, goalId: null })} />

      {value && (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">Goal (optional)</span>
          <div aria-label="Goal" className="flex flex-wrap gap-1.5">
            <Button
              type="button"
              aria-pressed={value.goalId === null}
              variant={value.goalId === null ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => onChange({ pathId: value.pathId, goalId: null })}
            >
              Standalone (no Goal)
            </Button>
            {goalsForPath.map((g) => {
              const selected = value.goalId === g.id
              return (
                <Button
                  key={g.id}
                  type="button"
                  aria-pressed={selected}
                  variant={selected ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => onChange({ pathId: value.pathId, goalId: g.id })}
                  className="max-w-full whitespace-normal text-left"
                >
                  {'— '.repeat(g.depth)}
                  {g.name}
                </Button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
