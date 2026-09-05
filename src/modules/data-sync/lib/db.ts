import Dexie, { type EntityTable } from 'dexie'
import dexieCloud from 'dexie-cloud-addon'
import { getCloudUrl } from './cloud-config'
import type { Path } from '@/modules/paths/types/path'
import type { Goal } from '@/modules/goals/types/goal'
import type { Action } from '@/modules/capture-triage/types/action'
import type { Vision } from '@/modules/vision/types/vision'

/**
 * The sync database — a Dexie mirror of the app's four entity collections.
 * The app's source of truth stays in localStorage; this DB is the transport
 * the Dexie Cloud addon syncs against (see docs/modules/data-sync.md).
 *
 * Primary keys are the app's own `crypto.randomUUID()` ids. Dexie Cloud
 * supports custom string ids for synced tables as long as they are random
 * and globally unique — UUIDs are both — so rows move between local and
 * server with their identities (and foreign keys) intact, no remapping.
 */
export class BricksDB extends Dexie {
  paths!: EntityTable<Path, 'id'>
  goals!: EntityTable<Goal, 'id'>
  actions!: EntityTable<Action, 'id'>
  visions!: EntityTable<Vision, 'id'>

  constructor() {
    super('bricks', { addons: [dexieCloud] })

    this.version(1).stores({
      paths: 'id, order',
      goals: 'id, pathId, parentGoalId',
      actions: 'id, pathId, goalId, scheduledDate',
      visions: 'id, pathId',
    })

    // Without a URL the addon stays inert (every hook early-returns) and the
    // DB is a plain local Dexie. Configuring here means a saved URL needs a
    // reload to take effect — the settings UI does that explicitly.
    const cloudUrl = getCloudUrl()
    if (cloudUrl) {
      this.cloud.configure({
        databaseUrl: cloudUrl,
        requireAuth: true,
        // The page renders its own sign-in UI — the addon's default modal
        // would fight it (and hangs awaiting input during logout).
        customLoginGui: true,
      })
    }
  }
}

export const db = new BricksDB()
