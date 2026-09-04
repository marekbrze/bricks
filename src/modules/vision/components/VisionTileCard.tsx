import { useState } from 'react'
import { ArrowDown, ArrowUp, GripVertical, MoreVertical, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { VisionTile } from '../types/vision'

/** Notes longer than this clamp on the board (full text via click-to-edit). */
const NOTE_CLAMP = 6 * 60

/** One tile on the Vision board — a note (click to edit in place) or an image. */
export function VisionTileCard({
  tile,
  index,
  tileCount,
  readOnly,
  dragId,
  onDragStart,
  onDropOn,
  onDragEnd,
  onMoveUp,
  onMoveDown,
  onEditNote,
  onDelete,
}: {
  tile: VisionTile
  index: number
  tileCount: number
  readOnly: boolean
  dragId: string | null
  onDragStart: (id: string) => void
  onDropOn: (index: number) => void
  onDragEnd: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onEditNote: (text: string) => void
  onDelete: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(tile.type === 'note' ? tile.text : '')
  const draggable = !readOnly && tileCount > 1

  const commit = () => {
    if (tile.type !== 'note') return
    const t = draft.trim()
    if (t && t !== tile.text) onEditNote(t)
    else setDraft(tile.text)
    setEditing(false)
  }

  const menuLabel =
    tile.type === 'note' ? `Actions for note “${tile.text.slice(0, 30)}”` : `Actions for image “${tile.alt}”`

  return (
    /* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- drag handlers on a
       plain list item; the keyboard-accessible path is the overflow menu's Move up / Move down */
    <li
      draggable={draggable}
      onDragStart={() => onDragStart(tile.id)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
        onDropOn(index)
      }}
      onDragEnd={onDragEnd}
      className={cn('list-none', dragId === tile.id && 'opacity-50')}
    >
      <Card className="gap-2 p-3">
        <div className="flex items-start gap-1">
          {draggable && (
            <GripVertical
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 cursor-grab text-muted-foreground active:cursor-grabbing"
            />
          )}
          <div className="min-w-0 flex-1">
            {tile.type === 'note' ? (
              editing && !readOnly ? (
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onBlur={commit}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setDraft(tile.text)
                      setEditing(false)
                    }
                  }}
                  // eslint-disable-next-line jsx-a11y/no-autofocus -- focus follows the user into inline edit mode
                  autoFocus
                  aria-label="Edit note"
                  rows={3}
                  className="w-full resize-none rounded-lg border border-border bg-background p-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              ) : (
                <button
                  type="button"
                  disabled={readOnly}
                  onClick={() => {
                    setDraft(tile.text)
                    setEditing(true)
                  }}
                  title={tile.text.length > NOTE_CLAMP ? 'Click to read and edit the full note' : undefined}
                  aria-label={readOnly ? undefined : `Edit note “${tile.text.slice(0, 30)}”`}
                  // Display-only clamp — storage and the editor keep the full
                  // text; a pasted wall can't blow out the grid row.
                  className="line-clamp-6 w-full rounded-sm text-left text-sm break-words whitespace-pre-wrap outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-default"
                >
                  {tile.text}
                </button>
              )
            ) : (
              <figure className="flex flex-col gap-1">
                <img
                  src={tile.src}
                  alt={tile.alt}
                  className="aspect-[4/3] w-full rounded-lg object-cover"
                  loading="lazy"
                />
                {tile.attribution && (
                  <figcaption className="text-xs text-muted-foreground">
                    Photo by{' '}
                    <a
                      href={tile.attribution.profileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="underline hover:no-underline"
                    >
                      {tile.attribution.photographer}
                    </a>{' '}
                    on Unsplash
                  </figcaption>
                )}
              </figure>
            )}
          </div>
          {!readOnly && !editing && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="icon-xs" aria-label={menuLabel}>
                    <MoreVertical aria-hidden="true" />
                  </Button>
                }
              />
              <DropdownMenuContent>
                <DropdownMenuItem onClick={onMoveUp} disabled={index === 0}>
                  <ArrowUp aria-hidden="true" /> Move up
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onMoveDown} disabled={index === tileCount - 1}>
                  <ArrowDown aria-hidden="true" /> Move down
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={onDelete}>
                  <Trash2 aria-hidden="true" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </Card>
    </li>
  )
}
