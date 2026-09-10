import type { AppData } from './types';
import type { Path } from '@/modules/paths/types/path';
import type { Action } from '@/modules/capture-triage/types/action';
import type { Goal } from '@/modules/goals/types/goal';
import type { Vision } from '@/modules/vision/types/vision';
import type { Essential } from '@/modules/essentials/types/essential';

/** One young Path, a couple of open achievement tiles on its Vision, no wins yet, two ideas waiting in the Inbox. */
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
      mockGoalCount: 0,
      mockActionCount: 0,
      mockVisionTileCount: 2,
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
  const visions: Vision[] = [
    {
      id: 'vision-minimal-sport',
      createdAt: now,
      updatedAt: now,
      pathId: 'path-sport',
      tiles: [
        { id: 'ach-1', type: 'achievement', title: 'I can do a strict pull-up', state: 'open', achievedOn: null },
        { id: 'ach-2', type: 'achievement', title: 'Run 5 km without stopping', state: 'open', achievedOn: null },
      ],
    },
  ];
  const essentials: Essential[] = [
    {
      id: 'essential-hang',
      createdAt: now,
      updatedAt: now,
      pathId: 'path-sport',
      name: 'Hang from a bar — 60s total across the day',
      detail: 'Grip + shoulders. Split it however you like.',
      order: 0,
    },
    {
      id: 'essential-barefoot',
      createdAt: now,
      updatedAt: now,
      pathId: 'path-sport',
      name: 'Walk barefoot outside',
      detail: '',
      order: 1,
    },
  ];
  return { paths, actions, goals, visions, essentials };
}
