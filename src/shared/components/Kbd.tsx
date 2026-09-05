import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Visual hint for a single-key shortcut, shown inline next to the action it
 * triggers (e.g. `Discard` + `Kbd>D`). Presentational only — the actual
 * keydown handling lives with whoever owns the shortcut.
 */
export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      aria-hidden="true"
      className={cn(
        'ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-[4px] border border-border/80 bg-muted px-1 font-mono text-[0.65rem] font-medium text-muted-foreground',
        className,
      )}
    >
      {children}
    </kbd>
  )
}
