'use client'

import { ImageIcon } from 'lucide-react'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import type { Collection, CollectionMedia } from '@/types/collection'
import { Icon } from '@/components/atoms/icon'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva(
    'group/collection-card flex w-44 shrink-0 cursor-pointer flex-col gap-2 transition-opacity hover:opacity-90'
  ),
  imageWrap: cva(
    'bg-surface-container-low relative aspect-square w-full overflow-hidden rounded-xl shadow-[0_2px_16px_-2px_hsl(var(--foreground)/0.04)]'
  ),
  image: cva('size-full object-cover'),
  placeholder: cva('flex size-full items-center justify-center'),
  badge: cva(
    'bg-surface-container-lowest/85 absolute right-2 bottom-2 rounded-full px-2 py-0.5 text-xs font-medium backdrop-blur-sm'
  ),
  title: cva('truncate text-sm font-medium'),
  description: cva('text-muted-foreground truncate text-xs')
}

// 2. types
type CollectionCardProps = {
  collection: Collection
  media?: CollectionMedia[]
  mediaCount?: number
  className?: string
  onClick?: () => void
} & VariantProps<typeof styles.root>

// 3. component
const CollectionCard: React.FC<CollectionCardProps> = (props) => {
  // a. props
  const { collection, media = [], mediaCount = 0, className, onClick } = props

  // c. logic
  const coverUrl = collection.cover_url ?? media[0]?.media_url

  // d. component
  return (
    <div className={cn(styles.root({ className }))} onClick={onClick} role="button" tabIndex={0}>
      <div className={styles.imageWrap()}>
        {coverUrl ? (
          <img src={coverUrl} alt={collection.name} className={styles.image()} />
        ) : (
          <div className={styles.placeholder()}>
            <Icon icon={ImageIcon} size="lg" tone="muted" />
          </div>
        )}
        <span className={styles.badge()}>{mediaCount} Items</span>
      </div>
      <div>
        <p className={styles.title()}>{collection.name}</p>
        {collection.description ? (
          <p className={styles.description()}>{collection.description}</p>
        ) : null}
      </div>
    </div>
  )
}

// 4. exports
export type { CollectionCardProps }
export { CollectionCard }
