import { useState } from 'react'
import { Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { QuickCaptureInput } from './QuickCaptureInput'

/**
 * Global capture entry point, mounted in `AppHeader` so an idea can be
 * dropped from any screen without navigating to the Inbox. The dialog stays
 * open after Add — capturing several ideas in a row shouldn't mean reopening
 * it each time.
 */
export function QuickCaptureButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Inbox aria-hidden="true" /> Capture
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Capture an idea</DialogTitle>
            <DialogDescription>
              Just a name — decide where it belongs later, during triage.
            </DialogDescription>
          </DialogHeader>
          <QuickCaptureInput focusOnOpen />
        </DialogContent>
      </Dialog>
    </>
  )
}
