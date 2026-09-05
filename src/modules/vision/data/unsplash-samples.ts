/**
 * A small bundled pool of real, publicly reachable Unsplash photos.
 *
 * Since ADR 0019 the dialog searches the live Unsplash API; this pool is the
 * fallback for the two cases where that isn't possible — no Access Key
 * configured, and Storybook/offline review — so the add-a-photo flow can still
 * be walked end to end. Live results always win when a key is present.
 */
import { withUtm, type UnsplashPhoto } from '../lib/unsplash-api'

/** Extra keywords the sample search matches on, beyond each photo's alt text. */
export interface SampleUnsplashPhoto extends UnsplashPhoto {
  tags: string[]
}

function sample(
  id: string,
  photoId: string,
  alt: string,
  tags: string[],
  photographer: string,
  username: string,
  color: string,
): SampleUnsplashPhoto {
  const src = `https://images.unsplash.com/photo-${photoId}?w=480&q=80`
  return {
    id,
    src,
    thumb: src,
    alt,
    color,
    tags,
    photographer,
    profileUrl: withUtm(`https://unsplash.com/@${username}`),
    // No photo page or download endpoint: these are hand-picked URLs, not API
    // results, so there is nothing to link back to or report a download against.
    photoUrl: null,
    downloadLocation: null,
  }
}

export const SAMPLE_UNSPLASH_PHOTOS: SampleUnsplashPhoto[] = [
  sample(
    'unsplash-mountain-ridge',
    '1454496522488-7a8e488e8606',
    'A hiker silhouetted on a mountain ridge at sunrise',
    ['mountain', 'hike', 'sunrise', 'sport', 'outdoors'],
    'Marek Piwnicki',
    'marekpiwnicki',
    '#26404d',
  ),
  sample(
    'unsplash-ocean-swim',
    '1502680390469-be75c86b636f',
    'Open water, calm and endless',
    ['ocean', 'water', 'calm', 'swim'],
    'Sean Oulashin',
    'oulashin',
    '#0c8cbf',
  ),
  sample(
    'unsplash-city-lights',
    '1519501025264-65ba15a82390',
    'A city skyline lit up at dusk',
    ['city', 'skyline', 'work', 'earnings', 'night'],
    'Denys Nevozhai',
    'dnevozhai',
    '#26261f',
  ),
  sample(
    'unsplash-forest-path',
    '1441974231531-c6227db76b6e',
    'A quiet path through tall forest',
    ['forest', 'path', 'calm', 'nature'],
    'Luca Bravo',
    'lucabravo',
    '#26400c',
  ),
  sample(
    'unsplash-sunrise-run',
    '1476480862126-209bfaa8edc8',
    'An empty road stretching toward a sunrise',
    ['run', 'sunrise', 'road', 'sport', 'morning'],
    'Jenny Hill',
    'jennyhill',
    '#734022',
  ),
  sample(
    'unsplash-desk-focus',
    '1499750310107-5fef28a66643',
    'A clean desk set up for focused work',
    ['desk', 'work', 'focus', 'craft', 'earnings'],
    'Domenico Loia',
    'domenicoloia',
    '#d9d9d9',
  ),
  sample(
    'unsplash-coffee-morning',
    '1447933601403-0c6688de566e',
    'A cup of coffee by a window in soft morning light',
    ['coffee', 'morning', 'calm', 'home'],
    'Nathan Dumlao',
    'nate_dumlao',
    '#8c6b4f',
  ),
  sample(
    'unsplash-books-shelf',
    '1512820790803-83ca734da794',
    'A shelf of well-read books',
    ['books', 'craft', 'learn', 'read'],
    'Susan Q Yin',
    'syinq',
    '#403026',
  ),
  sample(
    'unsplash-workout-bar',
    '1541534741688-6078c6bfb5c5',
    'A pull-up bar against a plain wall',
    ['workout', 'sport', 'strength', 'gym'],
    'Danielle Cerullo',
    'daniellecerullo',
    '#59595c',
  ),
  sample(
    'unsplash-tidy-room',
    '1493663284031-b7e3aefcae8e',
    'A tidy, minimal living room',
    ['home', 'calm', 'minimal', 'room'],
    'Spacejoy',
    'spacejoy',
    '#bfb5a6',
  ),
  sample(
    'unsplash-plant-light',
    '1416879595882-3373a0480b5b',
    'A plant catching afternoon light',
    ['plant', 'calm', 'home', 'light'],
    'Angele Kamp',
    'angelekamp',
    '#3f5926',
  ),
  sample(
    'unsplash-notebook-plan',
    '1517971071642-34a2d3ecc9cd',
    'An open notebook with a pen, mid-plan',
    ['plan', 'craft', 'notebook', 'write'],
    'Estée Janssens',
    'esteejanssens',
    '#d9d2c5',
  ),
]

/**
 * Case-insensitive substring match against each photo's tags + alt text.
 * An empty query returns the whole pool (browsing before searching).
 */
export function searchSampleUnsplash(query: string): SampleUnsplashPhoto[] {
  const q = query.trim().toLowerCase()
  if (!q) return SAMPLE_UNSPLASH_PHOTOS
  return SAMPLE_UNSPLASH_PHOTOS.filter(
    (photo) => photo.tags.some((tag) => tag.includes(q)) || photo.alt.toLowerCase().includes(q),
  )
}
