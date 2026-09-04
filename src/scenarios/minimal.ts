import type { AppData } from './types';
import type { Path } from '@/modules/paths/types/path';
import type { Action } from '@/modules/capture-triage/types/action';
import type { Goal } from '@/modules/goals/types/goal';

/** One young Path, a couple of open Achievements, no wins yet, two ideas waiting in the Inbox. */
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
    },
  ];
  const actions: Action[] = [
    {
      id: 'action-band',
      createdAt: now,
      updatedAt: now,
      name: 'Buy a resistance band',
      state: 'inbox',
      pathId: null,
      goalId: null,
      frog: false,
      scheduledDate: null,
      completedAt: null,
    },
    {
      id: 'action-mobility',
      createdAt: now,
      updatedAt: now,
      name: 'Try a mobility routine before runs',
      state: 'inbox',
      pathId: null,
      goalId: null,
      frog: false,
      scheduledDate: null,
      completedAt: null,
    },
  ];
  const goals: Goal[] = [
    {
      id: 'goal-first-block',
      createdAt: now,
      updatedAt: now,
      name: 'First training block',
      description: '',
      pathId: 'path-sport',
      parentGoalId: null,
      order: 0,
      deadline: null,
      state: 'active',
      achievedOn: null,
      frog: false,
    },
  ];
  return { paths, actions, goals };
}
