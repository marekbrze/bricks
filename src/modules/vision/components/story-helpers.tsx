import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import type { Decorator } from '@storybook/react-vite'
import { ToastProvider } from '@/shared/components/toast/toast-context'
import { Toaster } from '@/shared/components/toast/Toaster'
import { __resetStorageHealth } from '@/shared/lib/storage-health'
import { MOCK_PATHS } from '@/modules/paths/data/mock'
import type { Vision } from '../types/vision'
import { MOCK_VISIONS } from '../data/mock'

export { MOCK_VISIONS, MOCK_PATHS }

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

/**
 * Seed `paths` (including the archived one, so the read-only board is
 * reachable) + `visions`, then render at the given board route.
 */
export function withVision(visions: Vision[], initialPath = '/paths/path-sport/vision'): Decorator {
  return (Story) => {
    __resetStorageHealth()
    try {
      window.localStorage.setItem('paths', JSON.stringify(MOCK_PATHS))
      window.localStorage.setItem('visions', JSON.stringify(visions))
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

/** Write an unparseable value to the `visions` key, to exercise the recovery screen. */
export function seedCorruptVisions(initialPath = '/paths/path-sport/vision'): Decorator {
  return (Story) => {
    __resetStorageHealth()
    try {
      window.localStorage.setItem('paths', JSON.stringify(MOCK_PATHS))
      window.localStorage.setItem('visions', '{ this is not valid json ]')
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

/** A vision holding one wall-of-text note, to show the display-only clamp. */
export const LONG_NOTE_VISION: Vision[] = [
  {
    id: 'vision-long-note',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pathId: 'path-sport',
    tiles: [
      {
        id: 'vision-long-note-1',
        type: 'note',
        text: 'Move without pain, feel strong and light. '.repeat(4) +
          'Be the person who takes the stairs two at a time, who says yes to the long walk, ' +
          'who books the trip with the hills in it. Train early, before the day gets a say in it. ' +
          'Not chasing a number on a scale — chasing what the body can do: carry the luggage up, ' +
          'keep up with the dog, plant the whole garden in one afternoon and still stand up the ' +
          'next morning without complaining. Rest is part of the plan, not the reward for it. ' +
          'A body that lets me forget about it, because it just works.',
      },
      {
        id: 'vision-long-note-image',
        type: 'image',
        src: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=480&q=80',
        alt: 'A hiker silhouetted on a mountain ridge at sunrise',
        source: 'unsplash',
        attribution: { photographer: 'Marek Piwnicki', profileUrl: 'https://unsplash.com/@marekpiwnicki' },
      },
    ],
  },
]
