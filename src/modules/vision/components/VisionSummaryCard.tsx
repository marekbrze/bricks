import { Link } from 'react-router-dom'
import { ArrowRight, Trophy } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useVision } from '../hooks/use-vision'

/** Embedded in the Path overview — a peek at the board, not an editable surface. */
export function VisionSummaryCard({ pathId }: { pathId: string }) {
  const {
    visionSnippetForPath,
    imageTilesForPath,
    visionTileCountForPath,
    achievementCountsForPath,
  } = useVision()
  const snippet = visionSnippetForPath(pathId)
  const thumbnails = imageTilesForPath(pathId, 4)
  const tileCount = visionTileCountForPath(pathId)
  const { achieved: achievedCount, total: achievementTotal } = achievementCountsForPath(pathId)

  return (
    <section aria-labelledby="vision-heading" className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 id="vision-heading" className="text-sm font-semibold">
          Vision
        </h2>
        <Link to={`/paths/${pathId}/vision`} className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
          Open Vision board <ArrowRight aria-hidden="true" />
        </Link>
      </div>
      {tileCount === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
          No Vision yet — sketch out where this Path is going: a few notes, a few photos, the things
          you want to be able to do one day.
        </p>
      ) : (
        <div className="rounded-lg border border-border p-3">
          {snippet && <p className="line-clamp-2 text-sm text-muted-foreground">{snippet}</p>}
          {achievementTotal > 0 && (
            <p
              className={cn(
                'inline-flex items-center gap-1 text-xs tabular-nums text-muted-foreground',
                (snippet || thumbnails.length > 0) && 'mt-2',
              )}
            >
              <Trophy className="size-3.5" aria-hidden="true" />
              {achievedCount}/{achievementTotal} achievements
            </p>
          )}
          {thumbnails.length > 0 && (
            <div className={cn('flex gap-2', (snippet || achievementTotal > 0) && 'mt-2')}>
              {thumbnails.map((tile) => (
                <img
                  key={tile.id}
                  src={tile.src}
                  alt={tile.alt}
                  loading="lazy"
                  className="size-14 shrink-0 rounded-md object-cover"
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
