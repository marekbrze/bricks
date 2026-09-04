import { Link } from 'react-router-dom'
import { SearchX } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'

export function GoalNotFound({ pathId }: { pathId: string }) {
  return (
    <section className="flex flex-col items-center gap-3 py-16 text-center">
      <SearchX className="size-8 text-muted-foreground" aria-hidden="true" />
      <div className="max-w-sm">
        <h1 className="text-sm font-semibold">This Goal isn’t here</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          It may have been deleted, or moved to another Path.
        </p>
      </div>
      <Link to={`/paths/${pathId}/goals`} className={buttonVariants()}>
        Back to Goals
      </Link>
    </section>
  )
}
