import type { Vision } from '../types/vision'

const nowIso = new Date().toISOString()

/**
 * Boards for the `full` scenario's Paths (`src/modules/paths/data/mock.ts`) —
 * tile counts here match each Path's `mockVisionTileCount` so the overview
 * summary and the real board agree. Images reuse the bundled sample pool
 * (`data/unsplash-samples.ts`) so their attribution renders for real.
 * Achievement tiles (ADR 0037) keep the ids the old Path-embedded checklist
 * used, so a migrated board and this mock agree tile-for-tile.
 */
export const MOCK_VISIONS: Vision[] = [
  {
    id: 'vision-sport',
    createdAt: nowIso,
    updatedAt: nowIso,
    pathId: 'path-sport',
    tiles: [
      {
        id: 'vision-sport-note-1',
        type: 'note',
        text: 'Move without pain, feel strong and light. Be the person who takes the stairs two at a time.',
      },
      {
        id: 'vision-sport-image-1',
        type: 'image',
        src: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=480&q=80',
        alt: 'A hiker silhouetted on a mountain ridge at sunrise',
        source: 'unsplash',
        attribution: { photographer: 'Marek Piwnicki', profileUrl: 'https://unsplash.com/@marekpiwnicki' },
      },
      {
        id: 'vision-sport-note-2',
        type: 'note',
        text: 'Train early, before the day gets a say in it.',
      },
      {
        id: 'vision-sport-image-2',
        type: 'image',
        src: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=480&q=80',
        alt: 'A pull-up bar against a plain wall',
        source: 'unsplash',
        attribution: { photographer: 'Danielle Cerullo', profileUrl: 'https://unsplash.com/@daniellecerullo' },
      },
      {
        id: 'vision-sport-note-3',
        type: 'note',
        text: 'Not chasing a number on a scale — chasing what the body can do.',
      },
      {
        id: 'vision-sport-image-3',
        type: 'image',
        src: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=480&q=80',
        alt: 'An empty road stretching toward a sunrise',
        source: 'unsplash',
        attribution: { photographer: 'Jenny Hill', profileUrl: 'https://unsplash.com/@jennyhill' },
      },
      // Achievement tiles (ADR 0037) — ids carried over from the old
      // Path-embedded checklist so a migrated board keeps its history.
      { id: 'ach-1', type: 'achievement', title: 'I can do a strict pull-up', state: 'achieved', achievedOn: '2026-03-12' },
      { id: 'ach-2', type: 'achievement', title: 'I can do a muscle-up', state: 'open', achievedOn: null },
      { id: 'ach-3', type: 'achievement', title: '100 push-ups in one session', state: 'open', achievedOn: null },
      { id: 'ach-4', type: 'achievement', title: 'I can touch the floor with straight legs', state: 'achieved', achievedOn: '2026-06-01' },
      { id: 'ach-5', type: 'achievement', title: 'Run 10 km without stopping', state: 'open', achievedOn: null },
    ],
  },
  {
    id: 'vision-earnings',
    createdAt: nowIso,
    updatedAt: nowIso,
    pathId: 'path-earnings',
    tiles: [
      {
        id: 'vision-earnings-note-1',
        type: 'note',
        text: 'Work I choose, on my terms. A calm runway of savings and income that is not tied to one client.',
      },
      {
        id: 'vision-earnings-image-1',
        type: 'image',
        src: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=480&q=80',
        alt: 'A city skyline lit up at dusk',
        source: 'unsplash',
        attribution: { photographer: 'Denys Nevozhai', profileUrl: 'https://unsplash.com/@dnevozhai' },
      },
      {
        id: 'vision-earnings-image-2',
        type: 'image',
        src: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=480&q=80',
        alt: 'A clean desk set up for focused work',
        source: 'unsplash',
        attribution: { photographer: 'Domenico Loia', profileUrl: 'https://unsplash.com/@domenicoloia' },
      },
      {
        id: 'vision-earnings-note-2',
        type: 'note',
        text: 'One good client is not a business. Building toward three.',
      },
      { id: 'ach-6', type: 'achievement', title: 'Three months of runway saved', state: 'achieved', achievedOn: '2026-05-20' },
      { id: 'ach-7', type: 'achievement', title: 'A second income stream that covers rent', state: 'open', achievedOn: null },
      { id: 'ach-8', type: 'achievement', title: 'Shipped one paid product', state: 'open', achievedOn: null },
    ],
  },
  {
    id: 'vision-craft',
    createdAt: nowIso,
    updatedAt: nowIso,
    pathId: 'path-craft',
    tiles: [
      {
        id: 'vision-craft-note-1',
        type: 'note',
        text: 'Keep getting sharper at the work I care about. Learn in public, ship small things often.',
      },
      {
        id: 'vision-craft-image-1',
        type: 'image',
        src: 'https://images.unsplash.com/photo-1517971071642-34a2d3ecc9cd?w=480&q=80',
        alt: 'An open notebook with a pen, mid-plan',
        source: 'unsplash',
        attribution: { photographer: 'Estée Janssens', profileUrl: 'https://unsplash.com/@esteejanssens' },
      },
      { id: 'ach-9', type: 'achievement', title: 'Wrote 10 essays', state: 'open', achievedOn: null },
      { id: 'ach-10', type: 'achievement', title: 'Gave a conference talk', state: 'open', achievedOn: null },
    ],
  },
  {
    id: 'vision-home',
    createdAt: nowIso,
    updatedAt: nowIso,
    pathId: 'path-home',
    tiles: [
      {
        id: 'vision-home-note-1',
        type: 'note',
        text: 'A home that resets easily. Less stuff, clearer surfaces, a place that breathes.',
      },
      { id: 'ach-11', type: 'achievement', title: 'Every room has a place for everything', state: 'open', achievedOn: null },
    ],
  },
]
