import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from './toast-context'

/**
 * Bottom-centre toast stack. Polite live region so screen readers announce new
 * toasts without stealing focus. Rendered once, near the root.
 */
export function Toaster() {
  const { toasts, dismissToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div
      aria-live="polite"
      // Sits above the mobile bottom tabs and the dev-only scenario toolbar.
      className="pointer-events-none fixed inset-x-0 bottom-20 z-[10000] flex flex-col items-center gap-2 px-4 md:bottom-6"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-lg border border-border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md"
        >
          <span className="flex-1">{toast.message}</span>
          {toast.action && (
            <Button
              variant="outline"
              size="xs"
              onClick={() => {
                toast.action?.onClick()
                dismissToast(toast.id)
              }}
            >
              {toast.action.label}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => dismissToast(toast.id)}
            aria-label="Dismiss notification"
          >
            <X aria-hidden="true" />
          </Button>
        </div>
      ))}
    </div>
  )
}
