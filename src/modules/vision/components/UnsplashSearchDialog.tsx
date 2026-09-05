import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ExternalLink, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  triggerUnsplashDownload,
  unsplashClient,
  type UnsplashClient,
  type UnsplashErrorKind,
  type UnsplashPhoto,
} from '../lib/unsplash-api'
import {
  clearUnsplashKey,
  getUnsplashKey,
  hasBuildUnsplashKey,
  saveUnsplashKey,
  validateUnsplashKey,
} from '../lib/unsplash-config'
import { searchSampleUnsplash } from '../data/unsplash-samples'

/** Keystrokes settle before a request goes out — one search per pause, not per letter. */
const DEBOUNCE_MS = 350

const UNSPLASH_APPS_URL = 'https://unsplash.com/oauth/applications'

function useDebounced(value: string, delay: number): string {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

function errorMessage(kind: UnsplashErrorKind): string {
  switch (kind) {
    case 'auth':
      return 'Unsplash rejected that Access Key. Check it, or paste a new one.'
    case 'rate-limit':
      return 'Unsplash’s hourly limit is used up (50 searches an hour on a demo key). Try again later, or browse the sample photos.'
    case 'network':
      return 'Couldn’t reach Unsplash — check your connection and try again.'
    case 'server':
      return 'Unsplash had a problem answering. Try again in a moment.'
    case 'no-key':
      return 'Unsplash isn’t connected yet.'
    case 'aborted':
      return ''
  }
}

/**
 * Search + pick a photo from Unsplash (ADR 0019): live API search, debounced,
 * paged, with the bundled sample pool as the fallback when no Access Key is
 * configured. Closing without picking a result adds nothing.
 */
export function UnsplashSearchDialog({
  open,
  onOpenChange,
  onPick,
  initialQuery = '',
  client = unsplashClient,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPick: (photo: UnsplashPhoto) => void
  /** Starting query — lets stories (and later, re-opens) render a filled state. */
  initialQuery?: string
  /** Injectable so stories exercise the states without hitting the network. */
  client?: UnsplashClient
}) {
  const [query, setQuery] = useState(initialQuery)
  const debouncedQuery = useDebounced(query, DEBOUNCE_MS)

  const [apiKey, setApiKey] = useState<string | null>(() => getUnsplashKey())
  const [editingKey, setEditingKey] = useState(false)
  const [keyDraft, setKeyDraft] = useState('')
  const [keyError, setKeyError] = useState<string | null>(null)
  /** Set when the Owner chooses the bundled pool over connecting Unsplash. */
  const [samplesOnly, setSamplesOnly] = useState(false)

  const [photos, setPhotos] = useState<UnsplashPhoto[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<UnsplashErrorKind | null>(null)
  /** Bumped by Retry — re-runs the search effect with the same query. */
  const [retryNonce, setRetryNonce] = useState(0)

  // Closing happens through React state, so a fast double-activate would fire
  // onPick twice and add the photo twice — lock after the first pick.
  const pickLock = useRef(false)

  const live = apiKey !== null && !samplesOnly
  const showKeyPanel = editingKey || (!live && !samplesOnly)

  const sampleResults = useMemo(() => searchSampleUnsplash(query), [query])
  const results = live ? photos : sampleResults

  // Live search: one request per settled query, superseded requests aborted.
  useEffect(() => {
    if (!open || !live || editingKey) return
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    void client.search({ query: debouncedQuery, page: 1, signal: controller.signal }).then((res) => {
      if (controller.signal.aborted) return
      if (!res.ok) {
        if (res.error === 'aborted') return
        setError(res.error)
        setPhotos([])
        setHasMore(false)
        setLoading(false)
        return
      }
      setPhotos(res.photos)
      setHasMore(res.hasMore)
      setPage(1)
      setLoading(false)
    })
    return () => controller.abort()
  }, [open, live, editingKey, debouncedQuery, client, retryNonce])

  const loadMore = useCallback(() => {
    if (loadingMore) return
    setLoadingMore(true)
    void client.search({ query: debouncedQuery, page: page + 1 }).then((res) => {
      setLoadingMore(false)
      if (!res.ok) {
        if (res.error !== 'aborted') setError(res.error)
        return
      }
      // Guard against a page that repeats results (Unsplash can shift pages
      // between requests) — a duplicate key would break the list.
      setPhotos((prev) => {
        const seen = new Set(prev.map((p) => p.id))
        return [...prev, ...res.photos.filter((p) => !seen.has(p.id))]
      })
      setHasMore(res.hasMore)
      setPage((p) => p + 1)
    })
  }, [client, debouncedQuery, loadingMore, page])

  const resetToClosed = () => {
    setQuery('')
    setPhotos([])
    setPage(1)
    setHasMore(false)
    setError(null)
    setEditingKey(false)
    setKeyDraft('')
    setKeyError(null)
  }

  const handleSaveKey = () => {
    const invalid = validateUnsplashKey(keyDraft)
    setKeyError(invalid)
    if (invalid) return
    saveUnsplashKey(keyDraft)
    const stored = getUnsplashKey()
    if (!stored) {
      // Storage is blocked — the key can't be kept, so say so instead of
      // silently falling back to an unconnected dialog.
      setKeyError('This browser wouldn’t store the key. Sample photos still work.')
      return
    }
    setApiKey(stored)
    setSamplesOnly(false)
    setEditingKey(false)
    setKeyDraft('')
  }

  const handleForgetKey = () => {
    clearUnsplashKey()
    const remaining = getUnsplashKey()
    setApiKey(remaining)
    setPhotos([])
    setKeyDraft('')
    setKeyError(null)
    setEditingKey(false)
    if (!remaining) setSamplesOnly(false)
  }

  const handlePick = (photo: UnsplashPhoto) => {
    if (pickLock.current) return
    pickLock.current = true
    // API guideline: a pick counts as a download and must be reported.
    triggerUnsplashDownload(photo)
    onPick(photo)
    setQuery('')
  }

  const status = (() => {
    if (showKeyPanel) return ''
    if (loading) return 'Searching Unsplash…'
    if (error) return errorMessage(error)
    if (results.length === 0) return `No photos match “${query}”.`
    return `${results.length} photo${results.length === 1 ? '' : 's'}${hasMore ? ', more available' : ''}.`
  })()

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (!o) resetToClosed()
        else {
          pickLock.current = false
          setApiKey(getUnsplashKey())
        }
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Search Unsplash</DialogTitle>
        </DialogHeader>

        {showKeyPanel ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              Full Unsplash search needs an Access Key. Create a free app on{' '}
              <a
                href={UNSPLASH_APPS_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 underline underline-offset-2"
              >
                Unsplash’s developer page
                <ExternalLink className="size-3" aria-hidden="true" />
              </a>{' '}
              and paste its Access Key below. It stays in this browser.
            </p>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="unsplash-key">Unsplash Access Key</Label>
              <Input
                id="unsplash-key"
                value={keyDraft}
                onChange={(e) => {
                  setKeyDraft(e.target.value)
                  setKeyError(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveKey()
                }}
                placeholder="e.g. 7Xk2…"
                autoComplete="off"
                spellCheck={false}
                aria-describedby={keyError ? 'unsplash-key-error' : undefined}
                aria-invalid={keyError ? true : undefined}
              />
              {keyError && (
                <p id="unsplash-key-error" role="alert" className="text-sm text-destructive">
                  {keyError}
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Button variant="ghost" size="sm" onClick={() => { setSamplesOnly(true); setEditingKey(false) }}>
                Browse sample photos instead
              </Button>
              <div className="flex items-center gap-2">
                {apiKey && !hasBuildUnsplashKey() && (
                  <Button variant="ghost" size="sm" onClick={handleForgetKey}>
                    Forget stored key
                  </Button>
                )}
                <Button size="sm" onClick={handleSaveKey}>
                  Connect
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="unsplash-query">Search photos</Label>
              <Input
                id="unsplash-query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="mountain, desk, calm…"
                // eslint-disable-next-line jsx-a11y/no-autofocus -- focus follows the user into the search field on open
                autoFocus
              />
            </div>

            {!live && (
              <p className="rounded-lg border border-border bg-muted/40 p-2 text-sm text-muted-foreground">
                Showing a small bundled set of sample photos.{' '}
                <button
                  type="button"
                  className="underline underline-offset-2"
                  onClick={() => setEditingKey(true)}
                >
                  Connect Unsplash
                </button>{' '}
                to search every photo.
              </p>
            )}

            {/* One spoken summary of what the grid is showing, for screen readers. */}
            <p role="status" aria-live="polite" className="sr-only">
              {status}
            </p>

            {error && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3">
                <p className="text-sm text-destructive">{errorMessage(error)}</p>
                <div className="flex items-center gap-2">
                  {(error === 'auth' || error === 'no-key') && (
                    <Button variant="outline" size="sm" onClick={() => setEditingKey(true)}>
                      Change key
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => setSamplesOnly(true)}>
                    Use samples
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setRetryNonce((n) => n + 1)}>
                    <RefreshCw aria-hidden="true" /> Retry
                  </Button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="grid max-h-96 grid-cols-3 gap-3" aria-hidden="true">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="aspect-square w-full animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            ) : !error && results.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No photos match “{query}”. Try a different word.
              </p>
            ) : (
              !error && (
                <>
                  <ul className="grid max-h-96 grid-cols-3 gap-3 overflow-y-auto">
                    {results.map((photo) => (
                      <li key={photo.id} className="flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => handlePick(photo)}
                          aria-label={`Add photo: ${photo.alt}, by ${photo.photographer}`}
                          className="overflow-hidden rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                        >
                          <img
                            src={photo.thumb}
                            alt=""
                            loading="lazy"
                            // The dominant colour holds the tile's shape while
                            // the photo loads, so the grid doesn't jump.
                            style={photo.color ? { backgroundColor: photo.color } : undefined}
                            className="aspect-square w-full object-cover transition-opacity hover:opacity-80"
                          />
                        </button>
                        {/* Credit link, required by Unsplash's API guidelines —
                            outside the button, since a link can't nest in one. */}
                        <a
                          href={photo.photoUrl ?? photo.profileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="truncate text-xs text-muted-foreground underline-offset-2 hover:underline"
                        >
                          {photo.photographer}
                        </a>
                      </li>
                    ))}
                  </ul>
                  {live && hasMore && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="self-center"
                      onClick={loadMore}
                      disabled={loadingMore}
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="animate-spin" aria-hidden="true" /> Loading…
                        </>
                      ) : (
                        'Load more'
                      )}
                    </Button>
                  )}
                </>
              )
            )}

            <div className="flex items-center justify-between gap-2 border-t border-border pt-2">
              <p className="text-xs text-muted-foreground">
                Photos from{' '}
                <a
                  href="https://unsplash.com/?utm_source=bricks&utm_medium=referral"
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-2"
                >
                  Unsplash
                </a>
              </p>
              {live && (
                <Button variant="ghost" size="sm" onClick={() => setEditingKey(true)}>
                  Change key
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
