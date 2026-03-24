'use client'

import type { LucideIcon } from 'lucide-react'
import { AlertCircle, ArrowRight, Eye, Grid3X3, Mail, MoveVertical } from 'lucide-react'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const icons = {
  alertCircle: AlertCircle,
  arrowRight: ArrowRight,
  eye: Eye,
  grid3x3: Grid3X3,
  mail: Mail,
  moveVertical: MoveVertical
} as const satisfies Record<string, LucideIcon>

const styles = {
  root: cva('shrink-0', {
    variants: {
      size: {
        xs: 'size-2',
        sm: 'size-4',
        md: 'size-6',
        lg: 'size-8',
        xl: 'size-12'
      },
      tone: {
        default: '',
        muted: 'text-muted-foreground',
        destructive: 'text-destructive',
        inverse: 'text-white',
        inverseElevated: 'text-white drop-shadow-md'
      }
    },
    defaultVariants: {
      size: 'sm',
      tone: 'default'
    }
  })
}

// 2. types
export type IconName = keyof typeof icons
type IconSharedProps = {
  size?: VariantProps<typeof styles.root>['size']
  tone?: VariantProps<typeof styles.root>['tone']
} & Omit<React.ComponentPropsWithoutRef<LucideIcon>, 'size'>
export type IconProps =
  | (IconSharedProps & { name: IconName; icon?: undefined })
  | (IconSharedProps & { icon: LucideIcon; name?: undefined })

// 3. component
export const Icon = React.forwardRef<SVGSVGElement, IconProps>(function Icon(props, ref) {
  const {
    icon,
    name,
    size = 'sm',
    tone = 'default',
    className,
    'aria-hidden': ariaHidden,
    ...rest
  } = props

  const IconComponent = name != null ? icons[name] : icon

  return (
    <IconComponent
      ref={ref}
      className={cn(styles.root({ size, tone }), className)}
      aria-hidden={ariaHidden ?? true}
      {...rest}
    />
  )
})
Icon.displayName = 'Icon'
