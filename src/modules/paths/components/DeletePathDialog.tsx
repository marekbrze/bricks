import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import type { PathCascadeCounts } from '../types/path'

export function DeletePathDialog({
  open,
  onOpenChange,
  pathName,
  counts,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  pathName: string
  counts: PathCascadeCounts
  onConfirm: () => void
}) {
  const lines: string[] = []
  if (counts.visionTiles > 0)
    lines.push(`${counts.visionTiles} Vision ${counts.visionTiles === 1 ? 'tile' : 'tiles'}`)
  lines.push(`${counts.achievements} ${counts.achievements === 1 ? 'Achievement' : 'Achievements'}`)
  lines.push(`${counts.goals} ${counts.goals === 1 ? 'Goal' : 'Goals'}`)
  lines.push(`${counts.actions} ${counts.actions === 1 ? 'Action' : 'Actions'}`)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete “{pathName}”?</DialogTitle>
          <DialogDescription>This permanently deletes:</DialogDescription>
        </DialogHeader>
        <ul className="list-disc pl-5 text-sm text-muted-foreground">
          {lines.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
        <p className="text-sm font-medium text-destructive">This cannot be undone.</p>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
          >
            Delete Path
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
