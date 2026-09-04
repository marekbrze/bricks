import { Link } from 'react-router-dom'
import { GripVertical, Target, Trophy } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { ContributionGraph } from './ContributionGraph'
import { PathOverflowMenu } from './PathOverflowMenu'
import type { Path } from '../types/path'

export function PathCard({
  path,
  index,
  total,
  onRename,
  onArchive,
  onDelete,
  onMoveUp,
  onMoveDown,
  dragHandleProps,
}: {
  path: Path
  index: number
  total: number
  onRename: () => void
  onArchive: () => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>
}) {
  const achievedCount = path.achievements.filter((a) => a.state === 'achieved').length

  return (
    <Card className="gap-3">
      <div className="flex items-start gap-1">
        {total > 1 && (
          <button
            type="button"
            aria-label={`Reorder ${path.name}`}
            className="mt-0.5 shrink-0 cursor-grab rounded-sm p-0.5 text-muted-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:cursor-grabbing"
            {...dragHandleProps}
          >
            <GripVertical className="size-4" aria-hidden="true" />
          </button>
        )}
        <h3 className="min-w-0 flex-1 text-sm font-semibold">
          <Link
            to={`/paths/${path.id}`}
            className="rounded-sm outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {path.name}
          </Link>
        </h3>
        <PathOverflowMenu
          pathName={path.name}
          onRename={onRename}
          onArchive={onArchive}
          onDelete={onDelete}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          canMoveUp={index > 0}
          canMoveDown={index < total - 1}
        />
      </div>

      {path.visionSnippet ? (
        <p className="line-clamp-2 text-sm text-muted-foreground">{path.visionSnippet}</p>
      ) : (
        <p className="text-sm text-muted-foreground/70 italic">No Vision yet</p>
      )}

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Target className="size-3.5" aria-hidden="true" />
          {path.mockGoalCount} {path.mockGoalCount === 1 ? 'goal' : 'goals'}
        </span>
        <span className="inline-flex items-center gap-1">
          <Trophy className="size-3.5" aria-hidden="true" />
          {achievedCount}/{path.achievements.length} achievements
        </span>
      </div>

      <ContributionGraph winDays={path.winDays} weeks={16} compact label={`${path.name} wins`} />
    </Card>
  )
}
