import { useRef, useState } from 'react'
import { CalendarPlus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { addDaysIso, formatDayLabel, todayLocalIso } from '@/shared/lib/date'

/**
 * Inline quick-add row closing a Goal group or a Path's standalone group —
 * the Actions view's primary entry point. Type a name, optionally pick a due
 * date from the calendar menu (Today / Tomorrow / In a week / any date),
 * press Enter. Default is no date. The input deliberately keeps focus after
 * creating, so several Actions can be typed in a row (Todoist-style).
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
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerDate, setPickerDate] = useState(todayLocalIso())
  const inputRef = useRef<HTMLInputElement>(null)

  const submit = () => {
    if (!name.trim()) return
    onCreate(name, scheduledDate)
    setName('')
    setScheduledDate(null)
    inputRef.current?.focus()
  }

  const openPicker = () => {
    setPickerDate(scheduledDate ?? todayLocalIso())
    setPickerOpen(true)
  }

  return (
    // `flex-wrap` lets the date chip drop under the input at narrow widths
    // instead of squeezing it to nothing (edgecases #8).
    <form
      role="group"
      aria-label={label}
      className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-border p-2"
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
    >
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
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
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => setScheduledDate(todayLocalIso())}>
            Today
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setScheduledDate(addDaysIso(todayLocalIso(), 1))}>
            Tomorrow
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setScheduledDate(addDaysIso(todayLocalIso(), 7))}>
            In a week
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={openPicker}>Pick a date…</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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

      {pickerOpen && (
        <Dialog open onOpenChange={(open) => !open && setPickerOpen(false)}>
          <DialogContent>
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault()
                if (!pickerDate) return
                setScheduledDate(pickerDate)
                setPickerOpen(false)
                inputRef.current?.focus()
              }}
            >
              <DialogHeader>
                <DialogTitle>Pick a due date</DialogTitle>
                <DialogDescription>
                  The new action in {label} will show up in Today on that day.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="quick-add-date">Date</Label>
                <Input
                  id="quick-add-date"
                  type="date"
                  value={pickerDate}
                  onChange={(e) => setPickerDate(e.target.value)}
                  className="w-fit"
                  // eslint-disable-next-line jsx-a11y/no-autofocus -- dialog opens directly onto its one field
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setPickerOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!pickerDate}>
                  Set date
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </form>
  )
}
