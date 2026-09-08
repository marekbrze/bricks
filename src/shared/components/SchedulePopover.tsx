import { useState, type ReactNode } from 'react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/style.css'
import { CalendarClock, Check, Sun, Sunrise, Armchair, CalendarRange, CalendarPlus, CircleSlash } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import {
  addDaysIso,
  comingMondayIso,
  comingSaturdayIso,
  isValidIso,
  quickDayHint,
  todayLocalIso,
  weekdayIndex,
} from '@/shared/lib/date'

/**
 * The one date-setter for an Action's `scheduledDate`, used everywhere the day
 * is chosen — the Actions view quick-add, every row's Schedule/Reschedule, the
 * Today view's "move to another day", the Overdue section's per-row reschedule.
 * Quick rows first (Today / Tomorrow / This weekend / Next week / In a week /
 * No date), inspired by Todoist / Things / TickTick, each labelled with the
 * concrete day it resolves to; an inline month calendar below for anything
 * else. Controlled: it holds no date state of its own.
 *
 * `SchedulePopoverPanel` is the bare content, reused inside a dialog body where
 * a popover-in-popover would be awkward.
 */

const DAY_MS_LABEL = 'Pick any date'

function isoFromDate(date: Date): string {
  const offsetMs = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 10)
}

function dateFromIso(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

type Quick = { key: string; label: string; icon: ReactNode; iso: string | null; hint?: string }

function quickOptions(hasValue: boolean): Quick[] {
  const today = todayLocalIso()
  const wd = weekdayIndex(today)
  const isWeekend = wd === 0 || wd === 6

  const options: Quick[] = [
    { key: 'today', label: 'Today', icon: <Sun aria-hidden="true" />, iso: today, hint: quickDayHint(today) },
    {
      key: 'tomorrow',
      label: 'Tomorrow',
      icon: <Sunrise aria-hidden="true" />,
      iso: addDaysIso(today, 1),
      hint: quickDayHint(addDaysIso(today, 1)),
    },
  ]

  if (!isWeekend) {
    const sat = comingSaturdayIso(today)
    options.push({
      key: 'weekend',
      label: 'This weekend',
      icon: <Armchair aria-hidden="true" />,
      iso: sat,
      hint: quickDayHint(sat),
    })
  }

  const mon = comingMondayIso(today)
  options.push({
    key: 'next-week',
    label: 'Next week',
    icon: <CalendarRange aria-hidden="true" />,
    iso: mon,
    hint: quickDayHint(mon),
  })

  const inAWeek = addDaysIso(today, 7)
  options.push({
    key: 'in-a-week',
    label: 'In a week',
    icon: <CalendarPlus aria-hidden="true" />,
    iso: inAWeek,
    hint: quickDayHint(inAWeek),
  })

  if (hasValue) {
    options.push({ key: 'none', label: 'No date', icon: <CircleSlash aria-hidden="true" />, iso: null })
  }

  return options
}

export function SchedulePopoverPanel({
  value,
  onSelect,
  className,
}: {
  value: string | null | undefined
  onSelect: (iso: string | null) => void
  className?: string
}) {
  const selectedIso = value && isValidIso(value) ? value : null
  const options = quickOptions(Boolean(selectedIso))

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <ul className="flex flex-col">
        {options.map((opt) => {
          const active = opt.iso === selectedIso || (opt.iso === null && selectedIso === null)
          return (
            <li key={opt.key}>
              <button
                type="button"
                onClick={() => onSelect(opt.iso)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none',
                  'hover:bg-muted hover:text-foreground focus-visible:bg-muted focus-visible:text-foreground',
                  opt.key === 'none' && 'text-muted-foreground',
                )}
              >
                <span className="text-muted-foreground [&_svg]:size-4">{opt.icon}</span>
                <span className="flex-1">{opt.label}</span>
                {opt.hint && <span className="text-xs text-muted-foreground">{opt.hint}</span>}
                {active && <Check className="size-3.5 text-primary" aria-hidden="true" />}
              </button>
            </li>
          )
        })}
      </ul>

      <div className="border-t border-border pt-1">
        <DayPicker
          className="rdp-schedule"
          mode="single"
          required={false}
          selected={selectedIso ? dateFromIso(selectedIso) : undefined}
          defaultMonth={selectedIso ? dateFromIso(selectedIso) : new Date()}
          onSelect={(day) => onSelect(day ? isoFromDate(day) : null)}
          aria-label={DAY_MS_LABEL}
        />
      </div>
    </div>
  )
}

export function SchedulePopover({
  value,
  onChange,
  trigger,
  align = 'start',
  side = 'bottom',
}: {
  value: string | null | undefined
  onChange: (iso: string | null) => void
  /** The clickable element. Defaults to a small calendar icon button. */
  trigger?: ReactNode
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'bottom' | 'left' | 'right'
}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          (trigger as React.ReactElement) ?? (
            <button
              type="button"
              aria-label="Set a due date"
              className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <CalendarClock className="size-4" aria-hidden="true" />
            </button>
          )
        }
      />
      <PopoverContent align={align} side={side} className="w-72 p-2">
        <SchedulePopoverPanel
          value={value}
          onSelect={(iso) => {
            onChange(iso)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
