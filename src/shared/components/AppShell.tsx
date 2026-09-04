import type { ReactNode } from 'react'
import { AppHeader } from './AppHeader'
import { AppFooter } from './AppFooter'
import { BottomTabs } from './BottomTabs'

/**
 * The frame every module screen renders inside.
 *
 * - Header: always visible, brand + desktop top-bar nav.
 * - Content: responsive, centred, max-width 1200px.
 * - Footer: non-fixed, at the end of the content flow.
 * - BottomTabs: fixed to the viewport bottom on mobile only; the content
 *   wrapper carries `pb-16` so the footer clears it when scrolled to the end.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:ring-3 focus:ring-ring/50"
      >
        Skip to content
      </a>

      <AppHeader />

      <div className="flex flex-1 flex-col pb-16 md:pb-0">
        <main id="main-content" className="flex-1">
          <div className="mx-auto w-full max-w-[1200px] px-4 py-6">{children}</div>
        </main>
        <AppFooter />
      </div>

      <BottomTabs />
    </div>
  )
}
