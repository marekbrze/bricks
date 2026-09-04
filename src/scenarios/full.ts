import type { AppData } from './types';
import { MOCK_PATHS } from '@/modules/paths/data/mock';

/** Several active Paths with achievements + win history, plus one archived Path. */
export function fullScenario(): AppData {
  return {
    paths: MOCK_PATHS,
  };
}
