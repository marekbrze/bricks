import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import type { Decorator } from '@storybook/react-vite'
import { ToastProvider } from '@/shared/components/toast/toast-context'
import { Toaster } from '@/shared/components/toast/Toaster'
import { __resetStorageHealth } from '@/shared/lib/storage-health'
import type { Path } from '../types/path'
import { MOCK_PATHS } from '../data/mock'

export { MOCK_PATHS }

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
export function withPaths(paths: Path[], initialPath = '/paths'): Decorator {
  return (Story) => {
    __resetStorageHealth()
    seedPaths(paths)
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
