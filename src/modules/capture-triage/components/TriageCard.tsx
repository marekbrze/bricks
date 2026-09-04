import { useState } from 'react'
import { Check, Lightbulb, SkipForward, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { Action } from '../types/action'
import { AssignPicker, type AssignSelection } from './AssignPicker'
import { PromoteToGoalDialog } from './PromoteToGoalDialog'

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
  const [selection, setSelection] = useState<AssignSelection | null>(null)
  const [promoting, setPromoting] = useState(false)

  return (
    <Card className="gap-5 p-6">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Item {position} of {total}
        </span>
        <Button variant="ghost" size="sm" onClick={onSkip}>
          <SkipForward aria-hidden="true" /> Skip
        </Button>
      </div>

      <h2 className="text-lg font-semibold break-words">{action.name}</h2>

      <div className="flex flex-col gap-3 rounded-lg border border-border p-3">
        <AssignPicker value={selection} onChange={setSelection} />
        <Button
          onClick={() => selection && onAssign(selection.pathId, selection.goalId)}
          disabled={!selection}
          className="self-start"
        >
          <Check aria-hidden="true" /> Assign
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={() => setPromoting(true)}>
          <Lightbulb aria-hidden="true" /> Promote to Goal
        </Button>
        <Button type="button" variant="destructive" onClick={onDiscard}>
          <Trash2 aria-hidden="true" /> Discard
        </Button>
      </div>

      <PromoteToGoalDialog
        open={promoting}
        onOpenChange={setPromoting}
        actionName={action.name}
        onPromote={onPromote}
      />
    </Card>
  )
}
