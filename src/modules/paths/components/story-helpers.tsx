import type { ReactNode } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import type { Decorator } from '@storybook/react-vite'
import { ToastProvider } from '@/shared/components/toast/toast-context'
import { Toaster } from '@/shared/components/toast/Toaster'
import { __resetStorageHealth } from '@/shared/lib/storage-health'
import type { Vision } from '@/modules/vision/types/vision'
import { MOCK_VISIONS } from '@/modules/vision/data/mock'
import type { Goal } from '@/modules/goals/types/goal'
import { MOCK_GOALS } from '@/modules/goals/data/mock'
import type { Action } from '@/modules/capture-triage/types/action'
import { MOCK_ACTIONS } from '@/modules/capture-triage/data/mock'
import type { Path } from '../types/path'
import { MOCK_PATHS } from '../data/mock'

export { MOCK_PATHS, MOCK_VISIONS, MOCK_GOALS, MOCK_ACTIONS }

function Providers({
  initialPath,
  route,
  children,
}: {
  initialPath: string
  /** Route pattern to mount the story under (e.g. `/paths/:pathId`) so pages
   * reading `useParams` get their params — a bare MemoryRouter matches
   * nothing and every param reads empty. */
  route?: string
  children: ReactNode
}) {
  return (
    <MemoryRouter initialEntries={[initialPath]}>
      <ToastProvider>
        <div className="mx-auto max-w-[1200px] p-4">
          {route ? <Routes><Route path={route} element={children} /></Routes> : children}
        </div>
        <Toaster />
      </ToastProvider>
    </MemoryRouter>
  )
}

/** Seed the `paths` LocalStorage key before the story mounts. */
export function seedPaths(paths: Path[]) {
  try {
    window.localStorage.setItem('paths', JSON.stringify(paths))
  } catch {
    /* ignore — stories still render from the hook's empty default */
  }
}

/** Write an unparseable value to the `paths` key, to exercise the recovery screen. */
export function seedCorruptPaths(): Decorator {
  return (Story) => {
    __resetStorageHealth()
    try {
      window.localStorage.setItem('paths', '{ this is not valid json ]')
    } catch {
      /* ignore */
    }
    return (
      <Providers initialPath="/paths">
        <Story />
      </Providers>
    )
  }
}

/** Wrap a story in a router + toast provider at the given route. */
export function routerAt(initialPath: string): Decorator {
  return (Story) => (
    <Providers initialPath={initialPath}>
      <Story />
    </Providers>
  )
}

/** Decorator that seeds a fixed dataset, then renders inside the providers. */
export function withPaths(paths: Path[], initialPath = '/paths', route?: string): Decorator {
  return (Story) => {
    __resetStorageHealth()
    seedPaths(paths)
    return (
      <Providers initialPath={initialPath} route={route}>
        <Story />
      </Providers>
    )
  }
}

/**
 * Like `withPaths` but also seeds `visions` — the overview reads the Vision
 * summary (including achievement progress, ADR 0037), so stories need both
 * keys to render their intended data.
 */
export function withPathsAndVisions(
  paths: Path[],
  visions: Vision[] = MOCK_VISIONS,
  initialPath = '/paths',
  route?: string,
): Decorator {
  return (Story) => {
    __resetStorageHealth()
    seedPaths(paths)
    try {
      window.localStorage.setItem('visions', JSON.stringify(visions))
    } catch {
      /* ignore — the summary renders its empty state */
    }
    return (
      <Providers initialPath={initialPath} route={route}>
        <Story />
      </Providers>
    )
  }
}

/**
 * The full Path overview data set — `paths` + `visions` + `goals` + `actions`.
 * The overview renders the Vision summary, the Stats row, and the inline Goal
 * tree (ADR 0043), so a faithful story needs every key seeded.
 */
export function withPathHub(
  paths: Path[] = MOCK_PATHS,
  visions: Vision[] = MOCK_VISIONS,
  goals: Goal[] = MOCK_GOALS,
  actions: Action[] = MOCK_ACTIONS,
  initialPath = '/paths/path-sport',
  route: string | undefined = '/paths/:pathId',
): Decorator {
  return (Story) => {
    __resetStorageHealth()
    seedPaths(paths)
    try {
      window.localStorage.setItem('visions', JSON.stringify(visions))
      window.localStorage.setItem('goals', JSON.stringify(goals))
      window.localStorage.setItem('actions', JSON.stringify(actions))
    } catch {
      /* ignore — sections fall back to their empty / recovery states */
    }
    return (
      <Providers initialPath={initialPath} route={route}>
        <Story />
      </Providers>
    )
  }
}

/** Seed a valid hub, then corrupt one collection to exercise its recovery screen. */
export function withPathHubCorrupt(
  key: 'goals' | 'actions' | 'visions',
  initialPath = '/paths/path-sport',
): Decorator {
  return (Story) => {
    __resetStorageHealth()
    seedPaths(MOCK_PATHS)
    try {
      window.localStorage.setItem('visions', JSON.stringify(MOCK_VISIONS))
      window.localStorage.setItem('goals', JSON.stringify(MOCK_GOALS))
      window.localStorage.setItem('actions', JSON.stringify(MOCK_ACTIONS))
      window.localStorage.setItem(key, '{ this is not valid json ]')
    } catch {
      /* ignore */
    }
    return (
      <Providers initialPath={initialPath} route="/paths/:pathId">
        <Story />
      </Providers>
    )
  }
}

export function Frame({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-[1200px] p-4">{children}</div>
}
