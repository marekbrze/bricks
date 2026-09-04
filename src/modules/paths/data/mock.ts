import type { Path } from '../types/path'

const nowIso = new Date().toISOString()

export const MOCK_PATHS: Path[] = [
  {
    id: 'path-sport',
    createdAt: nowIso,
    updatedAt: nowIso,
    name: 'Sport',
    order: 0,
    archived: false,
    archivedAt: null,
    visionSnippet:
      'Move without pain, feel strong and light. Be the person who takes the stairs two at a time.',
    achievements: [
      { id: 'ach-1', title: 'I can do a strict pull-up', state: 'achieved', achievedOn: '2026-03-12' },
      { id: 'ach-2', title: 'I can do a muscle-up', state: 'open', achievedOn: null },
      { id: 'ach-3', title: '100 push-ups in one session', state: 'open', achievedOn: null },
      { id: 'ach-4', title: 'I can touch the floor with straight legs', state: 'achieved', achievedOn: '2026-06-01' },
      { id: 'ach-5', title: 'Run 10 km without stopping', state: 'open', achievedOn: null },
    ],
    mockGoalCount: 3,
    mockActionCount: 24,
    mockVisionTileCount: 6,
  },
  {
    id: 'path-earnings',
    createdAt: nowIso,
    updatedAt: nowIso,
    name: 'Earnings',
    order: 1,
    archived: false,
    archivedAt: null,
    visionSnippet:
      'Work I choose, on my terms. A calm runway of savings and income that is not tied to one client.',
    achievements: [
      { id: 'ach-6', title: 'Three months of runway saved', state: 'achieved', achievedOn: '2026-05-20' },
      { id: 'ach-7', title: 'A second income stream that covers rent', state: 'open', achievedOn: null },
      { id: 'ach-8', title: 'Shipped one paid product', state: 'open', achievedOn: null },
    ],
    mockGoalCount: 2,
    mockActionCount: 15,
    mockVisionTileCount: 4,
  },
  {
    id: 'path-craft',
    createdAt: nowIso,
    updatedAt: nowIso,
    name: 'Craft',
    order: 2,
    archived: false,
    archivedAt: null,
    visionSnippet: 'Keep getting sharper at the work I care about. Learn in public, ship small things often.',
    achievements: [
      { id: 'ach-9', title: 'Wrote 10 essays', state: 'open', achievedOn: null },
      { id: 'ach-10', title: 'Gave a conference talk', state: 'open', achievedOn: null },
    ],
    mockGoalCount: 1,
    mockActionCount: 6,
    mockVisionTileCount: 2,
  },
  {
    id: 'path-home',
    createdAt: nowIso,
    updatedAt: nowIso,
    name: 'Home & calm',
    order: 3,
    archived: true,
    archivedAt: '2026-07-15T09:00:00.000Z',
    visionSnippet: 'A home that resets easily. Less stuff, clearer surfaces, a place that breathes.',
    achievements: [
      { id: 'ach-11', title: 'Every room has a place for everything', state: 'open', achievedOn: null },
    ],
    mockGoalCount: 0,
    mockActionCount: 3,
    mockVisionTileCount: 1,
  },
]
