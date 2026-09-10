import type { Meta, StoryObj } from '@storybook/react-vite'
import { withEssentials, MOCK_ESSENTIALS } from './story-helpers'
import { EssentialRow } from './EssentialRow'

const meta: Meta<typeof EssentialRow> = {
  title: 'Essentials/EssentialRow',
  component: EssentialRow,
  decorators: [
    withEssentials(MOCK_ESSENTIALS, '/paths/path-sport', undefined),
    (Story) => (
      <ul className="flex max-w-2xl flex-col gap-1">
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
