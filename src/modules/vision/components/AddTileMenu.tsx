import { Plus, Search, StickyNote, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

/** The board's single "+ Add" entry point — a type picker rather than three permanent buttons. See ADR 0016. */
export function AddTileMenu({
  onAddNote,
  onUploadImage,
  onSearchUnsplash,
}: {
  onAddNote: () => void
  onUploadImage: () => void
  onSearchUnsplash: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button size="sm">
            <Plus aria-hidden="true" /> Add
          </Button>
        }
      />
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={onAddNote}>
          <StickyNote aria-hidden="true" /> Add note
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onUploadImage}>
          <Upload aria-hidden="true" /> Upload image
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onSearchUnsplash}>
          <Search aria-hidden="true" /> Search Unsplash
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
