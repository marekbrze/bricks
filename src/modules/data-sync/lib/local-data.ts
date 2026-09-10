import { readStorageValue } from '@/shared/hooks/use-local-storage'
import type { Path } from '@/modules/paths/types/path'
import type { Goal } from '@/modules/goals/types/goal'
import type { Action } from '@/modules/capture-triage/types/action'
import type { Vision } from '@/modules/vision/types/vision'
import type { Essential } from '@/modules/essentials/types/essential'

/**
 * The app's source of truth: one JSON array per module in localStorage
 * (`paths`, `goals`, `actions`, `visions`, `essentials` — the same keys every
 * module's hook reads). `lib/mirror.ts` keeps the synced Dexie tables in step
 * with it.
 */
export interface LocalData {
  paths: Path[]
  goals: Goal[]
  actions: Action[]
  visions: Vision[]
  essentials: Essential[]
}

export interface EntityCounts {
  paths: number
  goals: number
  actions: number
  visions: number
  essentials: number
}

export function countEntities(data: LocalData): EntityCounts {
  return {
    paths: data.paths.length,
    goals: data.goals.length,
    actions: data.actions.length,
    visions: data.visions.length,
    essentials: data.essentials.length,
  }
}

export function totalEntities(counts: EntityCounts): number {
  return counts.paths + counts.goals + counts.actions + counts.visions + counts.essentials
}

/** Human-readable counts line for confirm dialogs and summaries. */
export function describeCounts(counts: EntityCounts): string {
  const parts = [
    `${counts.paths} ${counts.paths === 1 ? 'Path' : 'Paths'}`,
    `${counts.goals} ${counts.goals === 1 ? 'Goal' : 'Goals'}`,
    `${counts.actions} ${counts.actions === 1 ? 'Action' : 'Actions'}`,
    `${counts.visions} ${counts.visions === 1 ? 'Vision' : 'Visions'}`,
    `${counts.essentials} ${counts.essentials === 1 ? 'Essential' : 'Essentials'}`,
  ]
  return parts.join(', ')
}

/**
 * Read through the shared stores rather than LocalStorage directly, so a
 * count taken right after a write reflects it — the store's snapshot is what
 * the screens are rendering.
 */
function readArray<T>(key: string): T[] {
  const value = readStorageValue<T[]>(key, [])
  return Array.isArray(value) ? value : []
}

export function readLocalData(): LocalData {
  return {
    paths: readArray<Path>('paths'),
    goals: readArray<Goal>('goals'),
    actions: readArray<Action>('actions'),
    visions: readArray<Vision>('visions'),
    essentials: readArray<Essential>('essentials'),
  }
}
