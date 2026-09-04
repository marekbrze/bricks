import { useCallback, useState } from 'react';
import { reportCorruptValue, reportWriteFailure } from '@/shared/lib/storage-health';

export interface UseLocalStorageResult<T> {
  value: T;
  setValue: (value: T | ((val: T) => T)) => void;
  removeValue: () => void;
  /** The stored value existed but could not be parsed — distinct from "no data". */
  corrupt: boolean;
}

function readInitial<T>(key: string, initialValue: T): { value: T; corrupt: boolean } {
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
 * Tuple form kept for backwards compatibility: `[value, setValue, removeValue]`.
 * Use `useLocalStorageState` for the object form with the `corrupt` flag.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const state = useLocalStorageState(key, initialValue);
  return [state.value, state.setValue, state.removeValue] as const;
}

export function useLocalStorageState<T>(key: string, initialValue: T): UseLocalStorageResult<T> {
  const [{ value: storedValue, corrupt }, setState] = useState(() => readInitial(key, initialValue));

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      setState((prev) => {
        const next = value instanceof Function ? value(prev.value) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(next));
        } catch (error) {
          // Quota exceeded, private mode, blocked cookies — surface it, but keep
          // the new value in memory so the session still works.
          console.error(`Error setting localStorage key "${key}":`, error);
          reportWriteFailure();
        }
        return { value: next, corrupt: false };
      });
    },
    [key],
  );

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
    setState({ value: initialValue, corrupt: false });
  }, [key, initialValue]);

  return { value: storedValue, setValue, removeValue, corrupt };
}
