import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import type { Decorator } from '@storybook/react-vite'
import { ToastProvider } from '@/shared/components/toast/toast-context'
import { Toaster } from '@/shared/components/toast/Toaster'
import { __resetStorageHealth } from '@/shared/lib/storage-health'
import { MOCK_PATHS } from '@/modules/paths/data/mock'
import type { Action } from '../types/action'
import { MOCK_ACTIONS, MOCK_INBOX_ACTIONS } from '../data/mock'

export { MOCK_ACTIONS, MOCK_INBOX_ACTIONS, MOCK_PATHS }

function Providers({ initialPath, children }: { initialPath: string; children: ReactNode }) {
  return (
    <MemoryRouter initialEntries={[initialPath]}>
      <ToastProvider>
        <div className="mx-auto max-w-[1200px] p-4">{children}</div>
        <Toaster />
      </ToastProvider>
    </MemoryRouter>
  )
}

/** Decorator that seeds `actions` (and real `paths`, for the assign picker), then renders. */
export function withActions(actions: Action[], initialPath = '/capture-triage'): Decorator {
  return (Story) => {
    __resetStorageHealth()
    try {
      window.localStorage.setItem('actions', JSON.stringify(actions))
      window.localStorage.setItem('paths', JSON.stringify(MOCK_PATHS.filter((p) => !p.archived)))
    } catch {
      /* ignore — stories still render from the hooks' empty defaults */
    }
    return (
      <Providers initialPath={initialPath}>
        <Story />
      </Providers>
    )
  }
}

/** Write an unparseable value to the `actions` key, to exercise the recovery screen. */
export function seedCorruptActions(initialPath = '/capture-triage'): Decorator {
  return (Story) => {
    __resetStorageHealth()
    try {
      window.localStorage.setItem('actions', '{ this is not valid json ]')
      window.localStorage.setItem('paths', JSON.stringify(MOCK_PATHS.filter((p) => !p.archived)))
    } catch {
      /* ignore */
    }
    return (
      <Providers initialPath={initialPath}>
        <Story />
      </Providers>
    )
  }
}

/**
 * An assigned Action pointing at a Path id that isn't in the seeded `paths`
 * list — exercises the self-heal in `useActions` (moves it back to the
 * Inbox + toasts) that closes edgecases #1.
 */
export const MOCK_ORPHANED_ACTION: Action = {
  id: 'action-orphaned',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  name: 'Renew the gym membership',
  state: 'assigned',
  pathId: 'path-deleted',
  goalId: null,
  frog: false,
  scheduledDate: null,
  completedAt: null,
}

/** Same as `withActions`, but with no Paths at all — exercises the "create a Path first" states. */
export function withActionsNoPaths(actions: Action[], initialPath = '/capture-triage'): Decorator {
  return (Story) => {
    __resetStorageHealth()
    try {
      window.localStorage.setItem('actions', JSON.stringify(actions))
      window.localStorage.setItem('paths', JSON.stringify([]))
    } catch {
      /* ignore */
    }
    return (
      <Providers initialPath={initialPath}>
        <Story />
      </Providers>
    )
  }
}
