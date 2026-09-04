import { useState } from 'react'
import { DatabaseZap } from 'lucide-react'
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
 * Shown when the stored `paths` value exists but can't be parsed — a corrupt
 * LocalStorage entry. Deliberately distinct from the empty state: the user is
 * told their data is unreadable, not that they have none, and the only way
 * forward (a destructive reset) is behind a confirmation.
 */
export function PathsDataUnreadable({ onReset }: { onReset: () => void }) {
  const [confirming, setConfirming] = useState(false)

  return (
    <section className="flex flex-col items-center gap-3 py-16 text-center">
      <DatabaseZap className="size-8 text-muted-foreground" aria-hidden="true" />
      <div className="max-w-md">
        <h1 className="text-sm font-semibold">We couldn’t read your saved Paths</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The data stored in this browser is corrupted, so Bricks can’t load it. Nothing
          else can be shown until it’s cleared — this removes the unreadable data and
          starts fresh.
        </p>
      </div>
      <Button variant="destructive" onClick={() => setConfirming(true)}>
        Reset Paths data
      </Button>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset all Paths data?</AlertDialogTitle>
            <AlertDialogDescription>
              The corrupted data can’t be recovered. This clears it and gives you a clean
              start. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose render={<Button variant="ghost">Cancel</Button>} />
            <AlertDialogClose
              render={
                <Button variant="destructive" onClick={onReset}>
                  Reset data
                </Button>
              }
            />
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
