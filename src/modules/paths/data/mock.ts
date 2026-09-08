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
    mockGoalCount: 0,
    mockActionCount: 3,
    mockVisionTileCount: 2,
  },
]
