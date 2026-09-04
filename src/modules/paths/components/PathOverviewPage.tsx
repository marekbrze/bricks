import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArchiveRestore } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { useToast } from '@/shared/components/toast/toast-context'
import { usePaths } from '../hooks/use-paths'
import { AchievementsSection } from './AchievementsSection'
import { ContributionGraph } from './ContributionGraph'
import { ModuleStubSection } from './ModuleStubSection'
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
    addAchievement,
    editAchievement,
    setAchievementState,
    deleteAchievement,
    cascadeCounts,
  } = usePaths()

  const [renaming, setRenaming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  if (dataUnreadable) return <PathsDataUnreadable onReset={resetPaths} />

  const path = getPath(pathId)
  if (!path) return <PathNotFound />

  const readOnly = path.archived

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

      <ModuleStubSection
        id="vision-heading"
        heading="Vision"
        blurb={
          path.visionSnippet ||
          'The picture of the future for this Path — a board of short notes and photos. Not built yet.'
        }
        linkTo={`/paths/${path.id}/vision`}
        linkLabel="Open Vision board"
      />

      <ModuleStubSection
        id="goals-heading"
        heading="Goals"
        blurb={`${path.mockGoalCount} ${
          path.mockGoalCount === 1 ? 'Goal' : 'Goals'
        } under this Path — the execution layer, in priority order. Managed in the Goals module.`}
        linkTo={`/paths/${path.id}/goals`}
        linkLabel="Open Goals"
      />

      <AchievementsSection
        achievements={path.achievements}
        readOnly={readOnly}
        onAdd={(title) => addAchievement(path.id, title)}
        onEdit={(id, title) => editAchievement(path.id, id, title)}
        onToggle={(id, achieved) => setAchievementState(path.id, id, achieved)}
        onDelete={(id) => deleteAchievement(path.id, id)}
      />

      <section aria-labelledby="graph-heading" className="flex flex-col gap-2">
        <h2 id="graph-heading" className="text-sm font-semibold">
          Contribution graph
        </h2>
        <div className="rounded-lg border border-border p-3">
          <ContributionGraph winDays={path.winDays} weeks={26} label={`${path.name} wins`} />
        </div>
      </section>

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
        counts={cascadeCounts(path.id)}
        onConfirm={() => {
          const name = path.name
          deletePath(path.id)
          navigate('/paths', { state: { deletedName: name } })
        }}
      />
    </div>
  )
}
