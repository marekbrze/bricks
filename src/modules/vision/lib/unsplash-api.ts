/**
 * Live Unsplash search (ADR 0019 — replaces the bundled-pool mock of ADR 0016).
 *
 * Calls api.unsplash.com straight from the browser with the Access Key as
 * `Client-ID`; Unsplash allows cross-origin requests, so no proxy is needed.
 * Three API-guideline obligations are honoured here and must stay:
 *
 * - photos are **hotlinked** from `images.unsplash.com`, never re-hosted,
 * - every credit link carries the `utm_source` / `utm_medium` parameters,
 * - picking a photo pings its `download_location` (`triggerUnsplashDownload`).
 */
import { getUnsplashKey } from './unsplash-config'

const API_BASE = 'https://api.unsplash.com'
/** Registered application name — must match the app on unsplash.com/oauth/applications. */
const UTM_SOURCE = 'bricks'
/** One screenful of thumbnails; also the "is there another page" probe. */
export const PER_PAGE = 24

export interface UnsplashPhoto {
  id: string
  /** Hotlink used for the board tile. */
  src: string
  /** Smaller hotlink for the results grid. */
  thumb: string
  alt: string
  /** Dominant colour, painted behind a thumbnail while it loads. */
  color: string | null
  photographer: string
  /** Photographer profile, utm-tagged. */
  profileUrl: string
  /** The photo's page on Unsplash, utm-tagged. Null for the bundled samples. */
  photoUrl: string | null
  /** Unsplash's download-tracking endpoint. Null for the bundled samples. */
  downloadLocation: string | null
}

export type UnsplashErrorKind =
  /** No Access Key configured — the dialog asks for one. */
  | 'no-key'
  /** The key was rejected (typo, revoked app). */
  | 'auth'
  /** Hourly quota spent (50/hour on a demo key). */
  | 'rate-limit'
  /** Request never completed — offline, DNS, blocked. */
  | 'network'
  /** Unsplash answered 5xx. */
  | 'server'
  /** Superseded by a newer keystroke; the caller ignores it. */
  | 'aborted'

export type UnsplashResult =
  | { ok: true; photos: UnsplashPhoto[]; hasMore: boolean }
  | { ok: false; error: UnsplashErrorKind }

export interface UnsplashQuery {
  /** Empty query browses Unsplash's editorial feed instead of searching. */
  query: string
  page: number
  signal?: AbortSignal
}

/** The dialog talks to this, so stories can hand it a fake instead of the network. */
export interface UnsplashClient {
  search: (args: UnsplashQuery) => Promise<UnsplashResult>
}

/** Append the referral parameters Unsplash's API guidelines require on every credit link. */
export function withUtm(url: string): string {
  try {
    const parsed = new URL(url)
    parsed.searchParams.set('utm_source', UTM_SOURCE)
    parsed.searchParams.set('utm_medium', 'referral')
    return parsed.toString()
  } catch {
    return url
  }
}

/** The shape we read off the API response — a subset of Unsplash's photo object. */
interface RawPhoto {
  id: string
  color?: string | null
  alt_description?: string | null
  description?: string | null
  urls?: { regular?: string; small?: string; thumb?: string }
  links?: { html?: string; download_location?: string }
  user?: { name?: string; username?: string; links?: { html?: string } }
}

function toPhoto(raw: RawPhoto): UnsplashPhoto | null {
  const src = raw.urls?.regular ?? raw.urls?.small
  if (!raw.id || !src) return null
  const photographer = raw.user?.name?.trim() || raw.user?.username?.trim() || 'Unsplash photographer'
  const profile =
    raw.user?.links?.html ??
    (raw.user?.username ? `https://unsplash.com/@${raw.user.username}` : 'https://unsplash.com')
  return {
    id: raw.id,
    src,
    thumb: raw.urls?.small ?? raw.urls?.thumb ?? src,
    // Unsplash's alt text is often absent; fall back to the caption, then to a
    // generic credit — an image tile must never land on the board with an empty alt.
    alt: raw.alt_description?.trim() || raw.description?.trim() || `Photo by ${photographer} on Unsplash`,
    color: raw.color ?? null,
    photographer,
    profileUrl: withUtm(profile),
    photoUrl: raw.links?.html ? withUtm(raw.links.html) : null,
    downloadLocation: raw.links?.download_location ?? null,
  }
}

function errorFor(response: Response): UnsplashErrorKind {
  // Unsplash answers a spent quota with 403 and a zeroed remaining-header —
  // the same status it uses for a key that isn't allowed to make the call.
  if (response.status === 429) return 'rate-limit'
  if (response.status === 403) {
    return response.headers.get('x-ratelimit-remaining') === '0' ? 'rate-limit' : 'auth'
  }
  if (response.status === 401) return 'auth'
  return 'server'
}

async function request(path: string, params: URLSearchParams, signal?: AbortSignal): Promise<UnsplashResult> {
  const key = getUnsplashKey()
  if (!key) return { ok: false, error: 'no-key' }

  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}?${params.toString()}`, {
      signal,
      headers: {
        Authorization: `Client-ID ${key}`,
        // Pin the API version rather than tracking whatever Unsplash defaults to.
        'Accept-Version': 'v1',
      },
    })
  } catch (e) {
    if (signal?.aborted || (e instanceof DOMException && e.name === 'AbortError')) {
      return { ok: false, error: 'aborted' }
    }
    return { ok: false, error: 'network' }
  }

  if (!response.ok) return { ok: false, error: errorFor(response) }

  let body: unknown
  try {
    body = await response.json()
  } catch {
    return { ok: false, error: 'server' }
  }

  // /search/photos wraps its results; /photos returns a bare array.
  const raw = Array.isArray(body)
    ? (body as RawPhoto[])
    : ((body as { results?: RawPhoto[] }).results ?? [])
  const photos = raw.map(toPhoto).filter((p): p is UnsplashPhoto => p !== null)
  const totalPages = Array.isArray(body) ? null : (body as { total_pages?: number }).total_pages ?? null
  const page = Number(params.get('page') ?? '1')
  // The editorial feed reports no page count — a full page implies another one.
  const hasMore = totalPages === null ? raw.length === PER_PAGE : page < totalPages

  return { ok: true, photos, hasMore }
}

/** Search Unsplash; an empty query browses the editorial feed instead. */
export async function searchUnsplash({ query, page, signal }: UnsplashQuery): Promise<UnsplashResult> {
  const q = query.trim()
  const params = new URLSearchParams({ page: String(page), per_page: String(PER_PAGE) })
  if (!q) return request('/photos', params, signal)
  params.set('query', q)
  // Landscape-ish crops sit better in the board's square-ish tiles than portraits.
  params.set('content_filter', 'high')
  return request('/search/photos', params, signal)
}

export const unsplashClient: UnsplashClient = { search: searchUnsplash }

/**
 * Tell Unsplash the photo was used. Required by the API guidelines on every
 * pick (it is what credits the photographer's download count), and deliberately
 * fire-and-forget: a failed ping must never block adding the tile.
 */
export function triggerUnsplashDownload(photo: UnsplashPhoto): void {
  const key = getUnsplashKey()
  if (!key || !photo.downloadLocation) return
  void fetch(photo.downloadLocation, {
    headers: { Authorization: `Client-ID ${key}`, 'Accept-Version': 'v1' },
  }).catch(() => {})
}
