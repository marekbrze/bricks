import type { Meta, StoryObj } from '@storybook/react-vite'
import { VisionBoardPage } from './VisionBoardPage'
import { withVision, seedCorruptVisions, LONG_NOTE_VISION, MOCK_VISIONS } from './story-helpers'

const meta: Meta<typeof VisionBoardPage> = {
  title: 'Vision/VisionBoardPage',
  component: VisionBoardPage,
}
export default meta

type Story = StoryObj<typeof VisionBoardPage>

export const WithData: Story = {
  decorators: [withVision(MOCK_VISIONS)],
}

/** No tiles yet — the empty state carries its own Add menu, so the first add is one click away. */
export const EmptyBoard: Story = {
  decorators: [withVision([])],
}

/** A pasted wall of text clamps on the board; the full note stays one click away (click to edit). */
export const LongNoteClamped: Story = {
  decorators: [withVision(LONG_NOTE_VISION)],
}

/** An archived Path's board renders read-only: Add hidden, menus gone, Unarchive offered, Export kept. */
export const ArchivedPathReadOnly: Story = {
  decorators: [withVision(MOCK_VISIONS, '/paths/path-home/vision')],
}

/** A `pathId` with no Path behind it — the paths module's recovery screen, not a blank board. */
export const PathNotFound: Story = {
  decorators: [withVision(MOCK_VISIONS, '/paths/not-a-real-path/vision')],
}

/** Stored `visions` value is present but unparseable — recovery, not an inviting empty state. */
export const VisionsDataUnreadable: Story = {
  decorators: [seedCorruptVisions()],
}
