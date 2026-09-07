import { Ban, MoreVertical, RotateCcw, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import type { GoalState } from '@/modules/goals/types/goal'

/**
 * A Goal group's lifecycle menu on the Actions screens — the slim, work-layer
 * slice of the Goals-tree menu: close the Goal (celebration dialog), abandon
 * it, or reactivate a closed one. Editing/moving/deleting stay in `goals`,
 * where the whole Goal lives; here only the state turns.
 */
export function GoalLifecycleMenu({
  goalName,
  state,
  onAchieve,
  onAbandon,
  onReactivate,
}: {
  goalName: string
  state: GoalState
  onAchieve: () => void
  onAbandon: () => void
  onReactivate: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label={`Lifecycle actions for ${goalName}`}>
            <MoreVertical aria-hidden="true" />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        {state === 'active' ? (
          <>
            <DropdownMenuItem onClick={onAchieve}>
              <Trophy aria-hidden="true" /> Mark achieved
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onAbandon}>
              <Ban aria-hidden="true" /> Abandon
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem onClick={onReactivate}>
            <RotateCcw aria-hidden="true" /> Reactivate
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
