import type { Decorator, Meta, StoryObj } from '@storybook/react-vite'
import { UnsplashSearchDialog } from './UnsplashSearchDialog'
import { SAMPLE_UNSPLASH_PHOTOS } from '../data/unsplash-samples'
import type { UnsplashClient, UnsplashErrorKind, UnsplashPhoto } from '../lib/unsplash-api'

const KEY_STORAGE_KEY = 'bricks-unsplash-key'
/** Shape-valid, non-functional — nothing in the stories reaches the network. */
const FAKE_KEY = 'storybook_key_0000000000000000000000000000'

/** Pretend Unsplash is connected in this browser, so the search UI renders. */
const withKey: Decorator = (Story) => {
  try {
    window.localStorage.setItem(KEY_STORAGE_KEY, FAKE_KEY)
  } catch {
    /* ignore — the story then renders the connect panel */
  }
  return <Story />
}

/** No key stored: the dialog opens on its connect panel. */
const withoutKey: Decorator = (Story) => {
  try {
    window.localStorage.removeItem(KEY_STORAGE_KEY)
  } catch {
    /* ignore */
  }
  return <Story />
}

/** Page `n` of fake results, so "Load more" has something to append. */
function pageOf(page: number): UnsplashPhoto[] {
  return SAMPLE_UNSPLASH_PHOTOS.map((photo) => ({
    ...photo,
    id: `${photo.id}-p${page}`,
    photoUrl: 'https://unsplash.com/photos/example',
  }))
}

const resultsClient: UnsplashClient = {
  search: async ({ page }) => ({ ok: true, photos: pageOf(page), hasMore: page < 3 }),
}

const emptyClient: UnsplashClient = {
  search: async () => ({ ok: true, photos: [], hasMore: false }),
}

const failingClient = (error: UnsplashErrorKind): UnsplashClient => ({
  search: async () => ({ ok: false, error }),
})

/** Never settles — the skeleton grid stays up. */
const pendingClient: UnsplashClient = {
  search: () => new Promise(() => {}),
}

const meta: Meta<typeof UnsplashSearchDialog> = {
  title: 'Vision/UnsplashSearchDialog',
  component: UnsplashSearchDialog,
  args: {
    open: true,
    onOpenChange: () => {},
    onPick: () => {},
  },
}
export default meta

type Story = StoryObj<typeof UnsplashSearchDialog>

/** Connected: live results, paged — the everyday case. */
export const Results: Story = {
  decorators: [withKey],
  args: { client: resultsClient },
}

/** The request is in flight; placeholders hold the grid's shape. */
export const Loading: Story = {
  decorators: [withKey],
  args: { client: pendingClient },
}

/** A query Unsplash has nothing for. */
export const NoResults: Story = {
  decorators: [withKey],
  args: { initialQuery: 'zzzqqq', client: emptyClient },
}

/** The demo key's 50 requests an hour are spent. */
export const RateLimited: Story = {
  decorators: [withKey],
  args: { client: failingClient('rate-limit') },
}

/** Offline, or Unsplash unreachable — Retry stays available. */
export const NetworkError: Story = {
  decorators: [withKey],
  args: { client: failingClient('network') },
}

/** The stored key was rejected; the Owner can paste another. */
export const RejectedKey: Story = {
  decorators: [withKey],
  args: { client: failingClient('auth') },
}

/** No key yet: connect Unsplash, or fall back to the bundled sample photos. */
export const NotConnected: Story = {
  decorators: [withoutKey],
}
