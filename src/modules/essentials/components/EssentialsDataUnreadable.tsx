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

/** Mirrors `PathsDataUnreadable` — corrupt `essentials` value, distinct from an empty list. */
export function EssentialsDataUnreadable({ onReset }: { onReset: () => void }) {
  const [confirming, setConfirming] = useState(false)

  return (
    <section className="flex flex-col items-center gap-3 py-16 text-center">
      <DatabaseZap className="size-8 text-muted-foreground" aria-hidden="true" />
      <div className="max-w-md">
        <h1 className="text-sm font-semibold">We couldn’t read your saved Essentials</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The data stored in this browser is corrupted, so Bricks can’t load it. Nothing else can be
          shown until it’s cleared — this removes the unreadable data and starts fresh. Your logged
          completions are stored separately and are not affected.
        </p>
      </div>
      <Button variant="destructive" onClick={() => setConfirming(true)}>
        Reset Essentials data
      </Button>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset all Essentials data?</AlertDialogTitle>
            <AlertDialogDescription>
              The corrupted data can’t be recovered. This clears the list of Essentials and gives you
              a clean start. This cannot be undone.
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
