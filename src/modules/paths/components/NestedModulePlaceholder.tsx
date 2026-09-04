import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { usePaths } from '../hooks/use-paths'

/**
 * Stand-in for the nested screens the `paths` overview links into but does not
 * own — `/paths/:pathId/vision` (the `vision` module) and `/paths/:pathId/goals`
 * (the `goals` module). Replaced when those modules get their proto-lofi pass.
 */
export function NestedModulePlaceholder({ module, label }: { module: string; label: string }) {
  const { pathId = '' } = useParams()
  const { getPath } = usePaths()
  const path = getPath(pathId)

  return (
    <div className="flex flex-col gap-4">
      <Link
        to={`/paths/${pathId}`}
        className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'self-start' })}
      >
        <ArrowLeft aria-hidden="true" /> {path?.name ?? 'Path'}
      </Link>
      <section className="mx-auto max-w-md py-16 text-center">
        <h1 className="text-lg font-semibold">
          {label}
          {path ? ` — ${path.name}` : ''}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This screen belongs to the{' '}
          <code className="rounded bg-muted px-1 py-0.5">{module}</code> module. Build it with{' '}
          <code className="rounded bg-muted px-1 py-0.5">proto-lofi {module}</code>.
        </p>
      </section>
    </div>
  )
}
