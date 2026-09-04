import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import type { Decorator } from '@storybook/react-vite'
import type { Path } from '../types/path'
import { MOCK_PATHS } from '../data/mock'

export { MOCK_PATHS }

/** Seed the `paths` LocalStorage key before the story mounts. */
export function seedPaths(paths: Path[]) {
  try {
    window.localStorage.setItem('paths', JSON.stringify(paths))
  } catch {
    /* ignore — stories still render from the hook's empty default */
  }
}

/** Wrap a story in a router at the given route. */
export function routerAt(initialPath: string): Decorator {
  return (Story) => (
    <MemoryRouter initialEntries={[initialPath]}>
      <div className="mx-auto max-w-[1200px] p-4">
        <Story />
      </div>
    </MemoryRouter>
  )
}

/** Decorator that seeds a fixed dataset, then renders inside a router. */
export function withPaths(paths: Path[], initialPath = '/paths'): Decorator {
  return (Story) => {
    seedPaths(paths)
    return (
      <MemoryRouter initialEntries={[initialPath]}>
        <div className="mx-auto max-w-[1200px] p-4">
          <Story />
        </div>
      </MemoryRouter>
    )
  }
}

export function Frame({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-[1200px] p-4">{children}</div>
}
