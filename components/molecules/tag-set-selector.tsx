'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import type { TagSet } from '@/types/tag-set'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva('space-y-2'),
  scrollRow: cva('-mx-1 flex gap-2 overflow-x-auto px-1 pb-1'),
  chip: cva(
    'shrink-0 cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors select-none',
    {
      variants: {
        selected: {
          true: 'bg-primary text-primary-foreground',
          false: 'bg-surface-container-low text-foreground hover:bg-surface-container-highest'
        }
      },
      defaultVariants: {
        selected: false
      }
    }
  ),
  manage: cva('text-muted-foreground shrink-0 text-xs font-medium tracking-wide uppercase')
}

// 2. types
type TagSetSelectorProps = {
  tagSets: TagSet[]
  selectedIds: string[]
  onToggle: (tagSetId: string) => void
  onManage?: () => void
  disabled?: boolean
  className?: string
} & VariantProps<typeof styles.root>

// 3. component
const TagSetSelector: React.FC<TagSetSelectorProps> = (props) => {
  // a. props
  const { tagSets, selectedIds, onToggle, onManage, disabled, className } = props

  // d. component
  if (tagSets.length === 0 && !onManage) return null

  return (
    <div className={cn(styles.root({ className }))}>
      <div className={styles.scrollRow()}>
        {tagSets.map((ts) => (
          <button
            key={ts.id}
            type="button"
            className={styles.chip({ selected: selectedIds.includes(ts.id) })}
            disabled={disabled}
            onClick={() => onToggle(ts.id)}
          >
            {ts.name}
          </button>
        ))}
        {onManage ? (
          <button type="button" className={styles.manage()} disabled={disabled} onClick={onManage}>
            Manage &gt;
          </button>
        ) : null}
      </div>
    </div>
  )
}

// 4. exports
export type { TagSetSelectorProps }
export { TagSetSelector }
