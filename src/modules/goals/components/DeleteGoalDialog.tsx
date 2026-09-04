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
import type { GoalCascadeCounts } from '../types/goal'

/** Mirrors `paths`' `DeletePathDialog` — same cascade-summary pattern, real (not estimated) counts. */
export function DeleteGoalDialog({
  open,
  onOpenChange,
  goalName,
  counts,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  goalName: string
  counts: GoalCascadeCounts
  onConfirm: () => void
}) {
  const lines: string[] = []
  if (counts.subGoals > 0) lines.push(`${counts.subGoals} sub-${counts.subGoals === 1 ? 'Goal' : 'Goals'}`)
  if (counts.actions > 0) lines.push(`${counts.actions} ${counts.actions === 1 ? 'Action' : 'Actions'}`)

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “{goalName}”?</AlertDialogTitle>
          <AlertDialogDescription>
            {lines.length > 0 ? 'This permanently deletes:' : 'This Goal has no sub-Goals or Actions.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {lines.length > 0 && (
          <ul className="list-disc pl-5 text-sm text-muted-foreground">
            {lines.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        )}
        <p className="text-sm font-medium text-destructive">This cannot be undone.</p>
        <AlertDialogFooter>
          <AlertDialogClose render={<Button variant="ghost">Cancel</Button>} />
          <AlertDialogClose
            render={
              <Button variant="destructive" onClick={onConfirm}>
                Delete Goal
              </Button>
            }
          />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
