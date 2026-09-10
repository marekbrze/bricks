import type { ReactNode } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import type { Decorator } from '@storybook/react-vite'
import { ToastProvider } from '@/shared/components/toast/toast-context'
import { Toaster } from '@/shared/components/toast/Toaster'
import { __resetStorageHealth } from '@/shared/lib/storage-health'
import { MOCK_PATHS } from '@/modules/paths/data/mock'
import { MOCK_ACTIONS } from '@/modules/capture-triage/data/mock'
import type { Essential } from '../types/essential'
import { MOCK_ESSENTIALS } from '../data/mock'

export { MOCK_ESSENTIALS, MOCK_PATHS, MOCK_ACTIONS }

function Providers({
  initialPath,
  route,
  children,
}: {
  initialPath: string
  /** Route pattern to mount under (e.g. `/paths/:pathId/essentials`) so pages
   * reading `useParams` get their params. */
  route?: string
  children: ReactNode
}) {
  return (
    <MemoryRouter initialEntries={[initialPath]}>
      <ToastProvider>
        <div className="mx-auto max-w-[1200px] p-4">
          {route ? (
            <Routes>
              <Route path={route} element={children} />
            </Routes>
          ) : (
            children
          )}
        </div>
        <Toaster />
      </ToastProvider>
    </MemoryRouter>
  )
}

/**
 * Seed `paths` (including the archived one, so a read-only Essentials tab is
 * reachable) + `actions` (the log history that drives the counters) +
 * `essentials`, then render at the given route.
 */
export function withEssentials(
  essentials: Essential[],
  initialPath = '/paths/path-sport/essentials',
  route: string | undefined = '/paths/:pathId/essentials',
): Decorator {
  return (Story) => {
    __resetStorageHealth()
    try {
      window.localStorage.setItem('paths', JSON.stringify(MOCK_PATHS))
      window.localStorage.setItem('actions', JSON.stringify(MOCK_ACTIONS))
      window.localStorage.setItem('essentials', JSON.stringify(essentials))
    } catch {
      /* ignore — stories still render from the hooks' empty defaults */
    }
    return (
      <Providers initialPath={initialPath} route={route}>
        <Story />
      </Providers>
    )
  }
}

/** Write an unparseable value to the `essentials` key — exercises the recovery screen. */
export function seedCorruptEssentials(initialPath = '/paths/path-sport/essentials'): Decorator {
  return (Story) => {
    __resetStorageHealth()
    try {
      window.localStorage.setItem('paths', JSON.stringify(MOCK_PATHS))
      window.localStorage.setItem('actions', JSON.stringify(MOCK_ACTIONS))
      window.localStorage.setItem('essentials', '{ this is not valid json ]')
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

export function Frame({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-[1200px] p-4">{children}</div>
}
