'use client'

import Image from 'next/image'
import { Copy } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Post } from '@/types/post'
import { PostStatusPill } from '@/components/profiles/post-status-pill'
import { cn } from '@/utils/tailwind'

export const PostSortableItem = ({
  post,
  onClick,
  gridRatio = 'square'
}: {
  post: Post
  onClick: () => void
  gridRatio?: 'square' | 'portrait'
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: post.id
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  const firstMedia = post.media[0]
  const coverUrl = firstMedia?.media_url ?? ''

  return (
    <button
      ref={setNodeRef}
      className={cn(
        'bg-muted relative cursor-grab overflow-hidden active:cursor-grabbing',
        gridRatio === 'portrait' ? 'aspect-[4/5]' : 'aspect-square',
        isDragging && 'z-10 opacity-80 shadow-lg'
      )}
      style={style}
      onClick={onClick}
      {...attributes}
      {...listeners}
    >
      {firstMedia?.media_type === 'video' ? (
        <video
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
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
          className="object-cover"
          sizes="(max-width: 768px) 33vw, 200px"
          alt={post.caption || 'Post image'}
          src={coverUrl}
          fill
        />
      ) : (
        <span className="sr-only">No media</span>
      )}
      {/* Multi-media indicator */}
      {post.media.length > 1 && (
        <div className="absolute top-2 right-2">
          <Copy className="size-4 text-white drop-shadow-md" />
        </div>
      )}
      {/* Status pill */}
      {(post.status === 'draft' || post.status === 'scheduled') && (
        <div className="absolute bottom-1 left-1">
          <PostStatusPill status={post.status} compact />
        </div>
      )}
    </button>
  )
}
