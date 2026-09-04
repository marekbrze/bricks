import { useParams } from 'react-router-dom'
import { NAV_ITEMS } from '@/shared/navigation'

/**
 * Stand-in for a module's screens until proto-lofi builds them. Replace the
 * catch-all `/:moduleName` route with real per-module routes as each module
 * gets its lo-fi pass.
 */
export function ModulePlaceholder() {
  const { moduleName } = useParams()
  const nav = NAV_ITEMS.find((item) => item.module === moduleName)
  const title = nav?.label ?? moduleName ?? 'Moduł'

  return (
    <section className="mx-auto max-w-md py-16 text-center">
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Moduł <code className="rounded bg-muted px-1 py-0.5">{moduleName}</code> — ekrany doda{' '}
        <code className="rounded bg-muted px-1 py-0.5">proto-lofi</code>.
      </p>
    </section>
  )
}
