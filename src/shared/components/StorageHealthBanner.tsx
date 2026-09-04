import { AlertTriangle } from 'lucide-react'
import { useStorageHealth } from '@/shared/lib/storage-health'

/** One-time probe: can this browser persist to LocalStorage at all? */
function storageWritable(): boolean {
  try {
    const k = '__storage_probe__'
    window.localStorage.setItem(k, '1')
    window.localStorage.removeItem(k)
    return true
  } catch {
    return false
  }
}

const STORAGE_WRITABLE = storageWritable()

/**
 * App-wide banner shown when LocalStorage can't be relied on this session —
 * either the initial probe failed (storage blocked outright) or a write threw
 * later (quota filled mid-session). The user's changes stay in memory but won't
 * survive a reload. Rendered inside AppShell so it covers every screen.
 * (Corrupt-value recovery is handled per-module with a dedicated screen.)
 */
export function StorageHealthBanner() {
  const { writeFailed } = useStorageHealth()
  if (STORAGE_WRITABLE && !writeFailed) return null

  return (
    <div
      role="alert"
      className="border-b border-destructive/40 bg-destructive/10 px-4 py-2 text-center text-sm text-destructive"
    >
      <AlertTriangle className="mr-2 inline size-4 align-[-2px]" aria-hidden="true" />
      Changes aren’t being saved — this browser is blocking storage (private mode or
      it’s full). Your edits will be lost when you reload.
    </div>
  )
}
