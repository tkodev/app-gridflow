import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import type { Post } from '@/types/post'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva('inline-flex items-center rounded-sm px-1.5 py-0.5 text-xs font-medium capitalize', {
    variants: {
      status: {
        draft: 'bg-muted text-muted-foreground',
        scheduled: 'bg-amber-500/90 text-white',
        published: 'bg-emerald-600/90 text-white'
      } as Record<Post['status'], string>
    }
  })
}

// 2. types
type StatusProps = React.ComponentProps<'span'> &
  VariantProps<typeof styles.root> & {
    status: Post['status']
  }

// 3. component
const Status: React.FC<StatusProps> = (props) => {
  // a. props
  const { status, className, ...rest } = props

  // d. component
  return (
    <span className={cn(styles.root({ status, className }))} {...rest}>
      {status}
    </span>
  )
}

// 4. exports
export { Status, type StatusProps }
