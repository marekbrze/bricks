import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { usePaths } from '../hooks/use-paths'
import { AchievementsSection } from './AchievementsSection'
import { ContributionGraph } from './ContributionGraph'
import { ModuleStubSection } from './ModuleStubSection'
import { PathOverflowMenu } from './PathOverflowMenu'
import { RenamePathDialog } from './RenamePathDialog'
import { DeletePathDialog } from './DeletePathDialog'
import { PathNotFound } from './PathNotFound'

export function PathOverviewPage() {
  const { pathId = '' } = useParams()
  const navigate = useNavigate()
  const {
    getPath,
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

  const path = getPath(pathId)
  if (!path) return <PathNotFound />

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link to="/paths" className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'self-start' })}>
          <ArrowLeft aria-hidden="true" /> Paths
        </Link>
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold">{path.name}</h1>
            {path.archived && (
              <span className="text-xs font-medium text-muted-foreground">Archived</span>
            )}
          </div>
          <PathOverflowMenu
            pathName={path.name}
            onRename={() => setRenaming(true)}
            onArchive={
              path.archived
                ? undefined
                : () => {
                    archivePath(path.id)
                    navigate('/paths')
                  }
            }
            onUnarchive={path.archived ? () => unarchivePath(path.id) : undefined}
            onDelete={() => setDeleting(true)}
          />
        </div>
      </div>

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
          deletePath(path.id)
          navigate('/paths')
        }}
      />
    </div>
  )
}
