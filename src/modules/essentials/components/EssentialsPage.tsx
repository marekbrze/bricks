import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArchiveRestore, ArrowLeft, Anchor, Plus } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { useToast } from '@/shared/components/toast/toast-context'
import { usePaths } from '@/modules/paths/hooks/use-paths'
import { PathsDataUnreadable } from '@/modules/paths/components/PathsDataUnreadable'
import { PathNotFound } from '@/modules/paths/components/PathNotFound'
import { PathTabs } from '@/modules/paths/components/PathTabs'
import { useActions } from '@/modules/capture-triage/hooks/use-actions'
import { ActionsDataUnreadable } from '@/modules/capture-triage/components/ActionsDataUnreadable'
import { useEssentials } from '../hooks/use-essentials'
import type { Essential } from '../types/essential'
import { SEED_ESSENTIALS } from '../lib/seed-examples'
import { EssentialRow } from './EssentialRow'
import { EssentialDialog } from './EssentialDialog'
import { LogEssentialDialog } from './LogEssentialDialog'
import { DeleteEssentialDialog } from './DeleteEssentialDialog'
import { EssentialsDataUnreadable } from './EssentialsDataUnreadable'

type DialogState =
  | { type: 'create' }
  | { type: 'edit'; essential: Essential }
  | { type: 'log'; essential: Essential }
  | { type: 'delete'; essential: Essential }
  | null

/**
 * The Path's Essentials tab (`/paths/:pathId/essentials`) — define the few
 * Absolutely Necessary Deeds for this Path, reorder them, and log each
 * completion (which creates an already-`done` `Action`). Same page shell as
 * the other Path tabs; read-only while the Path is archived.
 */
export function EssentialsPage() {
  const { pathId = '' } = useParams()
  const { showToast } = useToast()

  const { getPath, unarchivePath, dataUnreadable: pathsUnreadable, resetPaths } = usePaths()
  const {
    essentialsForPath,
    createEssential,
    editEssential,
    reorderEssential,
    deleteEssential,
    dataUnreadable: essentialsUnreadable,
    resetEssentials,
  } = useEssentials()
  const {
    logEssentialCompletion,
    essentialCompletionCounts,
    dataUnreadable: actionsUnreadable,
    resetActions,
  } = useActions()

  const [dragId, setDragId] = useState<string | null>(null)
  const [dialog, setDialog] = useState<DialogState>(null)

  if (pathsUnreadable) return <PathsDataUnreadable onReset={resetPaths} />
  if (essentialsUnreadable) return <EssentialsDataUnreadable onReset={resetEssentials} />
  if (actionsUnreadable) return <ActionsDataUnreadable onReset={resetActions} />

  const path = getPath(pathId)
  if (!path) return <PathNotFound />

  const readOnly = path.archived
  const essentials = essentialsForPath(path.id)

  const handleDropOn = (target: Essential, targetIndex: number) => {
    const draggedId = dragId
    setDragId(null)
    if (!draggedId || draggedId === target.id) return
    const dragged = essentials.find((e) => e.id === draggedId)
    const undo = reorderEssential(draggedId, targetIndex)
    // A drop that lands where it started returns null — stay silent, since the
    // toast is also the screen-reader announcement that the list changed.
    if (undo) showToast(`Moved “${dragged?.name ?? 'essential'}”`, { label: 'Undo', onClick: undo })
  }

  const handleReorder = (essential: Essential, toIndex: number) => {
    const undo = reorderEssential(essential.id, toIndex)
    if (undo) showToast(`Moved “${essential.name}”`, { label: 'Undo', onClick: undo })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          to="/paths"
          className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'self-start' })}
        >
          <ArrowLeft aria-hidden="true" /> Paths
        </Link>
        <h1 className="text-xl font-semibold break-words">{path.name}</h1>
      </div>

      <PathTabs pathId={path.id} />

      {readOnly && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 p-3">
          <p className="text-sm text-muted-foreground">
            “{path.name}” is archived. Its Essentials are kept but read-only until you restore it.
          </p>
          <Button variant="outline" size="sm" onClick={() => unarchivePath(path.id)}>
            <ArchiveRestore aria-hidden="true" /> Unarchive
          </Button>
        </div>
      )}

      <section aria-labelledby="essentials-tab-heading" className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 id="essentials-tab-heading" className="text-sm font-semibold">
            Essentials
          </h2>
          {!readOnly && (
            <Button variant="outline" size="sm" onClick={() => setDialog({ type: 'create' })}>
              <Plus aria-hidden="true" /> New essential
            </Button>
          )}
        </div>

        {essentials.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card py-14 text-center">
            <Anchor className="size-8 text-muted-foreground" aria-hidden="true" />
            <div className="max-w-md">
              <h3 className="text-sm font-semibold">No essentials yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {readOnly
                  ? 'No essentials were added to this Path.'
                  : 'Essentials are the few non-negotiable things you must keep doing for this Path — a salesperson’s “call clients”, a body Path’s “hang from a bar”. Log each one every time you do it.'}
              </p>
            </div>
            {!readOnly && (
              <>
                <Button onClick={() => setDialog({ type: 'create' })}>
                  <Plus aria-hidden="true" /> Add your first essential
                </Button>
                <div className="max-w-md text-left">
                  <p className="text-xs font-medium text-muted-foreground">For a body Path, e.g.:</p>
                  <ul className="mt-1 list-disc pl-5 text-xs text-muted-foreground">
                    {SEED_ESSENTIALS.slice(0, 5).map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        ) : (
          <ul className="flex flex-col gap-1">
            {essentials.map((essential, i) => (
              <EssentialRow
                key={essential.id}
                essential={essential}
                index={i}
                siblingCount={essentials.length}
                readOnly={readOnly}
                dragId={dragId}
                onDragStart={setDragId}
                onDropOn={handleDropOn}
                onDragEnd={() => setDragId(null)}
                onReorder={handleReorder}
                onLog={(e) => setDialog({ type: 'log', essential: e })}
                onEdit={(e) => setDialog({ type: 'edit', essential: e })}
                onDelete={(e) => setDialog({ type: 'delete', essential: e })}
              />
            ))}
          </ul>
        )}
      </section>

      {dialog?.type === 'create' && (
        <EssentialDialog
          open
          onOpenChange={(o) => !o && setDialog(null)}
          title="New essential"
          description={`A necessary deed for “${path.name}”.`}
          submitLabel="Create"
          onSubmit={(data) => {
            createEssential({ pathId: path.id, name: data.name, detail: data.detail })
            showToast(`Added “${data.name}”`)
          }}
        />
      )}

      {dialog?.type === 'edit' && (
        <EssentialDialog
          open
          onOpenChange={(o) => !o && setDialog(null)}
          title="Edit essential"
          description="Name and the one-line reminder."
          submitLabel="Save"
          initial={{ name: dialog.essential.name, detail: dialog.essential.detail }}
          onSubmit={(data) => {
            editEssential(dialog.essential.id, data)
            showToast(`Saved “${data.name}”`)
          }}
        />
      )}

      {dialog?.type === 'log' && (
        <LogEssentialDialog
          open
          onOpenChange={(o) => !o && setDialog(null)}
          essentialName={dialog.essential.name}
          onLog={(note) => {
            const undo = logEssentialCompletion({
              pathId: path.id,
              essentialId: dialog.essential.id,
              name: dialog.essential.name,
              note,
            })
            showToast(`Logged “${dialog.essential.name}”`, { label: 'Undo', onClick: undo })
          }}
        />
      )}

      {dialog?.type === 'delete' && (
        <DeleteEssentialDialog
          open
          onOpenChange={(o) => !o && setDialog(null)}
          essentialName={dialog.essential.name}
          completionsTotal={essentialCompletionCounts(dialog.essential.id).total}
          onConfirm={() => {
            const name = dialog.essential.name
            const undo = deleteEssential(dialog.essential.id)
            showToast(`“${name}” deleted`, { label: 'Undo', onClick: undo })
          }}
        />
      )}
    </div>
  )
}
