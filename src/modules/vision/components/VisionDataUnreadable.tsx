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

/** Mirrors `PathsDataUnreadable` — corrupt `visions` value, distinct from an empty board. */
export function VisionDataUnreadable({ onReset }: { onReset: () => void }) {
  const [confirming, setConfirming] = useState(false)

  return (
    <section className="flex flex-col items-center gap-3 py-16 text-center">
      <DatabaseZap className="size-8 text-muted-foreground" aria-hidden="true" />
      <div className="max-w-md">
        <h1 className="text-sm font-semibold">We couldn’t read your saved Vision boards</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The data stored in this browser is corrupted, so Bricks can’t load it. Nothing else can
          be shown until it’s cleared — this removes the unreadable data and starts fresh.
        </p>
      </div>
      <Button variant="destructive" onClick={() => setConfirming(true)}>
        Reset Vision data
      </Button>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset all Vision data?</AlertDialogTitle>
            <AlertDialogDescription>
              The corrupted data can’t be recovered. This clears it and gives you a clean start.
              This cannot be undone.
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
