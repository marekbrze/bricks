import { Link } from 'react-router-dom'
import { GripVertical, Flame, Trophy, Ban } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGoals } from '../hooks/use-goals'
import type { Goal } from '../types/goal'
import { daysUntil, deadlineLabel } from '../lib/deadline'
import { GoalOverflowMenu } from './GoalOverflowMenu'

export type GoalRowAction = 'edit' | 'addSub' | 'move' | 'delete'

const MAX_INDENT_DEPTH = 4
const INDENT_PX = 20

function DeadlineBadge({ deadline }: { deadline: string }) {
  const days = daysUntil(deadline)
  const overdue = days < 0
  return (
    <span
      className={cn(
        'shrink-0 rounded-full px-2 py-0.5 text-xs tabular-nums',
        overdue ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground',
      )}
    >
      {deadlineLabel(days)}
    </span>
  )
}

function StateBadge({ state }: { state: 'achieved' | 'abandoned' }) {
  if (state === 'achieved') {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
        <Trophy className="size-3" aria-hidden="true" /> Achieved
      </span>
    )
  }
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
      <Ban className="size-3" aria-hidden="true" /> Abandoned
    </span>
  )
}

export function GoalRow({
  goal,
  depth,
  index,
  siblingCount,
  dragId,
  readOnly = false,
  onDragStart,
  onDropOn,
  onDragEnd,
  onReorder,
  onSetState,
  onAction,
}: {
  goal: Goal
  depth: number
  index: number
  siblingCount: number
  dragId: string | null
  /** Read-only while the owning Path is archived — mirrors `AchievementsSection`'s `readOnly`. */
  readOnly?: boolean
  onDragStart: (id: string) => void
  onDropOn: (goal: Goal, index: number) => void
  onDragEnd: () => void
  onReorder: (goal: Goal, toIndex: number) => void
  onSetState: (goal: Goal, state: 'achieved' | 'abandoned' | 'active') => void
  onAction: (action: GoalRowAction, goal: Goal) => void
}) {
  const { childGoals, actionCountFor, toggleFrog, getGoal } = useGoals()
  const children = childGoals(goal.id)
  const actionCount = actionCountFor(goal.id)

  const draggedGoal = dragId ? getGoal(dragId) : undefined
  // Dragging never crosses sibling groups — only allow the drop (and its
  // "you can drop here" cursor) when the hovered row shares the dragged
  // Goal's Path + parent.
  const acceptsDrop =
    !draggedGoal || (draggedGoal.pathId === goal.pathId && draggedGoal.parentGoalId === goal.parentGoalId)
  const draggable = !readOnly && siblingCount > 1

  return (
    <li>
      {/* Pointer drag-to-reorder within this sibling group; the keyboard-accessible
          path is the overflow menu's Move up / Move down. */}
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions -- drag handlers on a
          plain div; the keyboard-accessible path is the overflow menu's Move up / Move down */}
      <div
        draggable={draggable}
        onDragStart={() => onDragStart(goal.id)}
        onDragOver={(e) => {
          if (acceptsDrop) e.preventDefault()
        }}
        onDrop={(e) => {
          if (!acceptsDrop) return
          e.preventDefault()
          onDropOn(goal, index)
        }}
        onDragEnd={onDragEnd}
        style={{ paddingLeft: Math.min(depth, MAX_INDENT_DEPTH) * INDENT_PX }}
        className={cn(
          'group flex items-center gap-2 rounded-lg border border-border bg-background p-2',
          dragId === goal.id && 'opacity-50',
        )}
      >
        {draggable && (
          <GripVertical
            className="size-4 shrink-0 cursor-grab text-muted-foreground active:cursor-grabbing"
            aria-hidden="true"
          />
        )}
        <Link
          to={`/paths/${goal.pathId}/goals/${goal.id}`}
          className={cn(
            'line-clamp-2 min-w-0 flex-1 rounded-sm text-sm font-medium break-words outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50',
            goal.state !== 'active' && 'text-muted-foreground',
          )}
        >
          {goal.name}
        </Link>
        {goal.frog && (
          <span aria-label="Frog" className="inline-flex shrink-0">
            <Flame className="size-4 text-destructive" aria-hidden="true" />
          </span>
        )}
        {goal.deadline && <DeadlineBadge deadline={goal.deadline} />}
        {goal.state !== 'active' && <StateBadge state={goal.state} />}
        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
          {actionCount} {actionCount === 1 ? 'Action' : 'Actions'}
        </span>
        {!readOnly && (
          <GoalOverflowMenu
            goalName={goal.name}
            state={goal.state}
            frog={goal.frog}
            onEdit={() => onAction('edit', goal)}
            onAddSubGoal={() => onAction('addSub', goal)}
            onMove={() => onAction('move', goal)}
            onToggleFrog={() => toggleFrog(goal.id)}
            onAchieve={() => onSetState(goal, 'achieved')}
            onAbandon={() => onSetState(goal, 'abandoned')}
            onReactivate={() => onSetState(goal, 'active')}
            onDelete={() => onAction('delete', goal)}
            onMoveUp={() => onReorder(goal, index - 1)}
            onMoveDown={() => onReorder(goal, index + 1)}
            canMoveUp={index > 0}
            canMoveDown={index < siblingCount - 1}
          />
        )}
      </div>

      {children.length > 0 && (
        <ul className="mt-1 flex flex-col gap-1">
          {children.map((child, i) => (
            <GoalRow
              key={child.id}
              goal={child}
              depth={depth + 1}
              index={i}
              siblingCount={children.length}
              dragId={dragId}
              readOnly={readOnly}
              onDragStart={onDragStart}
              onDropOn={onDropOn}
              onDragEnd={onDragEnd}
              onReorder={onReorder}
              onSetState={onSetState}
              onAction={onAction}
            />
          ))}
        </ul>
      )}
    </li>
  )
}
