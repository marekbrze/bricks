import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { searchMockUnsplash, type MockUnsplashPhoto } from '../data/unsplash-mock'

/**
 * Search + pick a photo. Queries the mocked Unsplash pool — no live API call,
 * see ADR 0016. Closing without picking a result adds nothing.
 */
export function UnsplashSearchDialog({
  open,
  onOpenChange,
  onPick,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPick: (photo: MockUnsplashPhoto) => void
}) {
  const [query, setQuery] = useState('')
  const results = searchMockUnsplash(query)

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (!o) setQuery('')
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Search Unsplash</DialogTitle>
        </DialogHeader>
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
        {results.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No photos match “{query}”. Try a different word.
          </p>
        ) : (
          <div className="grid max-h-80 grid-cols-3 gap-2 overflow-y-auto">
            {results.map((photo) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => {
                  onPick(photo)
                  setQuery('')
                }}
                className="overflow-hidden rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  loading="lazy"
                  className="aspect-square w-full object-cover transition-opacity hover:opacity-80"
                />
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
