import { Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

/**
 * The moment of closing a Goal from the Actions screens (ADR 0039) — a calm
 * confirmation, not a party (DESIGN.md bans gamification): trophy badge in
 * the win tint, the Goal's name, and the one sentence the decision needs.
 * Closing is deliberate here, unlike the Goals-tree menu's one-click achieve —
 * the extra step is the ceremony the win deserves, and it prevents closing a
 * group by menu-slip while working through its Actions.
 */
export function CloseGoalDialog({
  goalName,
  onConfirm,
  onOpenChange,
}: {
  goalName: string
  onConfirm: () => void
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <span className="mb-1 inline-flex size-9 items-center justify-center rounded-full bg-win-soft text-win-strong">
            <Trophy className="size-5" aria-hidden="true" />
          </span>
          <DialogTitle>Goal achieved</DialogTitle>
          <DialogDescription>
            “{goalName}” lands in the Log as a big win. Open Actions don't stand in the way —
            closing a Goal is a decision, not a checkbox.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Not yet
          </Button>
          <Button type="button" onClick={onConfirm}>
            Close goal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
