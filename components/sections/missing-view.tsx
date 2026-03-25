'use client'

import type { LucideIcon } from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Button } from '@/components/atoms/button'
import { Icon } from '@/components/atoms/icon'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva('flex flex-col items-center justify-center py-20 text-center'),
  iconRing: cva('flex size-16 items-center justify-center rounded-full border-2 border-dashed'),
  title: cva('mt-4 text-xl font-semibold'),
  description: cva('text-muted-foreground mt-2 max-w-sm text-sm'),
  cta: cva('mt-6'),
  ctaIcon: cva('mr-1.5')
}

// 2. types
type MissingViewProps = React.ComponentProps<'div'> &
  VariantProps<typeof styles.root> & {
    title: string
    description: string
    icon: LucideIcon
    ctaLabel: string
    ctaIcon?: LucideIcon
  } & ({ href: string; onClick?: never } | { onClick: () => void; href?: never })

// 3. component
const MissingView: React.FC<MissingViewProps> = (props) => {
  // a. props
  const {
    title,
    description,
    icon,
    ctaLabel,
    ctaIcon: ctaIconProp,
    className,
    href,
    onClick,
    ...rest
  } = props

  const ctaIcon = ctaIconProp ?? icon

  // d. component
  return (
    <div className={cn(styles.root({ className }))} {...rest}>
      <div className={styles.iconRing()}>
        <Icon icon={icon} size="lg" tone="muted" />
      </div>
      <h2 className={styles.title()}>{title}</h2>
      <p className={styles.description()}>{description}</p>
      {href != null ? (
        <Button className={styles.cta()} asChild>
          <Link href={href}>
            <Icon className={styles.ctaIcon()} icon={ctaIcon} size="sm" />
            {ctaLabel}
          </Link>
        </Button>
      ) : (
        <Button className={styles.cta()} onClick={onClick}>
          <Icon className={styles.ctaIcon()} icon={ctaIcon} size="sm" />
          {ctaLabel}
        </Button>
      )}
    </div>
  )
}

// 4. exports
export type { MissingViewProps }
export { MissingView }
