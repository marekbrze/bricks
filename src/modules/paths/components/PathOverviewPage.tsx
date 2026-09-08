import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArchiveRestore } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { useToast } from '@/shared/components/toast/toast-context'
import { useGoals } from '@/modules/goals/hooks/use-goals'
import { GoalsDataUnreadable } from '@/modules/goals/components/GoalsDataUnreadable'
import { PathGoalsSection } from '@/modules/goals/components/PathGoalsSection'
import { useActions } from '@/modules/capture-triage/hooks/use-actions'
import { ActionsDataUnreadable } from '@/modules/capture-triage/components/ActionsDataUnreadable'
import { useWinLog } from '@/modules/winlog/hooks/use-win-log'
import { winKindCounts } from '@/modules/winlog/lib/win-counts'
import { WinBalance } from '@/modules/winlog/components/WinBalance'
import { useVision } from '@/modules/vision/hooks/use-vision'
import { VisionSummaryCard } from '@/modules/vision/components/VisionSummaryCard'
import { VisionDataUnreadable } from '@/modules/vision/components/VisionDataUnreadable'
import { usePaths } from '../hooks/use-paths'
import { PathTabs } from './PathTabs'
import { PathOverflowMenu } from './PathOverflowMenu'
import { RenamePathDialog } from './RenamePathDialog'
import { DeletePathDialog } from './DeletePathDialog'
import { PathNotFound } from './PathNotFound'
import { PathsDataUnreadable } from './PathsDataUnreadable'

export function PathOverviewPage() {
  const { pathId = '' } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const {
    getPath,
    dataUnreadable,
    resetPaths,
    renamePath,
    archivePath,
    unarchivePath,
    deletePath,
    cascadeCounts,
  } = usePaths()
  const {
    goalCountForPath,
    dataUnreadable: goalsUnreadable,
    resetGoals,
  } = useGoals()
  const {
    actionCountForPath,
    dataUnreadable: actionsUnreadable,
    resetActions,
  } = useActions()
  const { winsForPath } = useWinLog()
  const {
    visionTileCountForPath,
    achievementCountsForPath,
    dataUnreadable: visionUnreadable,
    resetVisions,
  } = useVision()

  const [renaming, setRenaming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  if (dataUnreadable) return <PathsDataUnreadable onReset={resetPaths} />
  // Every collection the overview reads must surface its own recovery screen
  // rather than silently rendering a wrong zero.
  if (visionUnreadable) return <VisionDataUnreadable onReset={resetVisions} />
  if (goalsUnreadable) return <GoalsDataUnreadable onReset={resetGoals} />
  if (actionsUnreadable) return <ActionsDataUnreadable onReset={resetActions} />

  const path = getPath(pathId)
  if (!path) return <PathNotFound />

  const readOnly = path.archived

  const goalCount = goalCountForPath(path.id)
  const actionCount = actionCountForPath(path.id)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link to="/paths" className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'self-start' })}>
          <ArrowLeft aria-hidden="true" /> Paths
        </Link>
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-semibold">{path.name}</h1>
          <PathOverflowMenu
            pathName={path.name}
            onRename={readOnly ? undefined : () => setRenaming(true)}
            onArchive={
              readOnly
                ? undefined
                : () => {
                    const undo = archivePath(path.id)
                    showToast(`“${path.name}” archived`, { label: 'Undo', onClick: undo })
                    navigate('/paths')
                  }
            }
            onUnarchive={readOnly ? () => unarchivePath(path.id) : undefined}
            onDelete={() => setDeleting(true)}
          />
        </div>
      </div>

      <PathTabs pathId={path.id} />

      {readOnly && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 p-3">
          <p className="text-sm text-muted-foreground">
            This Path is archived. Its contents are kept but read-only until you restore it.
          </p>
          <Button variant="outline" size="sm" onClick={() => unarchivePath(path.id)}>
            <ArchiveRestore aria-hidden="true" /> Unarchive
          </Button>
        </div>
      )}

      {/* Vision → Wins → Goals, one screen (ADR 0043). */}
      <VisionSummaryCard pathId={path.id} />

      <section aria-labelledby="wins-heading" className="flex flex-col gap-3">
        <h2 id="wins-heading" className="text-sm font-semibold">
          Wins
        </h2>
        <WinBalance counts={winKindCounts(winsForPath(path.id))} size="sm" />
      </section>

      <PathGoalsSection pathId={path.id} readOnly={readOnly} />

      <RenamePathDialog
        open={renaming}
        onOpenChange={setRenaming}
        currentName={path.name}
        onRename={(name) => renamePath(path.id, name)}
      />
      <DeletePathDialog
        open={deleting}
        onOpenChange={setDeleting}
        pathName={path.name}
        counts={{
          ...cascadeCounts(path.id),
          goals: goalCount,
          actions: actionCount,
          visionTiles: visionTileCountForPath(path.id),
          achievements: achievementCountsForPath(path.id).total,
        }}
        onConfirm={() => {
          const name = path.name
          deletePath(path.id)
          navigate('/paths', { state: { deletedName: name } })
        }}
      />
    </div>
  )
}
