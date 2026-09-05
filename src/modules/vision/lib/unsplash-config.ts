/**
 * Where the Unsplash Access Key comes from. Two sources, in order:
 *
 * 1. a key the Owner pasted into the search dialog (stored in this browser),
 * 2. `VITE_UNSPLASH_ACCESS_KEY`, baked in at build time.
 *
 * The app has no backend to proxy the call (see ADR 0019), so the key travels
 * in the browser either way. Only the *Access Key* (Unsplash's public
 * `Client-ID`) belongs here — never the Secret Key.
 */
const KEY_STORAGE_KEY = 'bricks-unsplash-key'

const BUILD_KEY = (import.meta.env.VITE_UNSPLASH_ACCESS_KEY ?? '').trim()

/** The key to send with API calls, or null when Unsplash isn't configured. */
export function getUnsplashKey(): string | null {
  let stored: string | null = null
  try {
    stored = localStorage.getItem(KEY_STORAGE_KEY)
  } catch {
    // Storage blocked (private mode, embedded frame) — fall through to the build key.
  }
  const value = stored?.trim()
  if (value && validateUnsplashKey(value) === null) return value
  return BUILD_KEY || null
}

/** True when the active key came from the build, so the dialog offers "use my own" instead of "add one". */
export function hasBuildUnsplashKey(): boolean {
  return BUILD_KEY.length > 0
}

/** Error message for an unusable key, or null when acceptable. */
export function validateUnsplashKey(raw: string): string | null {
  const value = raw.trim()
  if (!value) return 'Paste your Unsplash Access Key.'
  if (/\s/.test(value)) return 'A key has no spaces — check what you pasted.'
  // Unsplash Access Keys are ~43 URL-safe base64 characters. Loose check: it
  // catches an app name or a URL pasted by mistake, without hard-coding a length.
  if (!/^[A-Za-z0-9_-]{20,}$/.test(value)) return 'That doesn’t look like an Access Key.'
  return null
}

/** Persist a key for this browser. Rejects an invalid one — the caller validates first. */
export function saveUnsplashKey(raw: string): void {
  if (validateUnsplashKey(raw) !== null) return
  try {
    localStorage.setItem(KEY_STORAGE_KEY, raw.trim())
  } catch {
    // Nothing to do — the dialog surfaces the failure by staying unconfigured.
  }
}

/** Forget the browser-stored key. A build-time key, if any, takes over again. */
export function clearUnsplashKey(): void {
  try {
    localStorage.removeItem(KEY_STORAGE_KEY)
  } catch {
    /* ignore */
  }
}
