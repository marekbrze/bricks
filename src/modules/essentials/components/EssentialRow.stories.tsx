import type { Meta, StoryObj } from '@storybook/react-vite'
import { withEssentials, MOCK_ESSENTIALS } from './story-helpers'
import { EssentialRow } from './EssentialRow'

const meta: Meta<typeof EssentialRow> = {
  title: 'Essentials/EssentialRow',
  component: EssentialRow,
  decorators: [
    withEssentials(MOCK_ESSENTIALS, '/paths/path-sport', '/paths/:pathId'),
    (Story, ctx) => (
      <ul
        className={ctx.parameters.narrow ? 'flex w-[340px] flex-col gap-1' : 'flex max-w-2xl flex-col gap-1'}
      >
        <Story />
      </ul>
    ),
  ],
  args: {
    index: 0,
    siblingCount: 3,
    dragId: null,
    onDragStart: () => {},
    onDropOn: () => {},
    onDragEnd: () => {},
    onReorder: () => {},
    onLog: () => {},
    onEdit: () => {},
    onDelete: () => {},
  },
}
export default meta

type Story = StoryObj<typeof EssentialRow>

/** Logged today and before — the counter reads "N today · M total". */
export const LoggedToday: Story = {
  args: { essential: MOCK_ESSENTIALS[0] },
}

/** A deed with history but nothing today — just the all-time total. */
export const NotToday: Story = {
  args: { essential: MOCK_ESSENTIALS[2] },
}

/** Never logged — "Not logged yet". */
export const NeverLogged: Story = {
  args: { essential: MOCK_ESSENTIALS[3] },
}

/** Read-only (archived Path): no Log button, no menu, no drag handle. */
export const ReadOnly: Story = {
  args: { essential: MOCK_ESSENTIALS[0], readOnly: true },
}

/**
 * ~340 px (phone): the counter drops under the deed name so the name keeps
 * its width and the Log button + menu stay reachable (edgecases #3).
 */
export const NarrowScreen: Story = {
  args: { essential: MOCK_ESSENTIALS[0] },
  parameters: { narrow: true },
}
