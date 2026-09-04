import { useSyncExternalStore } from 'react'

/**
 * App-wide LocalStorage health. The prototype's "backend" is the browser, so a
 * failed write (quota, private mode) or an unreadable value must reach the user
 * instead of vanishing. Hooks that touch LocalStorage report here; the
 * StorageHealthBanner (in AppShell) and per-module screens subscribe.
 */
interface StorageHealth {
  /** A write threw at least once this session (data is not persisting). */
  writeFailed: boolean
  /** Storage keys whose stored value could not be parsed. */
  corruptKeys: string[]
}

let state: StorageHealth = { writeFailed: false, corruptKeys: [] }
const listeners = new Set<() => void>()

function emit() {
  for (const l of listeners) l()
}

export function reportWriteFailure() {
  if (state.writeFailed) return
  state = { ...state, writeFailed: true }
  emit()
}

export function reportCorruptValue(key: string) {
  if (state.corruptKeys.includes(key)) return
  state = { ...state, corruptKeys: [...state.corruptKeys, key] }
  emit()
}

/** Called after a successful reset/recovery of a key. */
export function clearCorruptValue(key: string) {
  if (!state.corruptKeys.includes(key)) return
  state = { ...state, corruptKeys: state.corruptKeys.filter((k) => k !== key) }
  emit()
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export function useStorageHealth(): StorageHealth {
  return useSyncExternalStore(subscribe, () => state, () => state)
}

/** Test-only: reset the module state between stories / tests. */
export function __resetStorageHealth() {
  state = { writeFailed: false, corruptKeys: [] }
  emit()
}
