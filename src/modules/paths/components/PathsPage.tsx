import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Signpost } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePaths } from '../hooks/use-paths'
import type { Path } from '../types/path'
import { PathCard } from './PathCard'
import { NewPathDialog } from './NewPathDialog'
import { RenamePathDialog } from './RenamePathDialog'
import { DeletePathDialog } from './DeletePathDialog'
import { StorageWarning } from './StorageWarning'

export function PathsPage() {
  const {
    activePaths,
    archivedPaths,
    storageOk,
    createPath,
    renamePath,
    archivePath,
    deletePath,
    reorderPath,
    cascadeCounts,
  } = usePaths()

  const [creating, setCreating] = useState(false)
  const [renaming, setRenaming] = useState<Path | null>(null)
  const [deleting, setDeleting] = useState<Path | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Paths</h1>
        <Button onClick={() => setCreating(true)}>
          <Plus aria-hidden="true" /> New Path
        </Button>
      </div>

      {!storageOk && <StorageWarning />}

      {activePaths.length === 0 ? (
        <section className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <Signpost className="size-8 text-muted-foreground" aria-hidden="true" />
          <div className="max-w-sm">
            <h2 className="text-sm font-semibold">No Paths yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              A Path is a never-ending direction in life — the sport path, the earnings path.
              Everything else in Bricks hangs off one.
            </p>
          </div>
          <Button onClick={() => setCreating(true)}>
            <Plus aria-hidden="true" /> Create your first Path
          </Button>
        </section>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activePaths.map((path, index) => (
            // Pointer drag-to-reorder. The keyboard-accessible path is the
            // card's overflow menu → Move up / Move down.
            // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
            <li
              key={path.id}
              draggable={activePaths.length > 1}
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                if (dragIndex !== null && dragIndex !== index) reorderPath(activePaths[dragIndex].id, index)
                setDragIndex(null)
              }}
              onDragEnd={() => setDragIndex(null)}
              className={dragIndex === index ? 'opacity-50' : undefined}
            >
              <PathCard
                path={path}
                index={index}
                total={activePaths.length}
                onRename={() => setRenaming(path)}
                onArchive={() => archivePath(path.id)}
                onDelete={() => setDeleting(path)}
                onMoveUp={() => reorderPath(path.id, index - 1)}
                onMoveDown={() => reorderPath(path.id, index + 1)}
              />
            </li>
          ))}
        </ul>
      )}

      {archivedPaths.length > 0 && (
        <p className="text-sm">
          <Link
            to="/paths/archived"
            className="rounded-sm text-muted-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            View archived Paths ({archivedPaths.length})
          </Link>
        </p>
      )}

      <NewPathDialog open={creating} onOpenChange={setCreating} onCreate={createPath} />

      {renaming && (
        <RenamePathDialog
          open
          onOpenChange={(o) => !o && setRenaming(null)}
          currentName={renaming.name}
          onRename={(name) => renamePath(renaming.id, name)}
        />
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
