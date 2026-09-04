import { AlertTriangle } from 'lucide-react'

/**
 * Shown when LocalStorage can't be written (private browsing, quota, blocked
 * cookies). The Paths list is the first screen that needs persisted data, so the
 * failure is surfaced here rather than silently falling back to a blank grid.
 */
export function StorageWarning() {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <p>
        Bricks can’t save to this browser right now — changes you make won’t stick after a reload.
        This usually means private browsing or blocked site data.
      </p>
    </div>
  )
}
