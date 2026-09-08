import { useRef, useState } from 'react'
import { CalendarPlus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SchedulePopover } from '@/shared/components/SchedulePopover'
import { formatDayLabel } from '@/shared/lib/date'

/**
 * Inline quick-add row closing a Goal group or a Path's standalone group —
 * the Actions view's primary entry point, also reused on the Goal progress
 * page (ADR 0041). Type a name, optionally pick a due date from the schedule
 * popover (Today / Tomorrow / This weekend / Next week / In a week / any
 * date), press Enter. Default is no date. The input deliberately keeps focus
 * after creating, so several Actions can be typed in a row (Todoist-style).
 */
export function QuickAddActionRow({
  label,
  onCreate,
}: {
  /** Accessible label for the input — names the group it adds into. */
  label: string
  onCreate: (name: string, scheduledDate: string | null) => void
}) {
  const [name, setName] = useState('')
  const [scheduledDate, setScheduledDate] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const submit = () => {
    if (!name.trim()) return
    onCreate(name, scheduledDate)
    setName('')
    setScheduledDate(null)
    inputRef.current?.focus()
  }

  return (
    // `flex-wrap` lets the date chip drop under the input at narrow widths
    // instead of squeezing it to nothing (edgecases #8).
    <form
      role="group"
      aria-label={label}
      className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-border bg-card p-2"
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
    >
      <SchedulePopover
        value={scheduledDate}
        onChange={setScheduledDate}
        align="start"
        trigger={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Pick a due date for a new action in ${label}`}
            className={scheduledDate ? 'text-foreground' : 'text-muted-foreground'}
          >
            <CalendarPlus aria-hidden="true" />
          </Button>
        }
      />
      <Input
        ref={inputRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Add action…"
        aria-label={label}
        className="h-8 min-w-0 flex-1 basis-40 border-none bg-transparent shadow-none focus-visible:ring-0"
      />
      {scheduledDate && (
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {formatDayLabel(scheduledDate)}
          <button
            type="button"
            onClick={() => setScheduledDate(null)}
            aria-label="Clear due date"
            className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-3" aria-hidden="true" />
          </button>
        </span>
      )}
      <Button type="submit" size="sm" variant="ghost" disabled={!name.trim()} className="shrink-0">
        Add
      </Button>
    </form>
  )
}
