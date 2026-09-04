import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'

/**
 * Placeholder for a section the `paths` overview embeds but does not own — the
 * Vision summary (`vision` module) and the Goals list (`goals` module). Keeps the
 * click-through whole until those modules get their own proto-lofi pass.
 */
export function ModuleStubSection({
  id,
  heading,
  blurb,
  linkTo,
  linkLabel,
}: {
  id: string
  heading: string
  blurb: string
  linkTo: string
  linkLabel: string
}) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 id={id} className="text-sm font-semibold">
          {heading}
        </h2>
        <Link to={linkTo} className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
          {linkLabel} <ArrowRight aria-hidden="true" />
        </Link>
      </div>
      <p className="rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
        {blurb}
      </p>
    </section>
  )
}
