import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogClose,
} from '@/components/ui/alert-dialog'
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
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “{pathName}”?</AlertDialogTitle>
          <AlertDialogDescription>This permanently deletes:</AlertDialogDescription>
        </AlertDialogHeader>
        <ul className="list-disc pl-5 text-sm text-muted-foreground">
          {lines.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground">
          Goal, Action and Vision counts are estimates until those modules are built.
        </p>
        <p className="text-sm font-medium text-destructive">This cannot be undone.</p>
        <AlertDialogFooter>
          <AlertDialogClose render={<Button variant="ghost">Cancel</Button>} />
          <AlertDialogClose
            render={
              <Button variant="destructive" onClick={onConfirm}>
                Delete Path
              </Button>
            }
          />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
