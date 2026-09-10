import { Check, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useActions } from '@/modules/capture-triage/hooks/use-actions'
import type { Essential } from '../types/essential'
import { EssentialOverflowMenu } from './EssentialOverflowMenu'

export function EssentialRow({
  essential,
  index,
  siblingCount,
  readOnly = false,
  dragId,
  onDragStart,
  onDropOn,
  onDragEnd,
  onReorder,
  onLog,
  onEdit,
  onDelete,
}: {
  essential: Essential
  index: number
  siblingCount: number
  readOnly?: boolean
  dragId: string | null
  onDragStart: (id: string) => void
  onDropOn: (essential: Essential, index: number) => void
  onDragEnd: () => void
  onReorder: (essential: Essential, toIndex: number) => void
  onLog: (essential: Essential) => void
  onEdit: (essential: Essential) => void
  onDelete: (essential: Essential) => void
}) {
  const { essentialCompletionCounts } = useActions()
  const { total, today } = essentialCompletionCounts(essential.id)

  const draggable = !readOnly && siblingCount > 1

  const counter = (
    <span
      className="text-xs text-muted-foreground tabular-nums"
      // A concise spoken form — the visible glyphs read fine, but this keeps
      // the "today vs all-time" meaning explicit for a screen reader.
      aria-label={
        total === 0
          ? 'Not logged yet'
          : `Logged ${today} ${today === 1 ? 'time' : 'times'} today, ${total} in total`
      }
    >
      {total === 0 ? (
        'Not logged yet'
      ) : (
        <>
          {today > 0 && <span className="font-medium text-foreground">{today} today</span>}
          {today > 0 && <span aria-hidden="true"> · </span>}
          {total} logged
        </>
      )}
    </span>
  )

  return (
    <li>
      {/* Pointer drag-to-reorder within the Path's Essentials; the
          keyboard-accessible path is the overflow menu's Move up / Move down. */}
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions -- drag handlers on a
          plain div; keyboard reorder lives in the overflow menu */}
      <div
        draggable={draggable}
        onDragStart={() => onDragStart(essential.id)}
        onDragOver={(e) => {
          if (dragId && dragId !== essential.id) e.preventDefault()
        }}
        onDrop={(e) => {
          if (!dragId) return
          e.preventDefault()
          onDropOn(essential, index)
        }}
        onDragEnd={onDragEnd}
        className={cn(
          'group flex items-center gap-3 rounded-lg border border-border bg-card p-2 transition-colors',
          dragId === essential.id && 'opacity-50',
        )}
      >
        {draggable && (
          <GripVertical
            className="-ml-1 size-4 shrink-0 cursor-grab text-muted-foreground active:cursor-grabbing"
            aria-hidden="true"
          />
        )}

        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-medium break-words" title={essential.name}>
            {essential.name}
          </p>
          {essential.detail && (
            <p
              className="line-clamp-1 text-xs text-muted-foreground break-words"
              title={essential.detail}
            >
              {essential.detail}
            </p>
          )}
          {/* Narrow screens: the counter stacks under the name so the deed
              text keeps its width. `sm:` and up shows it inline on the right. */}
          <div className="mt-1 sm:hidden">{counter}</div>
        </div>

        <span className="hidden shrink-0 text-right sm:block">{counter}</span>

        {!readOnly && (
          <>
            <Button size="sm" variant="outline" onClick={() => onLog(essential)}>
              <Check aria-hidden="true" /> Log
            </Button>
            <EssentialOverflowMenu
              essentialName={essential.name}
              onEdit={() => onEdit(essential)}
              onDelete={() => onDelete(essential)}
              onMoveUp={() => onReorder(essential, index - 1)}
              onMoveDown={() => onReorder(essential, index + 1)}
              canMoveUp={index > 0}
              canMoveDown={index < siblingCount - 1}
            />
          </>
        )}
      </div>
    </li>
  )
}
