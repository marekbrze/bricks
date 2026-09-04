import { Button } from '@/components/ui/button'
import { usePaths } from '@/modules/paths/hooks/use-paths'
import { MOCK_GOAL_OPTIONS } from '../data/mock-goal-options'
import { PathPicker } from './PathPicker'

export interface AssignSelection {
  pathId: string
  /** null = standalone on the Path, no Goal. */
  goalId: string | null
}

/**
 * Path → Goal cascading picker used on the triage card. Paths are real,
 * loaded from the `paths` module; Goals are `MOCK_GOAL_OPTIONS` — a
 * stand-in until the `goals` module exists (see that file's comment).
 */
export function AssignPicker({
  value,
  onChange,
}: {
  value: AssignSelection | null
  onChange: (selection: AssignSelection | null) => void
}) {
  const { activePaths } = usePaths()
  const goalsForPath = value ? MOCK_GOAL_OPTIONS.filter((g) => g.pathId === value.pathId) : []

  return (
    <div className="flex flex-col gap-3">
      <PathPicker
        paths={activePaths}
        value={value?.pathId ?? null}
        onChange={(pathId) => onChange({ pathId, goalId: null })}
      />

      {value && (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">Goal (optional)</span>
          <div role="radiogroup" aria-label="Goal" className="flex flex-wrap gap-1.5">
            <Button
              type="button"
              role="radio"
              aria-checked={value.goalId === null}
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
                  role="radio"
                  aria-checked={selected}
                  variant={selected ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => onChange({ pathId: value.pathId, goalId: g.id })}
                >
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
