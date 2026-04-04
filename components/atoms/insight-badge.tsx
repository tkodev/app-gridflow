'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva(
    'pointer-events-none absolute right-1.5 bottom-1.5 rounded-full px-2 py-0.5 text-[10px] leading-tight font-semibold shadow-sm',
    {
      variants: {
        tone: {
          pattern: 'bg-amber-400/90 text-amber-950',
          clash: 'bg-pink-400/90 text-pink-950',
          flow: 'bg-emerald-400/90 text-emerald-950',
          info: 'bg-sky-400/90 text-sky-950'
        }
      },
      defaultVariants: {
        tone: 'info'
      }
    }
  )
}

// 2. types
type InsightBadgeProps = React.ComponentProps<'span'> & VariantProps<typeof styles.root>

// 3. component
const InsightBadge: React.FC<InsightBadgeProps> = (props) => {
  // a. props
  const { tone, className, ...rest } = props

  // d. component
  return <span className={cn(styles.root({ tone, className }))} {...rest} />
}

// 4. exports
export type { InsightBadgeProps }
export { InsightBadge }
