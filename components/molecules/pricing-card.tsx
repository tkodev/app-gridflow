'use client'

import Link from 'next/link'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Button } from '@/components/atoms/button'
import { Icon } from '@/components/atoms/icon'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva(
    'bg-card relative flex flex-col rounded-2xl p-6 shadow-[0_2px_16px_-2px_hsl(var(--foreground)/0.04)]',
    {
      variants: {
        highlighted: {
          true: 'ring-primary ring-2',
          false: ''
        }
      },
      defaultVariants: {
        highlighted: false
      }
    }
  ),
  badge: cva(
    'bg-primary text-primary-foreground absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-xs font-semibold uppercase'
  ),
  planName: cva('text-sm font-medium'),
  priceRow: cva('mt-2 flex items-end gap-1'),
  price: cva('text-4xl font-bold'),
  period: cva('text-muted-foreground mb-1 text-sm'),
  featureList: cva('mt-6 flex flex-1 flex-col gap-2'),
  featureItem: cva('flex items-center gap-2 text-sm'),
  checkIcon: cva('text-primary shrink-0'),
  cta: cva('mt-6 w-full')
}

// 2. types
type PricingCardProps = {
  planName: string
  price: string
  period: string
  features: readonly string[]
  ctaLabel: string
  ctaHref: string
  highlighted?: boolean
  popular?: boolean
  className?: string
} & VariantProps<typeof styles.root>

// 3. component
const PricingCard: React.FC<PricingCardProps> = (props) => {
  // a. props
  const {
    planName,
    price,
    period,
    features,
    ctaLabel,
    ctaHref,
    highlighted = false,
    popular = false,
    className
  } = props

  // d. component
  return (
    <div className={cn(styles.root({ highlighted, className }))}>
      {popular ? <span className={styles.badge()}>Popular</span> : null}
      <p className={styles.planName()}>{planName}</p>
      <div className={styles.priceRow()}>
        <span className={styles.price()}>{price}</span>
        <span className={styles.period()}>/{period}</span>
      </div>
      <ul className={styles.featureList()}>
        {features.map((feature) => (
          <li key={feature} className={styles.featureItem()}>
            <Icon name="check" className={styles.checkIcon()} size="sm" />
            {feature}
          </li>
        ))}
      </ul>
      <Button className={styles.cta()} variant={highlighted ? 'default' : 'outline'} asChild>
        <Link href={ctaHref}>{ctaLabel}</Link>
      </Button>
    </div>
  )
}

// 4. exports
export type { PricingCardProps }
export { PricingCard }
