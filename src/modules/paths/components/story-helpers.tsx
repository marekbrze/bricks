import type { ReactNode } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import type { Decorator } from '@storybook/react-vite'
import { ToastProvider } from '@/shared/components/toast/toast-context'
import { Toaster } from '@/shared/components/toast/Toaster'
import { __resetStorageHealth } from '@/shared/lib/storage-health'
import type { Vision } from '@/modules/vision/types/vision'
import { MOCK_VISIONS } from '@/modules/vision/data/mock'
import type { Path } from '../types/path'
import { MOCK_PATHS } from '../data/mock'

export { MOCK_PATHS }

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

export function Frame({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-[1200px] p-4">{children}</div>
}
