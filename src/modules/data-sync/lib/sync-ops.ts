import { readStorageValue } from '@/shared/hooks/use-local-storage'
import { db, openDb, SYNCED_TABLES } from './db'
import {
  activateMirror,
  adoptDexieIntoLocal,
  pushAllToDexie,
  resetMirrorBase,
  resumeMirror,
  suspendMirror,
  SYNCED_KEYS,
} from './mirror'
import {
  clearPendingSignIn,
  isPullPending,
  setPendingPull,
  type SyncDirection,
} from './sign-in-intent'

/**
 * The operations that move data as a whole — everything that is not the
 * continuous, row-by-row mirroring in `mirror.ts`.
 *
 * There are only three, and they all hang off the account's lifecycle:
 * choosing a direction when connecting, finishing that choice once signed in,
 * and putting the database back to local-only on sign-out. Ordinary edits
 * never come through here; they sync as they happen.
 */

const SYNC_TIMEOUT_MS = 20_000

function toError(err: unknown): Error {
  return err instanceof Error ? err : new Error(String(err))
}

function withTimeout<T>(promise: Promise<T>, message: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), SYNC_TIMEOUT_MS)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (err) => {
        clearTimeout(timer)
        reject(toError(err))
      },
    )
  })
}

/** Run a full sync round and wait for it to land. */
export async function syncNow(purpose: 'push' | 'pull' = 'pull'): Promise<void> {
  await withTimeout(
    db.cloud.sync({ purpose, wait: true }),
    'Sync did not finish in time. Check your connection and try again.',
  )
}

function readLocalRows(key: (typeof SYNCED_KEYS)[number]): { id: string }[] {
  const value = readStorageValue<{ id: string }[]>(key, [])
  return Array.isArray(value) ? value : []
}

// --- Connecting -----------------------------------------------------------

/**
 * Prepare for a sign-in that will move data in `direction`.
 *
 * `push` only has to make sure the database matches the app before the addon
 * takes over: on the first login every local row is claimed by the new user
 * and uploaded, which is exactly what pushing means.
 *
 * `pull` is the destructive one, and it is why this can reload the page. The
 * same claim-and-upload would send this device's data to a server the user
 * just said should win — so the local database has to be gone before the
 * login, mutation log included, or its pending deletes would land on the
 * server's rows on the way up. Deleting a Dexie database means reopening it,
 * hence the reload; the app's storage is untouched and stays the fallback
 * until the server's data has actually arrived.
 *
 * @returns true when the page is reloading and the caller should stop.
 */
export async function beginSignIn(direction: SyncDirection): Promise<boolean> {
  if (direction === 'pull') {
    if (isPullPending()) {
      // Already prepared — this is the reloaded page picking the flow back up.
      // Boot left the mirror suspended for exactly this; do not suspend twice,
      // and above all do not delete and reload again.
      await openDb()
      return false
    }
    // Suspend before deleting: a live query watching a database that is
    // vanishing under it must not report the emptiness as the app's new data.
    suspendMirror()
    setPendingPull()
    await db.delete()
    window.location.reload()
    return true
  }

  await openDb()
  suspendMirror()
  try {
    await pushAllToDexie()
  } catch (err) {
    resumeMirror()
    throw toError(err)
  }
  return false
}

/**
 * Finish the connect once the sign-in has succeeded, and leave the mirror
 * running. From this point on the direction never matters again.
 */
export async function completeSignIn(direction: SyncDirection): Promise<void> {
  await syncNow('pull')
  if (direction === 'pull') {
    // Boot suspended the mirror and skipped its first pass; the server's rows
    // are the app's data now, so adopt them before letting the two sides track.
    await adoptDexieIntoLocal()
    clearPendingSignIn()
    resumeMirror()
    await activateMirror()
    return
  }
  try {
    await makeServerMatchLocal()
  } finally {
    resumeMirror()
  }
}

/** Give up on a sign-in that failed or was cancelled, restoring local-only state. */
export async function abandonSignIn(direction: SyncDirection): Promise<void> {
  clearPendingSignIn()
  if (direction === 'pull') {
    // The database was deleted and nothing replaced it — rebuild it from the
    // app's storage, which still holds everything.
    resetMirrorBase()
    await pushAllToDexie()
    resumeMirror()
    await activateMirror()
    return
  }
  resumeMirror()
}

/**
 * Make the server an exact copy of this device. The sign-in has already
 * uploaded the local rows and pulled down whatever the server held; anything
 * that arrived and is not local is data the user chose to discard, so it is
 * deleted and the deletion synced.
 */
async function makeServerMatchLocal(): Promise<void> {
  for (const key of SYNCED_KEYS) {
    const local = readLocalRows(key)
    const localIds = new Set(local.map((row) => row.id))
    const table = SYNCED_TABLES[key]()
    const stale = (await table.toArray()).map((row) => row.id).filter((id) => !localIds.has(id))
    if (stale.length === 0) continue
    await table.bulkDelete(stale)
  }
  await syncNow('push')
}

// --- Signing out ----------------------------------------------------------

/**
 * Sign out and go back to local-only. The addon empties every table on logout
 * (that is how it drops another user's data), so the mirror is held while that
 * happens and the database is rebuilt from the app's storage afterwards —
 * signing out must cost the user nothing.
 */
export async function signOut(): Promise<void> {
  suspendMirror()
  try {
    await db.cloud.logout()
    resetMirrorBase()
    await pushAllToDexie()
  } finally {
    resumeMirror()
  }
}
