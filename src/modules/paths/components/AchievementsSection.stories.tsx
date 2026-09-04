import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { AchievementsSection } from './AchievementsSection'
import type { Achievement } from '../types/path'
import { generateId } from '@/shared/types'
import { Frame } from './story-helpers'

const meta: Meta<typeof AchievementsSection> = {
  title: 'Paths/AchievementsSection',
  component: AchievementsSection,
}
export default meta

type Story = StoryObj<typeof AchievementsSection>

function Harness({ initial }: { initial: Achievement[] }) {
  const [list, setList] = useState<Achievement[]>(initial)
  return (
    <Frame>
      <div className="max-w-md">
        <AchievementsSection
          achievements={list}
          onAdd={(title) =>
            setList((l) => [...l, { id: generateId(), title, state: 'open', achievedOn: null }])
          }
          onEdit={(id, title) => setList((l) => l.map((a) => (a.id === id ? { ...a, title } : a)))}
          onToggle={(id, achieved) =>
            setList((l) =>
              l.map((a) =>
                a.id === id
                  ? {
                      ...a,
                      state: achieved ? 'achieved' : 'open',
                      achievedOn: achieved ? new Date().toISOString().slice(0, 10) : null,
                    }
                  : a,
              ),
            )
          }
          onDelete={(id) => setList((l) => l.filter((a) => a.id !== id))}
        />
      </div>
    </Frame>
  )
}

export const Mixed: Story = {
  render: () => (
    <Harness
      initial={[
        { id: '1', title: 'I can do a strict pull-up', state: 'achieved', achievedOn: '2026-03-12' },
        { id: '2', title: 'I can do a muscle-up', state: 'open', achievedOn: null },
        { id: '3', title: '100 push-ups in one session', state: 'open', achievedOn: null },
      ]}
    />
  ),
}

export const Empty: Story = {
  render: () => <Harness initial={[]} />,
}

export const AllAchieved: Story = {
  render: () => (
    <Harness
      initial={[
        { id: '1', title: 'Run 5 km', state: 'achieved', achievedOn: '2026-04-01' },
        { id: '2', title: 'Run 10 km', state: 'achieved', achievedOn: '2026-07-01' },
      ]}
    />
  ),
}
