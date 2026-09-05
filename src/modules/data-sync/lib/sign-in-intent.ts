/**
 * Which way the data should move the first time this device signs in.
 *
 * The choice is made once, at connect time, and it is the only directional
 * decision in the module — after it, sync runs continuously in both
 * directions and nothing asks the user anything again.
 *
 *  - `push` — this device's data becomes the server's.
 *  - `pull` — the server's data becomes this device's.
 *
 * `pull` needs the local database gone before the sign-in (see `sync-ops.ts`),
 * which costs a reload — so the intent is parked in SessionStorage to survive
 * it. SessionStorage, not Local: abandoning the flow by closing the tab must
 * leave nothing behind that could confuse the next boot.
 */
export type SyncDirection = 'push' | 'pull'

const INTENT_KEY = 'bricks-sign-in-intent'

export function setPendingPull(): void {
  try {
    sessionStorage.setItem(INTENT_KEY, 'pull')
  } catch {
    // ignore
  }
}

export function isPullPending(): boolean {
  try {
    return sessionStorage.getItem(INTENT_KEY) === 'pull'
  } catch {
    return false
  }
}

export function clearPendingSignIn(): void {
  try {
    sessionStorage.removeItem(INTENT_KEY)
  } catch {
    // ignore
  }
}
