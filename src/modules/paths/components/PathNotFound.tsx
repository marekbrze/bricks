import { Link } from 'react-router-dom'
import { SearchX } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'

export function PathNotFound() {
  return (
    <section className="flex flex-col items-center gap-3 py-16 text-center">
      <SearchX className="size-8 text-muted-foreground" aria-hidden="true" />
      <div className="max-w-sm">
        <h1 className="text-sm font-semibold">This Path isn’t here</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          It may have been deleted. Check the Paths list, or the archive if you put it away.
        </p>
      </div>
      <Link to="/paths" className={buttonVariants()}>
        Back to Paths
      </Link>
    </section>
  )
}
