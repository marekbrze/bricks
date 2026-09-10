import type { Essential } from '../types/essential'

const nowIso = new Date().toISOString()

function essential(
  partial: Partial<Essential> & Pick<Essential, 'id' | 'name' | 'pathId' | 'order'>,
): Essential {
  return {
    createdAt: nowIso,
    updatedAt: nowIso,
    detail: '',
    ...partial,
  }
}

/**
 * The `full` scenario's Essentials. `path-sport` gets a primal-movement set
 * (à la Rafał Mazur), `path-earnings` the Schwarzenegger sales example. Some
 * of the `full` scenario's completed Actions carry these `essentialId`s (see
 * `capture-triage/data/mock.ts`) so the per-Essential counters show history.
 */
export const MOCK_ESSENTIALS: Essential[] = [
  essential({
    id: 'essential-hang',
    pathId: 'path-sport',
    order: 0,
    name: 'Hang from a bar — 60s total across the day',
    detail: 'Grip + shoulders. Split it however you like.',
  }),
  essential({
    id: 'essential-barefoot',
    pathId: 'path-sport',
    order: 1,
    name: 'Walk barefoot outside',
    detail: 'Even five minutes on grass or gravel counts.',
  }),
  essential({
    id: 'essential-getup',
    pathId: 'path-sport',
    order: 2,
    name: 'Get down to the floor and back up, 20×, no hands',
  }),
  essential({
    id: 'essential-squat-hold',
    pathId: 'path-sport',
    order: 3,
    name: 'Deep resting squat — 3 minutes total',
  }),
  essential({
    id: 'essential-calls',
    pathId: 'path-earnings',
    order: 0,
    name: 'Call five prospective clients',
    detail: 'Before lunch, while the energy is there.',
  }),
  essential({
    id: 'essential-followup',
    pathId: 'path-earnings',
    order: 1,
    name: 'Follow up on every open lead',
  }),
]
