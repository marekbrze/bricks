import type { AppData } from './types';
import type { Path } from '@/modules/paths/types/path';

/** One young Path, a couple of open Achievements, no wins yet. */
export function minimalScenario(): AppData {
  const now = new Date().toISOString();
  const paths: Path[] = [
    {
      id: 'path-sport',
      createdAt: now,
      updatedAt: now,
      name: 'Sport',
      order: 0,
      archived: false,
      archivedAt: null,
      visionSnippet: '',
      achievements: [
        { id: 'ach-1', title: 'I can do a strict pull-up', state: 'open', achievedOn: null },
        { id: 'ach-2', title: 'Run 5 km without stopping', state: 'open', achievedOn: null },
      ],
      mockGoalCount: 0,
      mockActionCount: 0,
      mockVisionTileCount: 0,
      winDays: {},
    },
  ];
  return { paths };
}
