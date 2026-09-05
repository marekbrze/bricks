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
  // Also clears `scheduledDate`/`completedAt` — an Inbox Action carrying a
  // stale day (from before its Path vanished) would otherwise silently
  // reappear on that old date the moment it's re-triaged. See
  // docs/modules/today-edgecases.md #1.
  useEffect(() => {
    const validPathIds = new Set(paths.map((p) => p.id))
    const orphaned = actions.filter((a) => a.pathId && !validPathIds.has(a.pathId))
    if (orphaned.length === 0) return
    setActions((prev) =>
      prev.map((a) =>
        a.pathId && !validPathIds.has(a.pathId)
          ? {
              ...a,
              updatedAt: new Date().toISOString(),
              state: 'inbox',
              pathId: null,
              goalId: null,
              scheduledDate: null,
              completedAt: null,
            }
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

  /**
   * Move Goal to another Path: carry every Action under the moved subtree
   * along with it. Returns an Undo so the caller can make the whole move
   * (Goals + Actions) reversible in one toast.
   */
  const reassignActionsToPath = useCallback(
    (goalIds: string[], pathId: string): UndoFn => {
      if (goalIds.length === 0) return () => {}
      const snapshot = actions
      const ids = new Set(goalIds)
      setActions(actions.map((a) => (a.goalId && ids.has(a.goalId) ? touch({ ...a, pathId }) : a)))
      return restoreSnapshot(snapshot)
    },
    [actions, setActions, restoreSnapshot],
  )

  const actionCountForPath = useMemo(() => {
    const counts = new Map<string, number>()
    for (const a of actions) if (a.pathId) counts.set(a.pathId, (counts.get(a.pathId) ?? 0) + 1)
    return (pathId: string) => counts.get(pathId) ?? 0
  }, [actions])

  // --- Cross-module surface for `today` ------------------------------------
  // `today` owns scheduling, completion, and the abandon/reschedule loop —
  // these let it drive the same `Action` lifecycle without capture-triage
  // needing to know anything about day views.

  /**
   * Set `scheduledDate`. Also used to *reschedule* an `abandoned` Action
   * from the Review-abandoned surface, which is why it flips the state back
   * to `assigned` — an abandoned Action re-entering a day view is active
   * again, not still abandoned.
   *
   * A `done` Action keeps its `state`/`completedAt` when moved to another
   * day ("Move to another day" on an already-completed row, per
   * docs/modules/today.md) — only a non-`done` Action gets bumped to
   * `assigned`. Flipping `done` back to `assigned` here would silently drop
   * the Action's Win from `winlog` and un-check it in Today, even though
   * the Owner only meant to move it, not un-complete it. See
   * docs/modules/winlog-edgecases.md #1.
   */
  const scheduleAction = useCallback(
    (id: string, dateIso: string) => {
      setActions(
        actions.map((a) =>
          a.id === id
            ? touch({ ...a, scheduledDate: dateIso, state: a.state === 'done' ? 'done' : 'assigned' })
            : a,
        ),
      )
    },
    [actions, setActions],
  )

  /** Clears `scheduledDate` — the Action returns to its Goal/Path backlog, not deleted or abandoned. */
  const unscheduleAction = useCallback(
    (id: string) => {
      setActions(actions.map((a) => (a.id === id ? touch({ ...a, scheduledDate: null }) : a)))
    },
    [actions, setActions],
  )

  /** Marks done. The row stays visible (in its completed style) for the rest of that day — see docs/modules/today.md. */
  const completeAction = useCallback(
    (id: string) => {
      setActions(
        actions.map((a) =>
          a.id === id ? touch({ ...a, state: 'done', completedAt: new Date().toISOString() }) : a,
        ),
      )
    },
    [actions, setActions],
  )

  /** Reverses completion — back to `assigned`, clears `completedAt`. Removes the Win from `winlog`. */
  const uncompleteAction = useCallback(
    (id: string) => {
      setActions(
        actions.map((a) => (a.id === id ? touch({ ...a, state: 'assigned', completedAt: null }) : a)),
      )
    },
    [actions, setActions],
  )

  /**
   * Scheduled-for-today but decided against entirely (distinct from moving
   * it to another day). Returns an Undo, same as `discardAction` — a mis-click
   * shouldn't cost a trip through Review abandoned to reverse.
   */
  const abandonAction = useCallback(
    (id: string): UndoFn => {
      const snapshot = actions
      setActions(actions.map((a) => (a.id === id ? touch({ ...a, state: 'abandoned' }) : a)))
      return restoreSnapshot(snapshot)
    },
    [actions, setActions, restoreSnapshot],
  )

  /** Permanent removal — reachable from Review-abandoned and the Actions view's row menu; never from an active day view. */
  const deleteAction = useCallback(
    (id: string): UndoFn => {
      const snapshot = actions
      setActions(actions.filter((a) => a.id !== id))
      return restoreSnapshot(snapshot)
    },
    [actions, setActions, restoreSnapshot],
  )

  /** Actions in view on a given day: scheduled for that date and not abandoned (completed ones stay). */
  const scheduledActionsForDate = useCallback(
    (dateIso: string) =>
      actions
        .filter((a) => a.scheduledDate === dateIso && (a.state === 'assigned' || a.state === 'done'))
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [actions],
  )

  /** Assigned but not yet scheduled — the pool the "Add to today" picker draws from. */
  const unscheduledActions = useMemo(
    () =>
      actions
        .filter((a) => a.state === 'assigned' && !a.scheduledDate)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [actions],
  )

  const abandonedActions = useMemo(
    () => actions.filter((a) => a.state === 'abandoned').sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [actions],
  )

  /** Every distinct date (today or later) that has at least one scheduled Action, ascending — drives the Schedule (agenda) view. */
  const upcomingScheduledDates = useCallback(
    (fromDateIso: string) => {
      const dates = new Set<string>()
      for (const a of actions) {
        if (a.scheduledDate && a.scheduledDate >= fromDateIso && (a.state === 'assigned' || a.state === 'done')) {
          dates.add(a.scheduledDate)
        }
      }
      return [...dates].sort()
    },
    [actions],
  )

  // --- Cross-module surface for `actions` ----------------------------------
  // The Actions view (flat grouped list) creates already-assigned Actions
  // straight from its quick-add rows — skipping the Inbox entirely, unlike
  // `captureAction`. Everything else it does (schedule, complete, rename)
  // rides the existing surface above.

  /**
   * Quick-add from the Actions view: create an Action already assigned to a
   * Goal (or standalone to a Path when `goalId` is null), with an optional
   * due date. No-op on an empty/whitespace name, mirroring `captureAction`.
   */
  const createAction = useCallback(
    (data: { name: string; pathId: string; goalId?: string | null; scheduledDate?: string | null }) => {
      const trimmed = data.name.trim()
      if (!trimmed) return
      const now = new Date().toISOString()
      const newAction: Action = {
        id: generateId(),
        createdAt: now,
        updatedAt: now,
        name: trimmed,
        state: 'assigned',
        pathId: data.pathId,
        goalId: data.goalId ?? null,
        frog: false,
        scheduledDate: data.scheduledDate || null,
        completedAt: null,
      }
      setActions([...actions, newAction])
    },
    [actions, setActions],
  )

  /** Rename from the Actions view's row menu — no-op on an empty/whitespace name. */
  const renameAction = useCallback(
    (id: string, name: string) => {
      const trimmed = name.trim()
      if (!trimmed) return
      setActions(
        actions.map((a) => (a.id === id ? touch({ ...a, name: trimmed }) : a)),
      )
    },
    [actions, setActions],
  )

  /**
   * Per-Action frog toggle (Actions view row menu). Unlike the Goal-side
   * toggle in `useGoals`, no propagation either way: marking one Action a
   * frog doesn't touch its siblings, un-marking doesn't retract what a Goal
   * marked earlier (same "one-time propagation" stance as `markFrogForGoalActions`).
   */
  const toggleActionFrog = useCallback(
    (id: string) => {
      setActions(actions.map((a) => (a.id === id ? touch({ ...a, frog: !a.frog }) : a)))
    },
    [actions, setActions],
  )

  return {
    actions,
    inboxActions,
    actionCountForPath,
    createAction,
    renameAction,
    toggleActionFrog,
    scheduleAction,
    unscheduleAction,
    completeAction,
    uncompleteAction,
    abandonAction,
    deleteAction,
    scheduledActionsForDate,
    unscheduledActions,
    abandonedActions,
    upcomingScheduledDates,
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
