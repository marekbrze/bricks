/**
 * Mocked Unsplash search — ADR 0016. The prototype has no backend and no
 * Unsplash API key, so "Search Unsplash" queries this bundled pool of real,
 * publicly reachable Unsplash photo URLs instead of calling the live API.
 * Good enough to test the search → pick → add interaction; a real key/settings
 * screen is deferred (see docs/PROJECT.md Open Questions).
 */
export interface MockUnsplashPhoto {
  id: string
  src: string
  alt: string
  tags: string[]
  photographer: string
  profileUrl: string
}

export const MOCK_UNSPLASH_PHOTOS: MockUnsplashPhoto[] = [
  {
    id: 'unsplash-mountain-ridge',
    src: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=480&q=80',
    alt: 'A hiker silhouetted on a mountain ridge at sunrise',
    tags: ['mountain', 'hike', 'sunrise', 'sport', 'outdoors'],
    photographer: 'Marek Piwnicki',
    profileUrl: 'https://unsplash.com/@marekpiwnicki',
  },
  {
    id: 'unsplash-ocean-swim',
    src: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=480&q=80',
    alt: 'Open water, calm and endless',
    tags: ['ocean', 'water', 'calm', 'swim'],
    photographer: 'Sean Oulashin',
    profileUrl: 'https://unsplash.com/@oulashin',
  },
  {
    id: 'unsplash-city-lights',
    src: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=480&q=80',
    alt: 'A city skyline lit up at dusk',
    tags: ['city', 'skyline', 'work', 'earnings', 'night'],
    photographer: 'Denys Nevozhai',
    profileUrl: 'https://unsplash.com/@dnevozhai',
  },
  {
    id: 'unsplash-forest-path',
    src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=480&q=80',
    alt: 'A quiet path through tall forest',
    tags: ['forest', 'path', 'calm', 'nature'],
    photographer: 'Luca Bravo',
    profileUrl: 'https://unsplash.com/@lucabravo',
  },
  {
    id: 'unsplash-sunrise-run',
    src: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=480&q=80',
    alt: 'An empty road stretching toward a sunrise',
    tags: ['run', 'sunrise', 'road', 'sport', 'morning'],
    photographer: 'Jenny Hill',
    profileUrl: 'https://unsplash.com/@jennyhill',
  },
  {
    id: 'unsplash-desk-focus',
    src: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=480&q=80',
    alt: 'A clean desk set up for focused work',
    tags: ['desk', 'work', 'focus', 'craft', 'earnings'],
    photographer: 'Domenico Loia',
    profileUrl: 'https://unsplash.com/@domenicoloia',
  },
  {
    id: 'unsplash-coffee-morning',
    src: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=480&q=80',
    alt: 'A cup of coffee by a window in soft morning light',
    tags: ['coffee', 'morning', 'calm', 'home'],
    photographer: 'Nathan Dumlao',
    profileUrl: 'https://unsplash.com/@nate_dumlao',
  },
  {
    id: 'unsplash-books-shelf',
    src: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=480&q=80',
    alt: 'A shelf of well-read books',
    tags: ['books', 'craft', 'learn', 'read'],
    photographer: 'Susan Q Yin',
    profileUrl: 'https://unsplash.com/@syinq',
  },
  {
    id: 'unsplash-workout-bar',
    src: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=480&q=80',
    alt: 'A pull-up bar against a plain wall',
    tags: ['workout', 'sport', 'strength', 'gym'],
    photographer: 'Danielle Cerullo',
    profileUrl: 'https://unsplash.com/@daniellecerullo',
  },
  {
    id: 'unsplash-tidy-room',
    src: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=480&q=80',
    alt: 'A tidy, minimal living room',
    tags: ['home', 'calm', 'minimal', 'room'],
    photographer: 'Spacejoy',
    profileUrl: 'https://unsplash.com/@spacejoy',
  },
  {
    id: 'unsplash-plant-light',
    src: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=480&q=80',
    alt: 'A plant catching afternoon light',
    tags: ['plant', 'calm', 'home', 'light'],
    photographer: 'Angele Kamp',
    profileUrl: 'https://unsplash.com/@angelekamp',
  },
  {
    id: 'unsplash-notebook-plan',
    src: 'https://images.unsplash.com/photo-1517971071642-34a2d3ecc9cd?w=480&q=80',
    alt: 'An open notebook with a pen, mid-plan',
    tags: ['plan', 'craft', 'notebook', 'write'],
    photographer: 'Estée Janssens',
    profileUrl: 'https://unsplash.com/@esteejanssens',
  },
]

/**
 * Case-insensitive substring match against each photo's tags + alt text.
 * An empty query returns the full curated pool (browsing before searching).
 */
export function searchMockUnsplash(query: string): MockUnsplashPhoto[] {
  const q = query.trim().toLowerCase()
  if (!q) return MOCK_UNSPLASH_PHOTOS
  return MOCK_UNSPLASH_PHOTOS.filter(
    (photo) => photo.tags.some((tag) => tag.includes(q)) || photo.alt.toLowerCase().includes(q),
  )
}
