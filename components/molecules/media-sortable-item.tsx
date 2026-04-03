'use client'

import Image from 'next/image'
import * as React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { cva } from 'class-variance-authority'
import type { LocalMediaItem } from '@/types/post'
import { Icon } from '@/components/atoms/icon'
import { sortableItemStyle } from '@/utils/dnd-kit'
import { isLocalImageUrlUnoptimized } from '@/utils/local-media'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva('bg-muted relative col-span-4 aspect-square overflow-hidden rounded-lg select-none', {
    variants: {
      dragging: {
        true: 'z-10 opacity-80 shadow-lg',
        false: ''
      },
      disabled: {
        true: 'cursor-not-allowed',
        false: 'cursor-grab active:cursor-grabbing'
      }
    },
    defaultVariants: {
      dragging: false,
      disabled: false
    }
  }),
  videoWrap: cva('pointer-events-none relative size-full'),
  video: cva('size-full object-cover'),
  videoOverlay: cva(
    'pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20'
  ),
  coverImage: cva('pointer-events-none object-cover'),
  removeBtn: cva(
    'hover:bg-destructive pointer-events-auto absolute top-1 right-1 rounded bg-black/50 p-1 text-white disabled:cursor-not-allowed disabled:opacity-40'
  ),
  typeBadge: cva(
    'pointer-events-none absolute bottom-1 left-1 rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-medium text-white'
  )
}

// 2. types
type MediaSortableItemProps = {
  item: LocalMediaItem
  onRemove: () => void
  disabled?: boolean
  className?: string
}

// 3. component
const MediaSortableItem: React.FC<MediaSortableItemProps> = (props) => {
  // a. props
  const { item, onRemove, disabled = false, className } = props

  // b. hooks
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: dragging
  } = useSortable({
    id: item.id,
    disabled
  })

  // c. logic
  const style = sortableItemStyle(transform, transition)

  // d. component
  return (
    <div
      ref={setNodeRef}
      className={cn(
        styles.root({
          dragging,
          disabled
        }),
        className
      )}
      style={style}
      {...attributes}
      {...(disabled ? {} : listeners)}
    >
      {item.type === 'video' ? (
        <div className={styles.videoWrap()}>
          <video className={styles.video()} src={item.url} muted />
          <div className={styles.videoOverlay()}>
            <Icon name="play" size="lg" tone="inverse" />
          </div>
        </div>
      ) : (
        <Image
          className={styles.coverImage()}
          sizes="(max-width: 768px) 28vw, 180px"
          unoptimized={isLocalImageUrlUnoptimized(item.url)}
          alt=""
          src={item.url}
          fill
        />
      )}

      <button
        type="button"
        className={styles.removeBtn()}
        disabled={disabled}
        onClick={onRemove}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <Icon name="x" size="sm" />
      </button>

      {item.type === 'video' && <span className={styles.typeBadge()}>VIDEO</span>}
    </div>
  )
}

// 4. exports
export type { MediaSortableItemProps }
export { MediaSortableItem }
