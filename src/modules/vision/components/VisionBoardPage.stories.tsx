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

/**
 * Achievement tiles (ADR 0037) sit on the board like any other tile: tick to
 * achieve (win tint wash), untick to reopen, edit inline, reorder, delete.
 */
export const WithAchievements: Story = {
  decorators: [withVision([MOCK_VISIONS[0]])],
}

/** Every achievement ticked — all tiles carry the done wash and their achieved dates. */
export const AllAchievementsAchieved: Story = {
  decorators: [
    withVision([
      {
        ...MOCK_VISIONS[0],
        tiles: MOCK_VISIONS[0].tiles.map((tile) =>
          tile.type === 'achievement'
            ? { ...tile, state: 'achieved' as const, achievedOn: tile.achievedOn ?? '2026-08-01' }
            : tile,
        ),
      },
    ]),
  ],
}

/** An archived Path's board renders read-only: Add hidden, menus gone, checkboxes disabled, Unarchive offered, Export kept. */
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
