import { MoreVertical, Pencil, Archive, ArchiveRestore, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

export interface PathOverflowMenuProps {
  pathName: string
  onRename?: () => void
  onArchive?: () => void
  onUnarchive?: () => void
  onDelete: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  canMoveUp?: boolean
  canMoveDown?: boolean
}

export function PathOverflowMenu({
  pathName,
  onRename,
  onArchive,
  onUnarchive,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: PathOverflowMenuProps) {
  const showReorder = Boolean(onMoveUp || onMoveDown)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${pathName}`}>
            <MoreVertical aria-hidden="true" />
          </Button>
        }
      />
      <DropdownMenuContent>
        {showReorder && (
          <>
            <DropdownMenuItem onClick={onMoveUp} disabled={!canMoveUp}>
              <ArrowUp aria-hidden="true" /> Move up
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onMoveDown} disabled={!canMoveDown}>
              <ArrowDown aria-hidden="true" /> Move down
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {onRename && (
          <DropdownMenuItem onClick={onRename}>
            <Pencil aria-hidden="true" /> Rename
          </DropdownMenuItem>
        )}
        {onArchive && (
          <DropdownMenuItem onClick={onArchive}>
            <Archive aria-hidden="true" /> Archive
          </DropdownMenuItem>
        )}
        {onUnarchive && (
          <DropdownMenuItem onClick={onUnarchive}>
            <ArchiveRestore aria-hidden="true" /> Unarchive
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <Trash2 aria-hidden="true" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
