import type { Meta, StoryObj } from '@storybook/react-vite'
import { UnsplashSearchDialog } from './UnsplashSearchDialog'

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

/** An empty query browses the full curated pool before the Owner commits to a word. */
export const FullPool: Story = {}

/** A query matching nothing shows the retry message; the field stays editable. */
export const NoResults: Story = {
  args: { initialQuery: 'zzz' },
}
