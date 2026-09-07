import type { Meta, StoryObj } from '@storybook/react-vite'
import { WinBalance } from './WinBalance'

const meta: Meta<typeof WinBalance> = {
  title: 'WinLog/WinBalance',
  component: WinBalance,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof WinBalance>

/** The Log's `lg` balance with both kinds live. */
export const LogScale: Story = {
  args: { counts: { small: 128, big: 4 }, size: 'lg' },
}

/** Embedded scopes (Path overview, Goal progress) run the `sm` balance. */
export const EmbeddedScale: Story = {
  args: { counts: { small: 23, big: 1 }, size: 'sm' },
}

/**
 * Honest zero — an empty scope reads `0 · 0`, muted, pointing nowhere and
 * hiding nothing (ADR 0039).
 */
export const HonestZero: Story = {
  args: { counts: { small: 0, big: 0 }, size: 'lg' },
}

/** Big wins only — a Goal closed without any Action logged under it. */
export const BigWinsOnly: Story = {
  args: { counts: { small: 0, big: 2 }, size: 'lg' },
}
