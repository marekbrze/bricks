import type { Path } from '@/modules/paths/types/path'
import type { Goal } from '@/modules/goals/types/goal'
import type { Action } from '@/modules/capture-triage/types/action'
import type { Vision } from '@/modules/vision/types/vision'

/**
 * The app's source of truth: one JSON array per module in localStorage
 * (`paths`, `goals`, `actions`, `visions` — the same keys every module's
 * hook reads). Sync operations move this data in and out of Dexie wholesale.
 */
export interface LocalData {
  paths: Path[]
  goals: Goal[]
  actions: Action[]
  visions: Vision[]
}

export interface EntityCounts {
  paths: number
  goals: number
  actions: number
  visions: number
}

export function countEntities(data: LocalData): EntityCounts {
  return {
    paths: data.paths.length,
    goals: data.goals.length,
    actions: data.actions.length,
    visions: data.visions.length,
  }
}

export function totalEntities(counts: EntityCounts): number {
  return counts.paths + counts.goals + counts.actions + counts.visions
}

/** Human-readable counts line for confirm dialogs and summaries. */
export function describeCounts(counts: EntityCounts): string {
  const parts = [
    `${counts.paths} ${counts.paths === 1 ? 'Path' : 'Paths'}`,
    `${counts.goals} ${counts.goals === 1 ? 'Goal' : 'Goals'}`,
    `${counts.actions} ${counts.actions === 1 ? 'Action' : 'Actions'}`,
    `${counts.visions} ${counts.visions === 1 ? 'Vision' : 'Visions'}`,
  ]
  return parts.join(', ')
}

function readArray<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as T[]) : []
  } catch {
    return []
  }
}

export function readLocalData(): LocalData {
  return {
    paths: readArray<Path>('paths'),
    goals: readArray<Goal>('goals'),
    actions: readArray<Action>('actions'),
    visions: readArray<Vision>('visions'),
  }
}

export function writeLocalData(data: LocalData): void {
  localStorage.setItem('paths', JSON.stringify(data.paths))
  localStorage.setItem('goals', JSON.stringify(data.goals))
  localStorage.setItem('actions', JSON.stringify(data.actions))
  localStorage.setItem('visions', JSON.stringify(data.visions))
}
