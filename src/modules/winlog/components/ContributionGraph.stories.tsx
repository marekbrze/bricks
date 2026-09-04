import type { Meta, StoryObj } from '@storybook/react-vite'
import { ContributionGraph } from './ContributionGraph'

const meta: Meta<typeof ContributionGraph> = {
  title: 'WinLog/ContributionGraph',
  component: ContributionGraph,
  decorators: [(Story) => <div className="p-4"><Story /></div>],
}
export default meta

type Story = StoryObj<typeof ContributionGraph>

/** Deterministic sample so the graph shows a realistic mix of low/mid/high-activity days. */
function sampleWinDays(): Record<string, number> {
  const days: Record<string, number> = {}
  const today = new Date()
  let s = 7
  const rand = () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
  for (let i = 26 * 7; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const iso = d.toISOString().slice(0, 10)
    const weekday = d.getDay()
    const base = weekday === 0 || weekday === 6 ? 0.25 : 0.6
    if (rand() < base) days[iso] = 1 + Math.floor(rand() * 3)
  }
  return days
}

export const Full: Story = {
  args: { winDays: sampleWinDays(), weeks: 26, label: 'Sport wins' },
}

export const Compact: Story = {
  args: { winDays: sampleWinDays(), weeks: 16, compact: true, label: 'Sport wins' },
}

export const NoWins: Story = {
  args: { winDays: {}, weeks: 26, label: 'New Path wins' },
}

/** Counts from 1 through 6+ on consecutive days — the six-tier scale (docs/modules/winlog-edgecases.md #6) stays distinguishable instead of capping out at 3. */
export const HighActivityRange: Story = {
  args: {
    winDays: (() => {
      const days: Record<string, number> = {}
      const today = new Date()
      for (let i = 0; i < 7; i++) {
        const d = new Date(today)
        d.setDate(today.getDate() - i)
        days[d.toISOString().slice(0, 10)] = i + 1
      }
      return days
    })(),
    weeks: 4,
    label: 'High-activity week',
  },
}
