'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import type { TagSet } from '@/types/tag-set'
import { Icon } from '@/components/atoms/icon'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva(
    'bg-card group/tag-set-card flex cursor-pointer items-center gap-3 rounded-xl p-3 shadow-[0_2px_16px_-2px_hsl(var(--foreground)/0.04)] transition-colors hover:bg-surface-container-low'
  ),
  textCol: cva('flex min-w-0 flex-1 flex-col gap-1'),
  name: cva('truncate text-sm font-medium'),
  subtitle: cva('text-muted-foreground text-xs'),
  tagRow: cva('flex flex-wrap gap-1'),
  chip: cva(
    'bg-surface-container-low rounded-full px-2 py-0.5 text-xs font-medium'
  ),
  chevron: cva('text-muted-foreground shrink-0')
}

// 2. types
type TagSetCardProps = {
  tagSet: TagSet
  postCount?: number
  className?: string
  onClick?: () => void
} & VariantProps<typeof styles.root>

// 3. component
const TagSetCard: React.FC<TagSetCardProps> = (props) => {
  // a. props
  const { tagSet, postCount = 0, className, onClick } = props

  // c. logic
  const tags = tagSet.tags
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 5)

  // d. component
  return (
    <div className={cn(styles.root({ className }))} onClick={onClick} role="button" tabIndex={0}>
      <div className={styles.textCol()}>
        <p className={styles.name()}>{tagSet.name}</p>
        <p className={styles.subtitle()}>Used in {postCount} posts</p>
        {tags.length > 0 ? (
          <div className={styles.tagRow()}>
            {tags.map((tag) => (
              <span key={tag} className={styles.chip()}>
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <Icon name="chevronRight" size="sm" className={styles.chevron()} />
    </div>
  )
}

// 4. exports
export type { TagSetCardProps }
export { TagSetCard }
