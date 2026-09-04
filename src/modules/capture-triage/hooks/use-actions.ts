import { useCallback, useEffect, useMemo } from 'react'
import { useLocalStorageState } from '@/shared/hooks/use-local-storage'
import { generateId } from '@/shared/types'
import { usePaths } from '@/modules/paths/hooks/use-paths'
import { useToast } from '@/shared/components/toast/toast-context'
import type { Action } from '../types/action'

const STORAGE_KEY = 'actions'

/**
 * Default is an empty list — the production build ships a clean empty state,
 * matching the `empty` dev scenario. Mock Actions live in `data/mock.ts`
 * (wired into the `full` / `minimal` scenarios); switch scenario from the
 * DevToolbar to see populated data.
 */
const INITIAL_ACTIONS: Action[] = []

/** A function that reverts one mutation; wired to an Undo toast by the caller. */
export type UndoFn = () => void

export function useActions() {
  const {
    value: actions,
    setValue: setActions,
    removeValue: clearActions,
    corrupt,
  } = useLocalStorageState<Action[]>(STORAGE_KEY, INITIAL_ACTIONS)
  const { paths } = usePaths()
  const { showToast } = useToast()

  // Self-heal: capture-triage has no way to hear about a Path being deleted
  // elsewhere (paths.deletePath only touches the `paths` key), so an
  // assigned Action can end up pointing at a Path that no longer exists.
  // Whenever that's detected, return the orphaned Action to the Inbox rather
  // than leave a dangling reference for `today` / `goals` to trip over later.
  useEffect(() => {
    const validPathIds = new Set(paths.map((p) => p.id))
    const orphaned = actions.filter((a) => a.pathId && !validPathIds.has(a.pathId))
    if (orphaned.length === 0) return
    setActions((prev) =>
      prev.map((a) =>
        a.pathId && !validPathIds.has(a.pathId)
          ? { ...a, updatedAt: new Date().toISOString(), state: 'inbox', pathId: null, goalId: null }
          : a,
      ),
    )
    showToast(
      orphaned.length === 1
        ? `“${orphaned[0].name}” moved back to the Inbox — its Path was deleted`
        : `${orphaned.length} items moved back to the Inbox — their Path was deleted`,
    )
  }, [paths, actions, setActions, showToast])

  const inboxActions = useMemo(
    () =>
      actions
        .filter((a) => a.state === 'inbox')
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [actions],
  )

  const touch = (a: Action): Action => ({ ...a, updatedAt: new Date().toISOString() })

  /** Restore the entire list to a snapshot — the basis for every Undo. */
  const restoreSnapshot = useCallback(
    (snapshot: Action[]): UndoFn =>
      () =>
        setActions(snapshot),
    [setActions],
  )

  /** Quick capture — name only, always lands in the Inbox. */
  const captureAction = useCallback(
    (name: string) => {
      const trimmed = name.trim()
      if (!trimmed) return
      const now = new Date().toISOString()
      const newAction: Action = {
        id: generateId(),
        createdAt: now,
        updatedAt: now,
        name: trimmed,
        state: 'inbox',
        pathId: null,
        goalId: null,
        frog: false,
        scheduledDate: null,
        completedAt: null,
      }
      setActions([...actions, newAction])
    },
    [actions, setActions],
  )

  /** Triage: assign to a Path (standalone when `goalId` is null) or into a Goal. */
  const assignAction = useCallback(
    (id: string, pathId: string, goalId: string | null) => {
      setActions(
        actions.map((a) =>
          a.id === id ? touch({ ...a, state: 'assigned', pathId, goalId }) : a,
        ),
      )
    },
    [actions, setActions],
  )

  /**
   * Triage: promote to a new Goal. `capture-triage` doesn't own `Goal`
   * creation (the `goals` module does, once built) — this just retires the
   * originating Inbox Action, since its idea now lives as the Goal itself.
   * Returns an Undo that restores the Action to the Inbox.
   */
  const promoteAction = useCallback(
    (id: string): UndoFn => {
      const snapshot = actions
      setActions(actions.filter((a) => a.id !== id))
      return restoreSnapshot(snapshot)
    },
    [actions, setActions, restoreSnapshot],
  )

  /** Triage: discard without assigning. Returns an Undo that restores it. */
  const discardAction = useCallback(
    (id: string): UndoFn => {
      const snapshot = actions
      setActions(actions.filter((a) => a.id !== id))
      return restoreSnapshot(snapshot)
    },
    [actions, setActions, restoreSnapshot],
  )

  // --- Cross-module surface for `goals` ------------------------------------
  // `goals` owns the Goal tree; these let it keep Actions in sync without
  // capture-triage needing to know anything about Goals itself.

  /** Delete Goal cascade: remove every Action assigned to any of these Goal ids. */
  const deleteActionsForGoals = useCallback(
    (goalIds: string[]) => {
      if (goalIds.length === 0) return
      const ids = new Set(goalIds)
      setActions(actions.filter((a) => !a.goalId || !ids.has(a.goalId)))
    },
    [actions, setActions],
  )

  /** Frog toggle: one-time propagation from a newly-frogged Goal to its current Actions. */
  const markFrogForGoalActions = useCallback(
    (goalId: string) => {
      setActions(actions.map((a) => (a.goalId === goalId ? touch({ ...a, frog: true }) : a)))
    },
    [actions, setActions],
  )

  /** Move Goal to another Path: carry every Action under the moved subtree along with it. */
  const reassignActionsToPath = useCallback(
    (goalIds: string[], pathId: string) => {
      if (goalIds.length === 0) return
      const ids = new Set(goalIds)
      setActions(actions.map((a) => (a.goalId && ids.has(a.goalId) ? touch({ ...a, pathId }) : a)))
    },
    [actions, setActions],
  )

  const actionCountForPath = useMemo(() => {
    const counts = new Map<string, number>()
    for (const a of actions) if (a.pathId) counts.set(a.pathId, (counts.get(a.pathId) ?? 0) + 1)
    return (pathId: string) => counts.get(pathId) ?? 0
  }, [actions])

  return {
    actions,
    inboxActions,
    actionCountForPath,
    /** The stored `actions` value exists but is unreadable — show a recovery screen. */
    dataUnreadable: corrupt,
    /** Wipe the corrupt value and start clean. */
    resetActions: clearActions,
    captureAction,
    assignAction,
    promoteAction,
    discardAction,
    deleteActionsForGoals,
    markFrogForGoalActions,
    reassignActionsToPath,
  }
}
