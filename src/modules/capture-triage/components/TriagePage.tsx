import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, PartyPopper } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { useToast } from '@/shared/components/toast/toast-context'
import { usePaths } from '@/modules/paths/hooks/use-paths'
import { useActions } from '../hooks/use-actions'
import { MOCK_GOAL_OPTIONS } from '../data/mock-goal-options'
import { TriageCard } from './TriageCard'

/**
 * Dedicated card-by-card triage mode — one Inbox Action at a time. The
 * session queue lives in local state, not storage: `order` tracks which
 * Inbox ids are left to process this session and lets Skip push an item to
 * the back without touching its persisted state. See
 * docs/modules/capture-triage.md → "Process next item".
 */
export function TriagePage() {
  const { inboxActions, assignAction, promoteAction, discardAction } = useActions()
  const { activePaths } = usePaths()
  const { showToast } = useToast()

  const [order, setOrder] = useState<string[]>(() => inboxActions.map((a) => a.id))
  const [processedCount, setProcessedCount] = useState(0)

  // Keep the session queue in sync: drop items that resolved elsewhere, and
  // pick up anything newly captured while triage is open.
  useEffect(() => {
    setOrder((prev) => {
      const stillInbox = prev.filter((id) => inboxActions.some((a) => a.id === id))
      const newIds = inboxActions
        .filter((a) => !stillInbox.includes(a.id))
        .map((a) => a.id)
      return [...stillInbox, ...newIds]
    })
  }, [inboxActions])

  const currentId = order[0]
  const currentAction = inboxActions.find((a) => a.id === currentId)
  const total = processedCount + order.length

  const resolveOne = () => setProcessedCount((c) => c + 1)

  const handleAssign = (pathId: string, goalId: string | null) => {
    if (!currentAction) return
    assignAction(currentAction.id, pathId, goalId)
    const pathName = activePaths.find((p) => p.id === pathId)?.name ?? 'Path'
    const goalName = goalId ? MOCK_GOAL_OPTIONS.find((g) => g.id === goalId)?.name : null
    showToast(goalName ? `Assigned to “${goalName}”` : `Assigned to ${pathName} (standalone)`)
    resolveOne()
  }

  const handlePromote = ({ name, pathId }: { name: string; pathId: string }) => {
    if (!currentAction) return
    const undo = promoteAction(currentAction.id)
    const pathName = activePaths.find((p) => p.id === pathId)?.name ?? 'Path'
    showToast(`Promoted to a new Goal “${name}” under ${pathName}`, { label: 'Undo', onClick: undo })
    resolveOne()
  }

  const handleDiscard = () => {
    if (!currentAction) return
    const undo = discardAction(currentAction.id)
    showToast('Discarded', { label: 'Undo', onClick: undo })
    resolveOne()
  }

  const handleSkip = () => {
    if (!currentAction) return
    setOrder((prev) => [...prev.filter((id) => id !== currentAction.id), currentAction.id])
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4">
      <Link
        to="/capture-triage"
        className="inline-flex w-fit items-center gap-1 rounded-sm text-sm text-muted-foreground outline-none hover:text-foreground hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> Exit triage
      </Link>

      {currentAction ? (
        <TriageCard
          key={currentAction.id}
          action={currentAction}
          position={processedCount + 1}
          total={total}
          onAssign={handleAssign}
          onPromote={handlePromote}
          onDiscard={handleDiscard}
          onSkip={handleSkip}
        />
      ) : (
        <section className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <PartyPopper className="size-8 text-muted-foreground" aria-hidden="true" />
          <div className="max-w-sm">
            <h2 className="text-sm font-semibold">
              {processedCount > 0 ? `Inbox zero — ${processedCount} processed` : 'Nothing to triage'}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {processedCount > 0
                ? 'Every idea in this session has somewhere to go now.'
                : 'The Inbox is empty — capture an idea and it will show up here.'}
            </p>
          </div>
          <Link to="/capture-triage" className={buttonVariants({ variant: 'default' })}>
            Back to Inbox
          </Link>
        </section>
      )}
    </div>
  )
}
