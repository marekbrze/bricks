import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import type { Decorator } from '@storybook/react-vite'
import { ToastProvider } from '@/shared/components/toast/toast-context'
import { Toaster } from '@/shared/components/toast/Toaster'
import { __resetStorageHealth } from '@/shared/lib/storage-health'
import { MOCK_PATHS } from '@/modules/paths/data/mock'
import { MOCK_GOALS } from '@/modules/goals/data/mock'
import { MOCK_ACTIONS } from '@/modules/capture-triage/data/mock'
import type { Path } from '@/modules/paths/types/path'
import type { Goal } from '@/modules/goals/types/goal'
import type { Action } from '@/modules/capture-triage/types/action'

export { MOCK_PATHS, MOCK_GOALS, MOCK_ACTIONS }

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

/** Seed `paths` + `goals` + `actions`, then render at the given route. */
export function withWinLogData(
  actions: Action[] = MOCK_ACTIONS,
  goals: Goal[] = MOCK_GOALS,
  paths: Path[] = MOCK_PATHS,
  initialPath = '/winlog',
): Decorator {
  return (Story) => {
    __resetStorageHealth()
    try {
      window.localStorage.setItem('paths', JSON.stringify(paths))
      window.localStorage.setItem('goals', JSON.stringify(goals))
      window.localStorage.setItem('actions', JSON.stringify(actions))
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
export function seedCorruptActions(initialPath = '/winlog'): Decorator {
  return (Story) => {
    __resetStorageHealth()
    try {
      window.localStorage.setItem('paths', JSON.stringify(MOCK_PATHS))
      window.localStorage.setItem('goals', JSON.stringify(MOCK_GOALS))
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
