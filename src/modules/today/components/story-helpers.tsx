import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import type { Decorator } from '@storybook/react-vite'
import { ToastProvider } from '@/shared/components/toast/toast-context'
import { Toaster } from '@/shared/components/toast/Toaster'
import { __resetStorageHealth } from '@/shared/lib/storage-health'
import { MOCK_PATHS } from '@/modules/paths/data/mock'
import { MOCK_ACTIONS } from '@/modules/capture-triage/data/mock'
import type { Action } from '@/modules/capture-triage/types/action'
import type { Path } from '@/modules/paths/types/path'

export { MOCK_PATHS, MOCK_ACTIONS }

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

/** Seed `paths` + `actions`, then render at the given route. */
export function withTodayData(
  actions: Action[],
  paths: Path[] = MOCK_PATHS.filter((p) => !p.archived),
  initialPath = '/today',
): Decorator {
  return (Story) => {
    __resetStorageHealth()
    try {
      window.localStorage.setItem('paths', JSON.stringify(paths))
      window.localStorage.setItem('actions', JSON.stringify(actions))
      window.localStorage.setItem('goals', '[]')
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
export function seedCorruptActions(initialPath = '/today'): Decorator {
  return (Story) => {
    __resetStorageHealth()
    try {
      window.localStorage.setItem('paths', JSON.stringify(MOCK_PATHS.filter((p) => !p.archived)))
      window.localStorage.setItem('actions', '{ this is not valid json ]')
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

/** Write an unparseable value to the `paths` key, to exercise the recovery screen. */
export function seedCorruptPaths(initialPath = '/today'): Decorator {
  return (Story) => {
    __resetStorageHealth()
    try {
      window.localStorage.setItem('paths', '{ this is not valid json ]')
      window.localStorage.setItem('actions', JSON.stringify(MOCK_ACTIONS))
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
