import { db } from './db'
import {
  countEntities,
  readLocalData,
  writeLocalData,
  type EntityCounts,
  type LocalData,
} from './local-data'

/**
 * The two directions a sync can go — the user picks one explicitly:
 *  - push: overwrite the server with this device's data
 *  - pull: overwrite this device's data with the server's
 * There is no merge; whichever side the user picks wins wholesale.
 */

const SYNC_TIMEOUT_MS = 20_000

/** Resolve once the addon completes a sync round (or already is in sync). */
export function waitForSync(timeoutMs = SYNC_TIMEOUT_MS): Promise<void> {
  return new Promise((resolve, reject) => {
    if (db.cloud.syncState.getValue().phase === 'in-sync') return resolve()
    const timer = setTimeout(() => {
      subscription.unsubscribe()
      reject(new Error('Sync did not finish in time. Check your connection and try again.'))
    }, timeoutMs)
    const subscription = db.cloud.events.syncComplete.subscribe({
      next: () => {
        clearTimeout(timer)
        subscription.unsubscribe()
        resolve()
      },
      error: (err) => {
        clearTimeout(timer)
        subscription.unsubscribe()
        reject(err instanceof Error ? err : new Error(String(err)))
      },
    })
  })
}

function toError(err: unknown): Error {
  return err instanceof Error ? err : new Error(String(err))
}

/** Trigger a sync round and wait for it to land. */
async function syncAndWait(): Promise<void> {
  await db.cloud.sync()
  await waitForSync()
}

/** The addon stamps synced rows with realm/ownership props — keep them out of app storage. */
function stripSyncProps<T extends object>(rows: T[]): T[] {
  const syncOnly = new Set(['owner', 'realmId'])
  return rows.map((row) => {
    const clean: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(row)) {
      if (!syncOnly.has(key)) clean[key] = value
    }
    return clean as T
  })
}

/**
 * Push: replace everything on the server with this device's data.
 * Clearing the tables first syncs as deletions, so the server ends up an
 * exact copy of local — additions, edits and removals alike.
 */
export async function pushLocalToServer(): Promise<EntityCounts> {
  const local = readLocalData()
  try {
    await db.transaction('rw', [db.paths, db.goals, db.actions, db.visions], async () => {
      await db.paths.clear()
      await db.goals.clear()
      await db.actions.clear()
      await db.visions.clear()
      // Ids are the app's own UUIDs, so rows keep their identity across the
      // wire and no foreign keys need remapping.
      await db.paths.bulkPut(local.paths)
      await db.goals.bulkPut(local.goals)
      await db.actions.bulkPut(local.actions)
      await db.visions.bulkPut(local.visions)
    })
    await syncAndWait()
    return countEntities(local)
  } catch (err) {
    throw toError(err)
  }
}

/** Read what the server currently holds (through the synced local DB). */
export async function readServerCounts(): Promise<EntityCounts> {
  const data: LocalData = {
    paths: await db.paths.toArray(),
    goals: await db.goals.toArray(),
    actions: await db.actions.toArray(),
    visions: await db.visions.toArray(),
  }
  return countEntities(data)
}

/**
 * Pull: replace this device's data with the server's, then reload so every
 * module re-reads localStorage. Ids on the server are the same UUIDs that
 * were pushed, so the app's references stay valid after the swap.
 */
export async function pullServerToLocal(): Promise<void> {
  try {
    await syncAndWait()
    const data: LocalData = {
      paths: stripSyncProps(await db.paths.toArray()),
      goals: stripSyncProps(await db.goals.toArray()),
      actions: stripSyncProps(await db.actions.toArray()),
      visions: stripSyncProps(await db.visions.toArray()),
    }
    writeLocalData(data)
    window.location.reload()
  } catch (err) {
    throw toError(err)
  }
}
