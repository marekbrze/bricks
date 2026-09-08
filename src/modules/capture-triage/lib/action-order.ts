import type { Action } from '../types/action'

/**
 * Manual ordering for a Goal's own Actions (ADR 0042) — read only where a
 * Goal's own sequence is the content (the Goal progress page). Aggregate
 * views keep `compareActionsForList` (frog-first → scheduled → creation);
 * these helpers are deliberately not used there.
 */

/**
 * Total order over Actions by `order`, ascending. An Action without one
 * (legacy row, mock, anything created before ADR 0042) sorts after every
 * sequenced sibling, by creation order — so old data reads as "in the order
 * it was added" with no migration pass.
 */
export function compareActionsByOrder(a: Action, b: Action): number {
  const oa = a.order ?? Number.MAX_SAFE_INTEGER
  const ob = b.order ?? Number.MAX_SAFE_INTEGER
  if (oa !== ob) return oa - ob
  return a.createdAt.localeCompare(b.createdAt)
}

/**
 * The order value that appends to the end of a group's current visual order
 * (a Goal's own Actions, or a Path's standalone block when `goalId` is null).
 *
 * Undefined until the group is fully sequenced: stamping a number into a
 * group of unsequenced (legacy) siblings would sort the new row BEFORE them
 * — the comparator sends unsequenced rows last — while plain creation order
 * already puts the newest row at the end. The first reorder renumbers the
 * whole group, and appends become numeric from then on. Gaps left by deletes
 * are fine either way; only the max matters.
 */
export function nextOrderFor(
  actions: Action[],
  pathId: string,
  goalId: string | null,
): number | undefined {
  const siblings = actions.filter((a) => a.pathId === pathId && a.goalId === goalId)
  if (siblings.length === 0 || siblings.some((a) => a.order === undefined)) return undefined
  return Math.max(...siblings.map((a) => a.order as number)) + 1
}
