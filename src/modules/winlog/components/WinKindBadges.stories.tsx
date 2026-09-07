import type { Meta, StoryObj } from '@storybook/react-vite'
import { WinKindBadges } from './WinKindBadges'

const meta: Meta<typeof WinKindBadges> = {
  title: 'WinLog/WinKindBadges',
  component: WinKindBadges,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="flex max-w-md flex-col gap-3 rounded-lg border border-border bg-muted/30 p-3">
        <Story />
      </div>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof WinKindBadges>

/** Both kinds live — the day-header / PathCard form of the win vocabulary. */
export const BothKinds: Story = {
  args: { counts: { small: 3, big: 1 } },
}

/** Only small wins that day. */
export const SmallWinsOnly: Story = {
  args: { counts: { small: 5, big: 0 } },
}

/** A day with no wins never renders — but a zero scope still reads honestly. */
export const Zeroed: Story = {
  args: { counts: { small: 0, big: 0 } },
}
