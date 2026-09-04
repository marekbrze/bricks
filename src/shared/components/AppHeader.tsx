import { Link } from 'react-router-dom'
import { HOME_PATH } from '@/shared/navigation'
import { QuickCaptureButton } from '@/modules/capture-triage'
import { TopNav } from './TopNav'

/**
 * Always-visible header: brand on the left, desktop top-bar nav in the middle,
 * a placeholder slot on the right for future actions (settings, export).
 */
export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 w-full max-w-[1200px] items-center gap-6 px-4">
        <Link
          to={HOME_PATH}
          className="text-lg font-semibold tracking-tight rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Bricks
        </Link>

        <TopNav className="hidden md:flex" />

        {/* Right-side slot — settings / export land here too, later. */}
        <div className="ml-auto flex items-center gap-2">
          <QuickCaptureButton />
        </div>
      </div>
    </header>
  )
}
