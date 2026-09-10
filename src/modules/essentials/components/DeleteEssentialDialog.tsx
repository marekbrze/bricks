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

/**
 * Delete one Essential. Unlike a Goal or Path delete, nothing cascades — the
 * completions it produced are real, already-counted wins and stay. The dialog
 * says so plainly. Undo-backed by the caller.
 */
export function DeleteEssentialDialog({
  open,
  onOpenChange,
  essentialName,
  completionsTotal,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  essentialName: string
  completionsTotal: number
  onConfirm: () => void
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “{essentialName}”?</AlertDialogTitle>
          <AlertDialogDescription>
            {completionsTotal > 0
              ? `Its ${completionsTotal} logged ${
                  completionsTotal === 1 ? 'completion is' : 'completions are'
                } kept as wins — this removes the Essential from the list only.`
              : 'This removes the Essential from the list. It has no logged completions.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogClose render={<Button variant="ghost">Cancel</Button>} />
          <AlertDialogClose
            render={
              <Button variant="destructive" onClick={onConfirm}>
                Delete Essential
              </Button>
            }
          />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
