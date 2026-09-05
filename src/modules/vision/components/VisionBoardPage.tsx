import { useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArchiveRestore, ArrowLeft, Download, Image as ImageIcon } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { useToast } from '@/shared/components/toast/toast-context'
import { usePaths } from '@/modules/paths/hooks/use-paths'
import { PathsDataUnreadable } from '@/modules/paths/components/PathsDataUnreadable'
import { PathNotFound } from '@/modules/paths/components/PathNotFound'
import { PathTabs } from '@/modules/paths/components/PathTabs'
import { useVision } from '../hooks/use-vision'
import { downloadVisionMarkdown } from '../lib/export-markdown'
import type { MockUnsplashPhoto } from '../data/unsplash-mock'
import { AddTileMenu } from './AddTileMenu'
import { UnsplashSearchDialog } from './UnsplashSearchDialog'
import { VisionTileCard } from './VisionTileCard'
import { VisionDataUnreadable } from './VisionDataUnreadable'

/**
 * Upload ceiling — keeps a single pick from exhausting the ~5 MB LocalStorage
 * budget (a data URL is ~4/3× the file size) and flipping the whole app into
 * "changes aren't being saved". A prototype-safe limit, not a product rule.
 */
const MAX_UPLOAD_MB = 1.5
const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024

export function VisionBoardPage() {
  const { pathId = '' } = useParams()
  const { showToast } = useToast()
  const { getPath, unarchivePath, dataUnreadable: pathsUnreadable, resetPaths } = usePaths()
  const {
    tilesForPath,
    dataUnreadable: visionUnreadable,
    resetVisions,
    addNote,
    editNote,
    addImage,
    deleteTile,
    reorderTile,
  } = useVision()

  const [dragId, setDragId] = useState<string | null>(null)
  const [addingNote, setAddingNote] = useState(false)
  const [noteDraft, setNoteDraft] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (pathsUnreadable) return <PathsDataUnreadable onReset={resetPaths} />
  if (visionUnreadable) return <VisionDataUnreadable onReset={resetVisions} />

  const path = getPath(pathId)
  if (!path) return <PathNotFound />

  const readOnly = path.archived
  const tiles = tilesForPath(pathId)

  const handleDropOn = (targetIndex: number) => {
    const draggedId = dragId
    setDragId(null)
    if (!draggedId) return
    reorderTile(pathId, draggedId, targetIndex)
  }

  const handleReorder = (tileId: string, toIndex: number) => {
    const undo = reorderTile(pathId, tileId, toIndex)
    // A no-op (drop in place, tile gone) stays silent — the toast is also the
    // screen-reader announcement that the board changed, so it must be true.
    if (undo) showToast('Moved', { label: 'Undo', onClick: undo })
  }

  const handleDelete = (tileId: string) => {
    const undo = deleteTile(pathId, tileId)
    if (undo) showToast('Tile deleted', { label: 'Undo', onClick: undo })
  }

  const commitNewNote = () => {
    const t = noteDraft.trim()
    if (t) addNote(pathId, t)
    setNoteDraft('')
    setAddingNote(false)
  }

  const handleUploadFile = (file: File | undefined) => {
    if (!file) return
    // `accept="image/*"` only filters the picker's default view — the Owner can
    // still pick any file, and a non-image would render as a broken tile.
    if (!file.type.startsWith('image/')) {
      showToast('That’s not an image file — pick a JPG, PNG, WebP or GIF.')
      return
    }
    // LocalStorage (this prototype's storage) holds roughly 5 MB per origin,
    // and a data URL is ~4/3× the file size — one phone photo would blow the
    // quota and stop the whole app from persisting. Guard before reading.
    if (file.size > MAX_UPLOAD_BYTES) {
      showToast(`That image is too large to store locally — pick one under ${MAX_UPLOAD_MB} MB.`)
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        addImage(pathId, { src: reader.result, alt: file.name, source: 'upload' })
      }
    }
    reader.onerror = () => {
      showToast('Couldn’t read that file — try again.')
    }
    reader.readAsDataURL(file)
  }

  const handlePickUnsplash = (photo: MockUnsplashPhoto) => {
    addImage(pathId, {
      src: photo.src,
      alt: photo.alt,
      source: 'unsplash',
      attribution: { photographer: photo.photographer, profileUrl: photo.profileUrl },
    })
    setSearchOpen(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          to={`/paths/${path.id}`}
          className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'self-start' })}
        >
          <ArrowLeft aria-hidden="true" /> {path.name}
        </Link>
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-semibold">Vision</h1>
          <div className="flex items-center gap-2">
            {tiles.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadVisionMarkdown(path.name, tiles)}
              >
                <Download aria-hidden="true" /> Export
              </Button>
            )}
            {!readOnly && (
              <AddTileMenu
                onAddNote={() => setAddingNote(true)}
                onUploadImage={() => fileInputRef.current?.click()}
                onSearchUnsplash={() => setSearchOpen(true)}
              />
            )}
          </div>
        </div>
      </div>

      <PathTabs pathId={path.id} />

      {readOnly && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 p-3">
          <p className="text-sm text-muted-foreground">
            “{path.name}” is archived. Its Vision is kept but read-only until you restore it.
          </p>
          <Button variant="outline" size="sm" onClick={() => unarchivePath(path.id)}>
            <ArchiveRestore aria-hidden="true" /> Unarchive
          </Button>
        </div>
      )}

      {tiles.length === 0 && !addingNote ? (
        <section className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <ImageIcon className="size-8 text-muted-foreground" aria-hidden="true" />
          <div className="max-w-sm">
            <h2 className="text-sm font-semibold">No Vision yet for “{path.name}”</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {readOnly
                ? 'No notes or photos were added to this Vision.'
                : 'A short note, a photo — however this Path starts taking shape.'}
            </p>
          </div>
          {!readOnly && (
            <AddTileMenu
              onAddNote={() => setAddingNote(true)}
              onUploadImage={() => fileInputRef.current?.click()}
              onSearchUnsplash={() => setSearchOpen(true)}
            />
          )}
        </section>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tiles.map((tile, i) => (
            <VisionTileCard
              key={tile.id}
              tile={tile}
              index={i}
              tileCount={tiles.length}
              readOnly={readOnly}
              dragId={dragId}
              onDragStart={setDragId}
              onDropOn={handleDropOn}
              onDragEnd={() => setDragId(null)}
              onMoveUp={() => handleReorder(tile.id, i - 1)}
              onMoveDown={() => handleReorder(tile.id, i + 1)}
              onEditNote={(text) => editNote(pathId, tile.id, text)}
              onDelete={() => handleDelete(tile.id)}
            />
          ))}
          {addingNote && (
            <li className="list-none">
              <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3">
                <textarea
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setNoteDraft('')
                      setAddingNote(false)
                    }
                  }}
                  placeholder="A short fragment…"
                  aria-label="New note"
                  rows={3}
                  // eslint-disable-next-line jsx-a11y/no-autofocus -- focus follows the user into the new tile
                  autoFocus
                  className="w-full resize-none rounded-lg border border-border bg-background p-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setNoteDraft('')
                      setAddingNote(false)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={commitNewNote} disabled={!noteDraft.trim()}>
                    Save
                  </Button>
                </div>
              </div>
            </li>
          )}
        </ul>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(e) => {
          handleUploadFile(e.target.files?.[0])
          e.target.value = ''
        }}
      />

      <UnsplashSearchDialog open={searchOpen} onOpenChange={setSearchOpen} onPick={handlePickUnsplash} />
    </div>
  )
}
