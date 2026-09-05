import Dexie, { type EntityTable, type Table } from 'dexie'
import dexieCloud from 'dexie-cloud-addon'
import { getCloudUrl } from './cloud-config'
import type { Path } from '@/modules/paths/types/path'
import type { Goal } from '@/modules/goals/types/goal'
import type { Action } from '@/modules/capture-triage/types/action'
import type { Vision } from '@/modules/vision/types/vision'

/**
 * The sync database — a Dexie mirror of the app's four entity collections.
 * The app's source of truth stays in LocalStorage; this DB is the replica the
 * Dexie Cloud addon syncs against, kept in step both ways by `lib/mirror.ts`
 * (see docs/modules/data-sync.md).
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
        // No requireAuth: it would make the addon start its own login flow on
        // every page load while signed out (whose prompts nobody renders —
        // customLoginGui below). The page signs in explicitly instead, driving
        // db.cloud.userInteraction itself.
        // The page renders its own sign-in UI — the addon's default modal
        // would fight it (and hangs awaiting input during logout).
        customLoginGui: true,
      })
    }
  }
}

export const db = new BricksDB()

/** True when a cloud database URL is saved — the addon is configured and syncing. */
export function isCloudConfigured(): boolean {
  return getCloudUrl() !== null
}

/** The four synced tables, in the order a mirror pass walks them. */
export const SYNCED_TABLES = {
  paths: () => db.paths as unknown as Table<{ id: string }, string>,
  goals: () => db.goals as unknown as Table<{ id: string }, string>,
  actions: () => db.actions as unknown as Table<{ id: string }, string>,
  visions: () => db.visions as unknown as Table<{ id: string }, string>,
} as const

/**
 * Open the database once, and hand every caller the same promise.
 *
 * This is what makes the addon come alive: `db.cloud.currentUser` starts as a
 * BehaviorSubject holding `{ isLoading: true }` and is only replaced with the
 * login persisted in IndexedDB inside the addon's `ready` handler — which runs
 * on `db.open()` and nowhere else. Subscribing without ever opening leaves the
 * UI reading that startup default forever ("Checking sign-in…" with no
 * verdict), and no sync ever starts. Boot calls this; so does every sync op.
 */
let openPromise: Promise<Dexie> | null = null

export function openDb(): Promise<Dexie> {
  if (!openPromise) {
    openPromise = db.open().catch((err) => {
      // Let the next caller retry rather than caching a permanent failure.
      openPromise = null
      throw err
    })
  }
  return openPromise
}
