'use client'

import Image from 'next/image'
import { Copy } from 'lucide-react'
import * as React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { cva, type VariantProps } from 'class-variance-authority'
import type { Post } from '@/types/post'
import { Icon } from '@/components/atoms/icon'
import { Status } from '@/components/atoms/status'
import { sortableItemStyle } from '@/utils/dnd-kit'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva('bg-muted relative cursor-grab overflow-hidden rounded-lg active:cursor-grabbing', {
    variants: {
      gridRatio: {
        square: 'aspect-square',
        portrait: 'aspect-4/5'
      },
      dragging: {
        true: 'z-10 opacity-80 shadow-lg',
        false: ''
      }
    },
    defaultVariants: {
      gridRatio: 'square',
      dragging: false
    }
  }),
  video: cva('pointer-events-none absolute inset-0 size-full object-cover'),
  image: cva('object-cover'),
  srOnly: cva('sr-only'),
  stackIconWrap: cva('absolute top-2 right-2'),
  statusWrap: cva('absolute bottom-1 left-1')
}

// 2. types
type PostSortableItemProps = React.ComponentProps<'button'> &
  VariantProps<typeof styles.root> & {
    post: Post
    onClick: () => void
    gridRatio?: 'square' | 'portrait'
  }

// 3. component
const PostSortableItem: React.FC<PostSortableItemProps> = (props) => {
  // a. props
  const { className, post, onClick, gridRatio = 'square', ...rest } = props

  // b. hooks
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: dragging
  } = useSortable({
    id: post.id
  })

  // c. logic
  const style = sortableItemStyle(transform, transition)

  const firstMedia = post.media[0]
  const coverUrl = firstMedia?.media_url ?? ''

  // d. component
  return (
    <button
      ref={setNodeRef}
      className={cn(styles.root({ gridRatio, dragging, className }))}
      style={style}
      onClick={onClick}
      {...attributes}
      {...listeners}
      {...rest}
    >
      {firstMedia?.media_type === 'video' ? (
        <video
          className={styles.video()}
          preload="metadata"
          tabIndex={-1}
          src={coverUrl}
          onLoadedMetadata={(e) => {
            try {
              e.currentTarget.currentTime = 0.001
            } catch {
              /* ignore */
            }
          }}
          aria-hidden
          muted
          playsInline
        />
      ) : coverUrl ? (
        <Image
          className={styles.image()}
          sizes="(max-width: 768px) 33vw, 200px"
          alt={post.caption || 'Post image'}
          src={coverUrl}
          fill
        />
      ) : (
        <span className={styles.srOnly()}>No media</span>
      )}
      {post.media.length > 1 && (
        <div className={styles.stackIconWrap()}>
          <Icon icon={Copy} size="sm" tone="inverseElevated" />
        </div>
      )}
      {(post.status === 'draft' || post.status === 'scheduled') && (
        <div className={styles.statusWrap()}>
          <Status status={post.status} />
        </div>
      )}
    </button>
  )
}

// 4. exports
export type { PostSortableItemProps }
export { PostSortableItem }
