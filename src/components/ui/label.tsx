import { cn } from '@/lib/utils'

function Label({ className, ...props }: React.ComponentProps<'label'>) {
  return (
    // eslint-disable-next-line jsx-a11y/label-has-associated-control -- consumers wire htmlFor/id
    <label
      data-slot="label"
      className={cn(
        'text-sm font-medium select-none peer-disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Label }
