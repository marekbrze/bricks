import {
  MoreVertical,
  Pencil,
  ListPlus,
  ArrowRightLeft,
  Flame,
  FlameKindling,
  Trophy,
  Ban,
  RotateCcw,
  Trash2,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import type { GoalState } from '../types/goal'

export function GoalOverflowMenu({
  goalName,
  state,
  frog,
  onEdit,
  onAddSubGoal,
  onMove,
  onToggleFrog,
  onAchieve,
  onAbandon,
  onReactivate,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  goalName: string
  state: GoalState
  frog: boolean
  onEdit: () => void
  onAddSubGoal: () => void
  onMove: () => void
  onToggleFrog: () => void
  onAchieve: () => void
  onAbandon: () => void
  onReactivate: () => void
  onDelete: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  canMoveUp?: boolean
  canMoveDown?: boolean
}) {
  const showReorder = Boolean(onMoveUp || onMoveDown)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${goalName}`}>
            <MoreVertical aria-hidden="true" />
          </Button>
        }
      />
      <DropdownMenuContent>
        {showReorder && (
          <>
            <DropdownMenuItem onClick={onMoveUp} disabled={!canMoveUp}>
              <ArrowUp aria-hidden="true" /> Move up
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onMoveDown} disabled={!canMoveDown}>
              <ArrowDown aria-hidden="true" /> Move down
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={onEdit}>
          <Pencil aria-hidden="true" /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onAddSubGoal}>
          <ListPlus aria-hidden="true" /> Add sub-Goal
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onMove}>
          <ArrowRightLeft aria-hidden="true" /> Move to Path
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onToggleFrog}>
          {frog ? (
            <>
              <FlameKindling aria-hidden="true" /> Unmark frog
            </>
          ) : (
            <>
              <Flame aria-hidden="true" /> Mark as frog
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {state === 'active' && (
          <>
            <DropdownMenuItem onClick={onAchieve}>
              <Trophy aria-hidden="true" /> Mark achieved
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onAbandon}>
              <Ban aria-hidden="true" /> Abandon
            </DropdownMenuItem>
          </>
        )}
        {state !== 'active' && (
          <DropdownMenuItem onClick={onReactivate}>
            <RotateCcw aria-hidden="true" /> Reactivate
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <Trash2 aria-hidden="true" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
