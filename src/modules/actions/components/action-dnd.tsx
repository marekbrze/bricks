import { createContext, useContext, useMemo, useState } from 'react'
import type { DragEvent, ReactNode } from 'react'
import type { Action } from '@/modules/capture-triage/types/action'

/**
 * Where a dragged Action can land: a Goal group (`goalId` set) or a Path's
 * standalone bucket (`goalId` null). Both the Actions view and a Path's
 * Actions tab drop into the same shape, so one provider serves both.
 */
export interface ActionDropTarget {
  pathId: string
  goalId: string | null
}

interface ActionDndValue {
  dragging: Action | null
  overKey: string | null
  begin: (action: Action) => void
  end: () => void
  setOver: (key: string | null) => void
  /** True when a drag is in flight and this target is somewhere else than where it started. */
  accepts: (target: ActionDropTarget) => boolean
  drop: (target: ActionDropTarget) => void
}

const ActionDndContext = createContext<ActionDndValue | null>(null)

/** Stable id for one drop zone — only the hovered zone lights up. */
export function dropTargetKey(target: ActionDropTarget): string {
  return `${target.pathId}:${target.goalId ?? 'standalone'}`
}

/**
 * Null outside a provider. Rows and groups then render exactly as before,
 * without drag affordances — which is what the Path overview's standalone
 * section and the Storybook stories of single components get.
 */
export function useActionDnd(): ActionDndValue | null {
  return useContext(ActionDndContext)
}

/**
 * Pointer drag-and-drop for Actions: drag a row onto a Goal group to file it
 * there, or onto a Path's "Standalone" block to strip its Goal. The
 * keyboard-accessible path is the row menu's "Move to…" — same rule the Goal
 * tree follows for its reorder drag (docs/adr/0026-path-actions-tab-and-drag-and-drop.md).
 *
 * `onMove` runs once per completed drop, with the Action as it was when the
 * drag started; the caller owns the write and its Undo toast.
 */
export function ActionDndProvider({
  onMove,
  children,
}: {
  onMove: (action: Action, target: ActionDropTarget) => void
  children: ReactNode
}) {
  const [dragging, setDragging] = useState<Action | null>(null)
  const [overKey, setOverKey] = useState<string | null>(null)

  const value = useMemo<ActionDndValue>(
    () => ({
      dragging,
      overKey,
      begin: (action) => setDragging(action),
      end: () => {
        setDragging(null)
        setOverKey(null)
      },
      setOver: setOverKey,
      accepts: (target) =>
        dragging !== null &&
        !(dragging.pathId === target.pathId && dragging.goalId === target.goalId),
      drop: (target) => {
        const action = dragging
        setDragging(null)
        setOverKey(null)
        if (!action) return
        if (action.pathId === target.pathId && action.goalId === target.goalId) return
        onMove(action, target)
      },
    }),
    [dragging, overKey, onMove],
  )

  return <ActionDndContext.Provider value={value}>{children}</ActionDndContext.Provider>
}

/** Props to spread on the element that starts a drag, plus its render flags. */
export function useActionDragSource(action: Action): {
  draggable: boolean
  isDragging: boolean
  dragProps: {
    onDragStart?: (e: DragEvent) => void
    onDragEnd?: () => void
  }
} {
  const dnd = useActionDnd()
  if (!dnd) return { draggable: false, isDragging: false, dragProps: {} }
  return {
    draggable: true,
    isDragging: dnd.dragging?.id === action.id,
    dragProps: {
      onDragStart: (e) => {
        e.dataTransfer.effectAllowed = 'move'
        // Some browsers refuse to start a drag without any payload; the name
        // also makes the row droppable into a plain text field elsewhere.
        e.dataTransfer.setData('text/plain', action.name)
        dnd.begin(action)
      },
      onDragEnd: () => dnd.end(),
    },
  }
}

/**
 * Props to spread on a group that accepts dropped Actions, plus its render
 * flags. Every handler stops propagation: Goal groups nest, and without it a
 * drop on a sub-Goal would also register on its parent.
 */
export function useActionDropZone(target: ActionDropTarget): {
  /** A drag is in flight and this zone would take it — worth hinting at. */
  active: boolean
  /** The dragged row is currently over this zone. */
  isOver: boolean
  dropProps: {
    onDragOver?: (e: DragEvent) => void
    onDragLeave?: (e: DragEvent) => void
    onDrop?: (e: DragEvent) => void
  }
} {
  const dnd = useActionDnd()
  const key = dropTargetKey(target)
  const accepts = dnd?.accepts(target) ?? false

  if (!dnd) return { active: false, isOver: false, dropProps: {} }

  return {
    active: accepts,
    isOver: accepts && dnd.overKey === key,
    dropProps: {
      onDragOver: (e) => {
        if (!accepts) return
        e.preventDefault()
        e.stopPropagation()
        e.dataTransfer.dropEffect = 'move'
        if (dnd.overKey !== key) dnd.setOver(key)
      },
      onDragLeave: (e) => {
        // Moving between children of the same zone fires `dragleave` on the
        // zone itself — only clear when the pointer really left it.
        const next = e.relatedTarget as Node | null
        if (next && e.currentTarget.contains(next)) return
        if (dnd.overKey === key) dnd.setOver(null)
      },
      onDrop: (e) => {
        if (!accepts) return
        e.preventDefault()
        e.stopPropagation()
        dnd.drop(target)
      },
    },
  }
}
