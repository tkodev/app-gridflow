import type { Post } from '@/types/post'
import { cn } from '@/utils/tailwind'

const statusClassName: Record<Post['status'], string> = {
  draft: 'bg-muted text-muted-foreground',
  scheduled: 'bg-amber-500/90 text-white',
  published: 'bg-emerald-600/90 text-white'
}

/**
 * Status label for posts: draft (grey), scheduled (amber), published (green).
 */
export const PostStatusPill = ({
  status,
  className,
  compact = false
}: {
  status: Post['status']
  className?: string
  /** Thumbnail overlay: smaller type and tighter padding. */
  compact?: boolean
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium capitalize',
        compact ? 'rounded-sm px-1.5 py-0.5 text-[10px]' : 'rounded-full px-2 py-0.5 text-xs',
        statusClassName[status],
        className
      )}
    >
      {status}
    </span>
  )
}
