import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface Toast {
  id: string
  message: string
  action?: ToastAction
}

interface ToastContextValue {
  toasts: Toast[]
  /** Show a toast. Returns its id so callers can dismiss it early. */
  showToast: (message: string, action?: ToastAction) => string
  dismissToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const AUTO_DISMISS_MS = 5000
const AUTO_DISMISS_WITH_ACTION_MS = 8000

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>())

  const dismissToast = useCallback((id: string) => {
    setToasts((list) => list.filter((t) => t.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const showToast = useCallback(
    (message: string, action?: ToastAction) => {
      const id = crypto.randomUUID()
      setToasts((list) => [...list, { id, message, action }])
      const timer = setTimeout(
        () => dismissToast(id),
        action ? AUTO_DISMISS_WITH_ACTION_MS : AUTO_DISMISS_MS,
      )
      timers.current.set(id, timer)
      return id
    },
    [dismissToast],
  )

  const value = useMemo(
    () => ({ toasts, showToast, dismissToast }),
    [toasts, showToast, dismissToast],
  )

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}
