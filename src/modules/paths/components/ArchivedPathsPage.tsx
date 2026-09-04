import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { usePaths } from '../hooks/use-paths'
import type { Path } from '../types/path'
import { PathOverflowMenu } from './PathOverflowMenu'
import { DeletePathDialog } from './DeletePathDialog'

export function ArchivedPathsPage() {
  const { archivedPaths, unarchivePath, deletePath, cascadeCounts } = usePaths()
  const [deleting, setDeleting] = useState<Path | null>(null)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link to="/paths" className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'self-start' })}>
          <ArrowLeft aria-hidden="true" /> Paths
        </Link>
        <h1 className="text-xl font-semibold">Archived Paths</h1>
      </div>

      {archivedPaths.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          Nothing archived. Archived Paths keep all their contents and can be restored anytime.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border">
          {archivedPaths.map((path) => {
            const achieved = path.achievements.filter((a) => a.state === 'achieved').length
            return (
              <li key={path.id} className="flex items-center gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-muted-foreground">{path.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {path.mockGoalCount} {path.mockGoalCount === 1 ? 'goal' : 'goals'} ·{' '}
                    {achieved}/{path.achievements.length} achievements
                    {path.archivedAt ? ` · archived ${path.archivedAt.slice(0, 10)}` : ''}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => unarchivePath(path.id)}>
                  Unarchive
                </Button>
                <PathOverflowMenu
                  pathName={path.name}
                  onUnarchive={() => unarchivePath(path.id)}
                  onDelete={() => setDeleting(path)}
                />
              </li>
            )
          })}
        </ul>
      )}

      {deleting && (
        <DeletePathDialog
          open
          onOpenChange={(o) => !o && setDeleting(null)}
          pathName={deleting.name}
          counts={cascadeCounts(deleting.id)}
          onConfirm={() => deletePath(deleting.id)}
        />
      )}
    </div>
  )
}
