import type { Path } from '../types/path'

const nowIso = new Date().toISOString()

/**
 * The `full` scenario's Paths. Achievements are Vision achievement tiles now
 * (ADR 0037) — they live in `MOCK_VISIONS` (src/modules/vision/data/mock.ts),
 * whose tile counts match `mockVisionTileCount` here.
 */
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
    mockGoalCount: 3,
    mockActionCount: 24,
    mockVisionTileCount: 11,
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
    mockGoalCount: 2,
    mockActionCount: 15,
    mockVisionTileCount: 7,
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
    mockGoalCount: 1,
    mockActionCount: 6,
    mockVisionTileCount: 4,
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
    mockGoalCount: 0,
    mockActionCount: 3,
    mockVisionTileCount: 2,
  },
]
