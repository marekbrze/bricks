import type { AppData } from './types';
import { MOCK_PATHS } from '@/modules/paths/data/mock';
import { MOCK_ACTIONS } from '@/modules/capture-triage/data/mock';
import { MOCK_GOALS } from '@/modules/goals/data/mock';

/**
 * Several active Paths with achievements + win history, plus one archived
 * Path. A handful of Inbox Actions waiting for triage, plus a few already
 * assigned (standalone and under real Goals) — a Goal tree with sub-Goals,
 * a deadline overdue, one achieved, one abandoned, and one frog.
 */
export function fullScenario(): AppData {
  return {
    paths: MOCK_PATHS,
    actions: MOCK_ACTIONS,
    goals: MOCK_GOALS,
  };
}
