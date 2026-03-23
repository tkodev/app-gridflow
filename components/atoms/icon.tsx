'use client'

import type { LucideIcon } from 'lucide-react'
import { AlertCircle, ArrowRight, Eye, Grid3X3, Mail, MoveVertical } from 'lucide-react'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/tailwind'

/** Icons addressable by `name` (serializable from Server Components). Use camelCase keys; add entries as needed. */
const ICONS = {
  alertCircle: AlertCircle,
  arrowRight: ArrowRight,
  eye: Eye,
  grid3x3: Grid3X3,
  mail: Mail,
  moveVertical: MoveVertical
} as const satisfies Record<string, LucideIcon>
type IconName = keyof typeof ICONS

// 1. styles & constants
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
      slot: {
        default: '',
        buttonLeading: 'mr-1.5'
      },
      tone: {
        default: '',
        muted: 'text-muted-foreground',
        destructive: 'text-destructive',
        inverse: 'text-white',
        inverseElevated: 'text-white drop-shadow-md',
        chevron: 'shrink-0 opacity-50',
        menuItemLeading: 'mr-2',
        submenuTrailing: 'ml-auto',
        radioIndicator: 'fill-current'
      }
    },
    defaultVariants: {
      size: 'sm',
      slot: 'default',
      tone: 'default'
    }
  })
}

// 2. types
type IconSharedProps = {
  size?: VariantProps<typeof styles.root>['size']
  slot?: VariantProps<typeof styles.root>['slot']
  tone?: VariantProps<typeof styles.root>['tone']
} & Omit<React.ComponentPropsWithoutRef<LucideIcon>, 'size'>

type IconProps =
  | (IconSharedProps & { name: IconName; icon?: undefined })
  | (IconSharedProps & { icon: LucideIcon; name?: undefined })

// 3. component
const Icon = React.forwardRef<SVGSVGElement, IconProps>(function Icon(props, ref) {
  const {
    icon,
    name,
    size = 'sm',
    slot = 'default',
    tone = 'default',
    className,
    'aria-hidden': ariaHidden,
    ...rest
  } = props

  const IconComponent = name != null ? ICONS[name] : icon

  return (
    <IconComponent
      ref={ref}
      className={cn(styles.root({ size, slot, tone }), className)}
      aria-hidden={ariaHidden ?? true}
      {...rest}
    />
  )
})
Icon.displayName = 'Icon'

// 4. exports
export { Icon }
export type { IconName, IconProps }
