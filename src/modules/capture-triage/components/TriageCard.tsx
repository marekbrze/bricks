import { useEffect } from 'react'
import { SkipForward, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Kbd } from '@/shared/components/Kbd'
import type { Action } from '../types/action'
import { AssignPicker } from './AssignPicker'

/**
 * One Inbox `Action`, one decision. `Discard` and `Skip` carry single-letter
 * shortcuts (`D` / `S`) — ignored while the Owner is typing into the Goal
 * search below, so triage stays a fast, mostly-keyboard loop without
 * hijacking a Goal name that happens to contain those letters. `Assign`
 * (Path → Goal search, with inline Goal creation) has no separate confirm
 * step: picking a row in `AssignPicker` resolves the card immediately.
 */
export function TriageCard({
  action,
  position,
  total,
  onAssign,
  onPromote,
  onDiscard,
  onSkip,
}: {
  action: Action
  position: number
  total: number
  onAssign: (pathId: string, goalId: string | null) => void
  onPromote: (data: { name: string; pathId: string }) => void
  onDiscard: () => void
  onSkip: () => void
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'd' || e.key === 'D') {
        e.preventDefault()
        onDiscard()
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault()
        onSkip()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onDiscard, onSkip])

  return (
    <Card className="gap-5 p-6">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Item {position} of {total}
        </span>
        <Button variant="ghost" size="sm" onClick={onSkip}>
          <SkipForward aria-hidden="true" /> Skip
          <Kbd>S</Kbd>
        </Button>
      </div>

      <h2 className="text-lg font-semibold break-words">{action.name}</h2>

      <div className="flex flex-col gap-3 rounded-lg border border-border p-3">
        <AssignPicker onAssignExisting={onAssign} onCreateGoal={onPromote} />
      </div>

      <Button type="button" variant="destructive" onClick={onDiscard} className="self-start">
        <Trash2 aria-hidden="true" /> Discard
        <Kbd>D</Kbd>
      </Button>
    </Card>
  )
}
