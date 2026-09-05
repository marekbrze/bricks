import { useEffect, useState } from 'react'
import type { SyncState, UserLogin } from 'dexie-cloud-addon'
import { db, isCloudConfigured, openDb } from '../lib/db'

export interface CloudStatus {
  /**
   * The addon's view of who is signed in. `undefined` until its first
   * emission; `isLoading: true` while it has not yet read the persisted login
   * out of IndexedDB. Both mean "not known yet", never "signed out".
   */
  user: UserLogin | undefined
  syncState: SyncState | undefined
  /** The addon has settled on a verdict — safe to render signed-in or signed-out. */
  resolved: boolean
  loggedIn: boolean
}

/**
 * Live subscription to the addon's auth + sync state.
 *
 * The subscription alone is not enough: `currentUser` only leaves its
 * `isLoading` default inside the addon's `ready` handler, which runs on
 * `db.open()`. Boot opens the database, and this asks again — a page that
 * subscribes to a database nobody opened waits forever.
 */
export function useCloudStatus(): CloudStatus {
  const [user, setUser] = useState<UserLogin | undefined>(undefined)
  const [syncState, setSyncState] = useState<SyncState | undefined>(undefined)

  useEffect(() => {
    if (!isCloudConfigured()) return
    void openDb().catch((err) => {
      console.error('[data-sync] could not open the sync database', err)
    })
    const userSub = db.cloud.currentUser.subscribe(setUser)
    const syncSub = db.cloud.syncState.subscribe(setSyncState)
    return () => {
      userSub.unsubscribe()
      syncSub.unsubscribe()
    }
  }, [])

  return {
    user,
    syncState,
    resolved: user !== undefined && user.isLoading !== true,
    loggedIn: user?.isLoggedIn === true,
  }
}
