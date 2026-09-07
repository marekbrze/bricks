import type { Meta, StoryObj } from '@storybook/react-vite'
import { userEvent } from 'storybook/test'
import { VisionBoardPage } from './VisionBoardPage'
import { withVision, seedCorruptVisions, LONG_NOTE_VISION, MOCK_VISIONS } from './story-helpers'

const meta: Meta<typeof VisionBoardPage> = {
  title: 'Vision/VisionBoardPage',
  component: VisionBoardPage,
}
export default meta

type Story = StoryObj<typeof VisionBoardPage>

/** View mode is the default: the board reads as an article — prose, figures, to-do rows. */
export const WithData: Story = {
  decorators: [withVision(MOCK_VISIONS)],
}

/**
 * Edit mode — reached through the header's real Edit button. Same single
 * column, blocks as cards: drag handles, Move/Delete menus, click-to-edit,
  * the "+ Add" control, and Done to go back to reading.
 */
export const EditMode: Story = {
  decorators: [withVision(MOCK_VISIONS)],
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByRole('button', { name: 'Edit' }))
  },
}

/** No tiles yet — the empty state carries its own Add menu, which opens edit mode with the draft form. */
export const EmptyBoard: Story = {
  decorators: [withVision([])],
}

/** A pasted wall of text reads in full — the article column has no grid row to blow out (ADR 0040). */
export const LongNoteReadsInFull: Story = {
  decorators: [withVision(LONG_NOTE_VISION)],
}

/**
 * Achievement tiles (ADR 0037) read as to-do rows in the article — and their
 * checkboxes stay live in view mode: "it came true" is a reading moment.
 */
export const WithAchievements: Story = {
  decorators: [withVision([MOCK_VISIONS[0]])],
}

/** Every achievement ticked — done wash, strike-through and achieved dates, still in the article flow. */
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

/** An archived Path renders in view mode only: no Edit toggle, Add hidden, checkboxes disabled, Unarchive offered, Export kept. */
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
