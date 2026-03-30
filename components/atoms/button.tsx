import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva(
    "group/button focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 inline-flex shrink-0 items-center justify-center rounded-full text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:ring-3 active:scale-[0.96] disabled:pointer-events-none disabled:opacity-50 aria-invalid:ring-3 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    {
      variants: {
        variant: {
          default:
            'bg-gradient-to-br from-primary to-primary-container text-primary-foreground hover:opacity-90',
          outline:
            'border border-outline-variant/15 bg-surface-container-lowest hover:bg-surface-container-low dark:border-outline-variant/15 dark:bg-surface-container-low dark:hover:bg-surface-container-highest',
          secondary:
            'rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground',
          ghost:
            'hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50',
          destructive:
            'bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40',
          link: 'text-foreground underline-offset-4 hover:underline'
        },
        size: {
          md: 'h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
          xs: "h-6 gap-1 px-2 text-xs in-data-[slot=button-group]:rounded-full has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
          sm: "h-7 gap-1 px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-full has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
          lg: 'h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3',
          icon: 'size-8',
          'icon-xs':
            "size-6 in-data-[slot=button-group]:rounded-full [&_svg:not([class*='size-'])]:size-3",
          'icon-sm': 'size-7 in-data-[slot=button-group]:rounded-full',
          'icon-lg': 'size-9'
        }
      },
      defaultVariants: {
        variant: 'default',
        size: 'md'
      }
    }
  )
}

const buttonVariants = styles.root

// 2. types
type ButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof styles.root> & {
    asChild?: boolean
  }

// 3. component
const Button: React.FC<ButtonProps> = (props) => {
  // a. props
  const { className, variant = 'default', size = 'md', asChild = false, ...rest } = props

  // b. hooks

  // c. logic
  const Comp = asChild ? Slot.Root : 'button'

  // d. component
  return (
    <Comp
      className={cn(styles.root({ variant, size, className }))}
      data-size={size}
      data-slot="button"
      data-variant={variant}
      {...rest}
    />
  )
}

// 4. exports
export type { ButtonProps }
export { Button, buttonVariants }
