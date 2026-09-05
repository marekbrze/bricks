import { useEffect, useState } from 'react'
import type { SyncState, UserLogin } from 'dexie-cloud-addon'
import { db } from '../lib/db'

export interface CloudStatus {
  /**
   * Undefined until the addon's first emission; after that, still not a
   * reliable "logged out" signal — the addon's BehaviorSubject emits a
   * startup default synchronously (`isLoading: true`, `isLoggedIn` unset)
   * before it has read the persisted login from IndexedDB. Callers must
   * treat both `undefined` and `isLoading: true` as "unknown".
   */
  user: UserLogin | undefined
  syncState: SyncState | undefined
}

/** Live subscription to the addon's auth + sync state. */
export function useCloudStatus(): CloudStatus {
  const [user, setUser] = useState<UserLogin | undefined>(undefined)
  const [syncState, setSyncState] = useState<SyncState | undefined>(undefined)

  useEffect(() => {
    const userSub = db.cloud.currentUser.subscribe(setUser)
    const syncSub = db.cloud.syncState.subscribe(setSyncState)
    return () => {
      userSub.unsubscribe()
      syncSub.unsubscribe()
    }
  }, [])

  return { user, syncState }
}
