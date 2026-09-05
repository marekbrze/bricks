import { useMemo } from 'react'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Action } from '@/modules/capture-triage/types/action'
import type { Goal } from '@/modules/goals/types/goal'
import { daysUntil, deadlineLabel } from '@/modules/goals/lib/deadline'
import { compareActionsForList, isSettled } from '../lib/group-actions'
import { ActionRowItem } from './ActionRowItem'
import { QuickAddActionRow } from './QuickAddActionRow'
import { useActionDropZone } from './action-dnd'

export interface ActionRowCallbacks {
  onToggleDone: (action: Action, done: boolean) => void
  /** One-click "add to today" — the view's most frequent action. */
  onScheduleToday: (action: Action) => void
  onSchedule: (action: Action) => void
  onUnschedule: (action: Action) => void
  onRename: (action: Action) => void
  onToggleFrog: (action: Action) => void
  /** Opens the move picker — the keyboard twin of dragging the row elsewhere. */
  onMoveTo?: (action: Action) => void
  onDelete: (action: Action) => void
}

/** Spreadable row props built from the shared callbacks — one row, one place. */
export function actionRowProps(action: Action, callbacks: ActionRowCallbacks) {
  return {
    action,
    onToggleDone: (done: boolean) => callbacks.onToggleDone(action, done),
    onScheduleToday: () => callbacks.onScheduleToday(action),
    onSchedule: () => callbacks.onSchedule(action),
    onUnschedule: () => callbacks.onUnschedule(action),
    onRename: () => callbacks.onRename(action),
    onToggleFrog: () => callbacks.onToggleFrog(action),
    onMoveTo: callbacks.onMoveTo ? () => callbacks.onMoveTo!(action) : undefined,
    onDelete: () => callbacks.onDelete(action),
  }
}

/**
 * One Goal's group: header (collapse chevron, name, frog flame, deadline
 * countdown), the Goal's Actions in list order, quick-add, then nested
 * sub-Goal groups. Inactive Goals (achieved/abandoned) that still hold open
 * Actions render collapsed and dimmed by default — their open work stays
 * reachable without shouting (docs/modules/actions.md). Inactive Goals with
 * no open Actions aren't rendered at all (the caller filters them out).
 *
 * Inside an `ActionDndProvider` the group is also a drop target: dragging an
 * Action onto it (collapsed groups included — the header is the target) files
 * the Action under this Goal.
 */
export function GoalGroup({
  goal,
  actions,
  childGoals,
  showCompleted,
  depth = 0,
  rowCallbacks,
  onCreate,
  renderChild,
  expandedOverride,
  onToggleExpanded,
}: {
  goal: Goal
  /** Actions assigned directly to this Goal (`goalId === goal.id`). */
  actions: Action[]
  childGoals: Goal[]
  showCompleted: boolean
  depth?: number
  rowCallbacks: ActionRowCallbacks
  onCreate: (name: string, scheduledDate: string | null) => void
  /** Renders a nested child group — recursion without importing this file into itself. */
  renderChild: (child: Goal, depth: number) => React.ReactNode
  /** The Owner's persisted choice for this group, when they've made one (undefined = default). */
  expandedOverride?: boolean
  onToggleExpanded: (goalId: string, next: boolean) => void
}) {
  const inactive = goal.state !== 'active'
  // Collapse choices persist across visits (edgecases #7): the default is
  // "expanded unless inactive", overridable per group by the stored toggle.
  const expanded = expandedOverride ?? !inactive
  const setExpanded = (next: boolean) => onToggleExpanded(goal.id, next)
  const { active: dropActive, isOver, dropProps } = useActionDropZone({
    pathId: goal.pathId,
    goalId: goal.id,
  })

  const visible = useMemo(
    () =>
      [...actions]
        .filter((a) => (showCompleted ? true : !isSettled(a)))
        .sort(compareActionsForList),
    [actions, showCompleted],
  )

  // An inactive Goal is only here because it still holds open work — if the
  // toggle hides even that, the header alone would dangle, so stay expanded
  // in effect by not rendering an empty body ("All clear" covers active ones).
  const openActionCount = actions.filter((a) => !isSettled(a)).length
  if (inactive && openActionCount === 0) return null

  const deadlineDays = goal.deadline ? daysUntil(goal.deadline) : null

  return (
    // Drop handlers only; the keyboard-accessible way to file an Action here
    // is the row menu's "Move to…".
    <section
      aria-label={`Goal: ${goal.name}`}
      {...dropProps}
      className={cn(
        'flex flex-col gap-1.5 rounded-lg',
        depth > 0 && 'border-l border-border pl-4',
        inactive && 'opacity-60',
        dropActive && 'outline-1 outline-dashed outline-border',
        isOver && 'bg-primary/5 outline-2 outline-solid outline-primary',
      )}
    >
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-expanded={expanded}
          aria-label={expanded ? `Collapse “${goal.name}”` : `Expand “${goal.name}”`}
          onClick={() => setExpanded(!expanded)}
          className="text-muted-foreground"
        >
          <ChevronDown className={cn('transition-transform', !expanded && '-rotate-90')} aria-hidden="true" />
        </Button>
        <h3
          className={cn(
            'min-w-0 flex-1 truncate text-sm font-medium',
            inactive && 'line-through text-muted-foreground',
          )}
        >
          {goal.name}
          {inactive && <span className="ml-2 text-xs font-normal normal-case">({goal.state})</span>}
        </h3>
        {goal.frog && (
          <span className="shrink-0 rounded-full bg-destructive/10 px-2 py-0.5 text-xs text-destructive">
            frog
          </span>
        )}
        {deadlineDays !== null && (
          <span
            className={cn(
              'shrink-0 rounded-full px-2 py-0.5 text-xs',
              deadlineDays < 0 ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground',
            )}
          >
            {deadlineLabel(deadlineDays)}
          </span>
        )}
        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
          {visible.length}
        </span>
      </div>

      {expanded && (
        <ul className="flex flex-col gap-1">
          {visible.map((a) => (
            <ActionRowItem key={a.id} {...actionRowProps(a, rowCallbacks)} />
          ))}
          {visible.length === 0 && openActionCount === 0 && actions.length > 0 && (
            <li className="px-2 py-1 text-xs text-muted-foreground" aria-live="polite">
              All clear
            </li>
          )}
        </ul>
      )}

      {expanded && <QuickAddActionRow label={`Add action to “${goal.name}”`} onCreate={onCreate} />}

      {expanded && childGoals.map((child) => renderChild(child, depth + 1))}
    </section>
  )
}
