const CLOUD_URL_KEY = 'bricks-cloud-url'

/**
 * Returns the configured Dexie Cloud database URL, or null when unset or
 * invalid. Read at DB construction time, so changing it needs a reload.
 */
export function getCloudUrl(): string | null {
  const raw = localStorage.getItem(CLOUD_URL_KEY)
  if (!raw) return null
  return validateCloudUrl(raw) === null ? raw : null
}

/** Error message for an unusable URL, or null when acceptable. */
export function validateCloudUrl(raw: string): string | null {
  const value = raw.trim()
  if (!value) return 'Enter a database URL.'
  try {
    const url = new URL(value)
    // https-only: auth tokens must never travel over plain http.
    if (url.protocol !== 'https:') return 'URL must use https.'
    return null
  } catch {
    return 'Not a valid URL.'
  }
}

/** Persist (or, when invalid, clear) the cloud URL. Takes effect on reload. */
export function saveCloudUrl(raw: string): void {
  if (validateCloudUrl(raw) === null) localStorage.setItem(CLOUD_URL_KEY, raw.trim())
  else localStorage.removeItem(CLOUD_URL_KEY)
}

export function clearCloudUrl(): void {
  localStorage.removeItem(CLOUD_URL_KEY)
}
