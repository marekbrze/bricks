import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import type { Decorator } from '@storybook/react-vite'
import { ToastProvider } from '@/shared/components/toast/toast-context'
import { Toaster } from '@/shared/components/toast/Toaster'
import { __resetStorageHealth } from '@/shared/lib/storage-health'
import { MOCK_PATHS } from '@/modules/paths/data/mock'
import { MOCK_ACTIONS } from '@/modules/capture-triage/data/mock'
import type { Goal } from '../types/goal'
import { MOCK_GOALS } from '../data/mock'

export { MOCK_GOALS, MOCK_PATHS, MOCK_ACTIONS }

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

/** Seed `paths` + `actions` + `goals`, then render at the given route. */
export function withGoals(goals: Goal[], initialPath = '/paths/path-sport/goals'): Decorator {
  return (Story) => {
    __resetStorageHealth()
    try {
      window.localStorage.setItem('paths', JSON.stringify(MOCK_PATHS.filter((p) => !p.archived)))
      window.localStorage.setItem('actions', JSON.stringify(MOCK_ACTIONS))
      window.localStorage.setItem('goals', JSON.stringify(goals))
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

/** Write an unparseable value to the `goals` key, to exercise the recovery screen. */
export function seedCorruptGoals(initialPath = '/paths/path-sport/goals'): Decorator {
  return (Story) => {
    __resetStorageHealth()
    try {
      window.localStorage.setItem('paths', JSON.stringify(MOCK_PATHS.filter((p) => !p.archived)))
      window.localStorage.setItem('actions', JSON.stringify(MOCK_ACTIONS))
      window.localStorage.setItem('goals', '{ this is not valid json ]')
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

/** Write an unparseable value to the `actions` key — Goals routes should recover, not show `0 Actions` silently. */
export function seedCorruptActions(initialPath = '/paths/path-sport/goals'): Decorator {
  return (Story) => {
    __resetStorageHealth()
    try {
      window.localStorage.setItem('paths', JSON.stringify(MOCK_PATHS.filter((p) => !p.archived)))
      window.localStorage.setItem('actions', '{ this is not valid json ]')
      window.localStorage.setItem('goals', JSON.stringify(MOCK_GOALS))
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

/** Seed with `paths` including the archived one, so an archived Path's Goals render read-only. */
export function withArchivedPathGoals(goals: Goal[], initialPath = '/paths/path-home/goals'): Decorator {
  return (Story) => {
    __resetStorageHealth()
    try {
      window.localStorage.setItem('paths', JSON.stringify(MOCK_PATHS))
      window.localStorage.setItem('actions', JSON.stringify(MOCK_ACTIONS))
      window.localStorage.setItem('goals', JSON.stringify(goals))
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
