/**
 * Non-fixed footer at the bottom of the content flow. Mostly relevant on
 * mobile, where the user can scroll past the content to reach it (the fixed
 * BottomTabs sit below it). Placeholder links — wired up later.
 */
export function AppFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span className="font-medium text-foreground">Bricks</span>
        <nav aria-label="Secondary navigation" className="flex flex-wrap gap-x-4 gap-y-1">
          <span className="opacity-60">Settings</span>
          <span className="opacity-60">Export</span>
          <span className="opacity-60">About</span>
        </nav>
      </div>
    </footer>
  )
}
