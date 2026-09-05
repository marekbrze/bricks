import { useCallback, useSyncExternalStore } from 'react';
import { reportCorruptValue, reportWriteFailure } from '@/shared/lib/storage-health';

export interface UseLocalStorageResult<T> {
  value: T;
  setValue: (value: T | ((val: T) => T)) => void;
  removeValue: () => void;
  /** The stored value existed but could not be parsed — distinct from "no data". */
  corrupt: boolean;
}

interface Snapshot<T> {
  value: T;
  corrupt: boolean;
}

function readInitial<T>(key: string, initialValue: T): Snapshot<T> {
  try {
    const item = window.localStorage.getItem(key);
    if (item === null) return { value: initialValue, corrupt: false };
    return { value: JSON.parse(item) as T, corrupt: false };
  } catch {
    // A value is present but unreadable (corrupt JSON) — or storage is blocked.
    const present = (() => {
      try {
        return window.localStorage.getItem(key) !== null;
      } catch {
        return false;
      }
    })();
    if (present) reportCorruptValue(key);
    return { value: initialValue, corrupt: present };
  }
}

/**
 * One store per storage key, shared by every hook instance reading that key —
 * `useSyncExternalStore` subscribers all re-render off the same snapshot.
 * Without this, two components mounting `useLocalStorageState('actions', …)`
 * independently (e.g. `QuickCaptureInput` and `InboxPage`) each hold their
 * own `useState`: a write from one never reaches the other's snapshot, so the
 * second component's view goes stale until something else remounts it.
 */
class LocalStorageStore<T> {
  private listeners = new Set<() => void>();
  private snapshot: Snapshot<T>;
  private key: string;
  private initialValue: T;

  constructor(key: string, initialValue: T) {
    this.key = key;
    this.initialValue = initialValue;
    this.snapshot = readInitial(key, initialValue);
  }

  getSnapshot = (): Snapshot<T> => this.snapshot;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private emit() {
    for (const listener of this.listeners) listener();
  }

  setValue = (value: T | ((val: T) => T)): void => {
    const next = value instanceof Function ? value(this.snapshot.value) : value;
    try {
      window.localStorage.setItem(this.key, JSON.stringify(next));
    } catch (error) {
      // Quota exceeded, private mode, blocked cookies — surface it, but keep
      // the new value in memory so the session still works.
      console.error(`Error setting localStorage key "${this.key}":`, error);
      reportWriteFailure();
    }
    this.snapshot = { value: next, corrupt: false };
    this.emit();
  };

  removeValue = (): void => {
    try {
      window.localStorage.removeItem(this.key);
    } catch (error) {
      console.error(`Error removing localStorage key "${this.key}":`, error);
    }
    this.snapshot = { value: this.initialValue, corrupt: false };
    this.emit();
  };
}

const stores = new Map<string, LocalStorageStore<unknown>>();

function getStore<T>(key: string, initialValue: T): LocalStorageStore<T> {
  let store = stores.get(key);
  if (!store) {
    store = new LocalStorageStore(key, initialValue) as LocalStorageStore<unknown>;
    stores.set(key, store);
  }
  return store as LocalStorageStore<T>;
}

/**
 * Tuple form kept for backwards compatibility: `[value, setValue, removeValue]`.
 * Use `useLocalStorageState` for the object form with the `corrupt` flag.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const state = useLocalStorageState(key, initialValue);
  return [state.value, state.setValue, state.removeValue] as const;
}

export function useLocalStorageState<T>(key: string, initialValue: T): UseLocalStorageResult<T> {
  const store = getStore(key, initialValue);
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot);

  // Stable identities across renders (the store itself doesn't change per key).
  const setValue = useCallback(store.setValue, [store]);
  const removeValue = useCallback(store.removeValue, [store]);

  return { value: snapshot.value, setValue, removeValue, corrupt: snapshot.corrupt };
}
