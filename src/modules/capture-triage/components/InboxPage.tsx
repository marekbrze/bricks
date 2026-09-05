import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Inbox as InboxIcon, ListChecks, Trash2 } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogClose,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/shared/components/toast/toast-context'
import type { Action } from '../types/action'
import { useActions } from '../hooks/use-actions'
import { QuickCaptureInput } from './QuickCaptureInput'
import { ActionsDataUnreadable } from './ActionsDataUnreadable'

export function InboxPage() {
  const [deleting, setDeleting] = useState<Action | null>(null)
  const { showToast } = useToast()
  const { inboxActions, deleteAction, dataUnreadable, resetActions } = useActions()

  if (dataUnreadable) return <ActionsDataUnreadable onReset={resetActions} />

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Inbox</h1>
        {inboxActions.length > 0 && (
          <Link to="/capture-triage/triage" className={buttonVariants({ variant: 'default' })}>
            <ListChecks aria-hidden="true" /> Start Triage
          </Link>
        )}
      </div>

      <QuickCaptureInput />

      {inboxActions.length === 0 ? (
        <section className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <InboxIcon className="size-8 text-muted-foreground" aria-hidden="true" />
          <div className="max-w-sm">
            <h2 className="text-sm font-semibold">Inbox is empty</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Drop an idea above any time you think of one — decide where it belongs later.
              There's nothing to triage until something's here.
            </p>
          </div>
        </section>
      ) : (
        <ul className="flex flex-col divide-y divide-border rounded-xl border border-border">
          {inboxActions.map((action) => (
            <li key={action.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
              <span className="min-w-0 flex-1 break-words">{action.name}</span>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Delete “${action.name}”`}
                onClick={() => setDeleting(action)}
              >
                <Trash2 aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {deleting && (
        <AlertDialog open onOpenChange={(open) => !open && setDeleting(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete “{deleting.name}”?</AlertDialogTitle>
              <AlertDialogDescription>
                This permanently removes the Action. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogClose render={<Button variant="ghost">Cancel</Button>} />
              <AlertDialogClose
                render={
                  <Button
                    variant="destructive"
                    onClick={() => {
                      const name = deleting.name
                      deleteAction(deleting.id)
                      showToast(`“${name}” deleted`)
                    }}
                  >
                    Delete
                  </Button>
                }
              />
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
