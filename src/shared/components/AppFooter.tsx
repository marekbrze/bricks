import { Link } from 'react-router-dom'

/**
 * Non-fixed footer at the bottom of the content flow. Mostly relevant on
 * mobile, where the user can scroll past the content to reach it (the fixed
 * BottomTabs sit below it). Data sync is the one wired-up entry — the
 * settings-level surfaces live here, not in the main nav. Placeholder
 * links — wired up later.
 */
export function AppFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span className="font-medium text-foreground">Bricks</span>
        <nav aria-label="Secondary navigation" className="flex flex-wrap gap-x-4 gap-y-1">
          <Link
            to="/data-sync"
            className="rounded-sm underline-offset-2 outline-none hover:text-foreground hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Data sync
          </Link>
          <span className="opacity-60">Export</span>
          <span className="opacity-60">About</span>
        </nav>
      </div>
    </footer>
  )
}
