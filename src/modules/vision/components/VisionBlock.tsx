import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { VisionTile } from '../types/vision'

/**
 * One block of the Vision article — the view-mode rendering of a tile
 * (ADR 0040). Notes read as prose, images as figures, achievements as to-do
 * rows whose checkbox stays live: "it came true" is a reading moment, not an
 * editing one. No editing chrome lives here — that's edit mode's job.
 */
export function VisionBlock({
  tile,
  readOnly,
  onToggleAchieved,
}: {
  tile: VisionTile
  readOnly: boolean
  onToggleAchieved: (achieved: boolean) => void
}) {
  if (tile.type === 'note') {
    return (
      /* whitespace-pre-wrap keeps the Author's line breaks — a fragment is
         whatever shape they gave it. */
      <p className="text-base leading-normal break-words whitespace-pre-wrap">
        {tile.text}
      </p>
    )
  }

  if (tile.type === 'image') {
    return (
      <figure className="flex flex-col gap-1">
        <img
          src={tile.src}
          alt={tile.alt}
          className="w-full rounded-lg bg-muted"
          loading="lazy"
        />
        {tile.attribution && (
          <figcaption className="text-xs text-muted-foreground">
            Photo by{' '}
            <a
              href={tile.attribution.profileUrl}
              target="_blank"
              rel="noreferrer"
              className="underline hover:no-underline"
            >
              {tile.attribution.photographer}
            </a>{' '}
            on{' '}
            {/* Unsplash's API guidelines ask for a link back; the photo's
                own page when the tile has one, Unsplash itself otherwise. */}
            <a
              href={
                tile.attribution.photoUrl ??
                'https://unsplash.com/?utm_source=bricks&utm_medium=referral'
              }
              target="_blank"
              rel="noreferrer"
              className="underline hover:no-underline"
            >
              Unsplash
            </a>
          </figcaption>
        )}
      </figure>
    )
  }

  const achieved = tile.state === 'achieved'
  return (
    <div
      className={cn(
        // Same inset for open and achieved rows, so the checklist column
        // doesn't shift when a row gains its done wash.
        'flex items-start gap-2.5 rounded-lg px-3 py-2.5',
        achieved && 'bg-win-soft',
      )}
    >
      <Checkbox
        checked={achieved}
        disabled={readOnly}
        onCheckedChange={(value) => onToggleAchieved(value)}
        aria-label={
          achieved
            ? `Mark “${tile.title}” not achieved`
            : `Mark “${tile.title}” achieved`
        }
        className="mt-1"
      />
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'text-base leading-normal break-words',
            achieved && 'text-muted-foreground line-through',
          )}
        >
          {tile.title}
        </p>
        {achieved && tile.achievedOn && (
          <p className="text-xs tabular-nums text-win-strong">
            Achieved {tile.achievedOn}
          </p>
        )}
      </div>
    </div>
  )
}
