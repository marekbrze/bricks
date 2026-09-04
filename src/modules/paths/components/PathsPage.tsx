import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Plus, Signpost } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/shared/components/toast/toast-context'
import { usePaths } from '../hooks/use-paths'
import type { Path } from '../types/path'
import { PathCard } from './PathCard'
import { NewPathDialog } from './NewPathDialog'
import { RenamePathDialog } from './RenamePathDialog'
import { DeletePathDialog } from './DeletePathDialog'
import { PathsDataUnreadable } from './PathsDataUnreadable'

export function PathsPage() {
  const {
    activePaths,
    archivedPaths,
    dataUnreadable,
    resetPaths,
    createPath,
    renamePath,
    archivePath,
    deletePath,
    reorderPath,
    cascadeCounts,
  } = usePaths()
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useToast()

  const [creating, setCreating] = useState(false)
  const [renaming, setRenaming] = useState<Path | null>(null)
  const [deleting, setDeleting] = useState<Path | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)

  // Arrived here after deleting a Path from its overview — confirm it and take focus.
  const deletedName = (location.state as { deletedName?: string } | null)?.deletedName
  useEffect(() => {
    if (!deletedName) return
    showToast(`“${deletedName}” deleted`)
    headingRef.current?.focus()
    navigate('/paths', { replace: true })
  }, [deletedName, showToast, navigate])

  if (dataUnreadable) return <PathsDataUnreadable onReset={resetPaths} />

  const handleArchive = (path: Path) => {
    const undo = archivePath(path.id)
    showToast(`“${path.name}” archived`, { label: 'Undo', onClick: undo })
  }

  const handleReorder = (id: string, name: string, toIndex: number) => {
    const undo = reorderPath(id, toIndex)
    showToast(`Moved “${name}”`, { label: 'Undo', onClick: undo })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 ref={headingRef} tabIndex={-1} className="text-xl font-semibold outline-none">
          Paths
        </h1>
        <Button onClick={() => setCreating(true)}>
          <Plus aria-hidden="true" /> New Path
        </Button>
      </div>

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
                if (dragIndex !== null && dragIndex !== index) {
                  const moved = activePaths[dragIndex]
                  handleReorder(moved.id, moved.name, index)
                }
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
                onArchive={() => handleArchive(path)}
                onDelete={() => setDeleting(path)}
                onMoveUp={() => handleReorder(path.id, path.name, index - 1)}
                onMoveDown={() => handleReorder(path.id, path.name, index + 1)}
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

      <NewPathDialog
        open={creating}
        onOpenChange={setCreating}
        onCreate={(name, achievements) => {
          const id = createPath(name, achievements)
          navigate(`/paths/${id}`)
        }}
      />

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
          onConfirm={() => {
            const name = deleting.name
            deletePath(deleting.id)
            showToast(`“${name}” deleted`)
          }}
        />
      )}
    </div>
  )
}
