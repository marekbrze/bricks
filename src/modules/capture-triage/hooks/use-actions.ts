import { useCallback, useMemo } from 'react'
import { useLocalStorageState } from '@/shared/hooks/use-local-storage'
import { generateId } from '@/shared/types'
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

  return {
    actions,
    inboxActions,
    /** The stored `actions` value exists but is unreadable — show a recovery screen. */
    dataUnreadable: corrupt,
    /** Wipe the corrupt value and start clean. */
    resetActions: clearActions,
    captureAction,
    assignAction,
    promoteAction,
    discardAction,
  }
}
