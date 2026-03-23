import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
/** Responsive max-widths use Tailwind’s default `--breakpoint-*` theme tokens (Bootstrap-style “container”, but aligned to Tailwind screens). */
const widths = [
  'sm:max-w-[min(100%,var(--breakpoint-sm))]',
  'md:max-w-[min(100%,var(--breakpoint-md))]',
  'lg:max-w-[min(100%,var(--breakpoint-lg))]',
  'xl:max-w-[min(100%,var(--breakpoint-xl))]',
  '2xl:max-w-[min(100%,var(--breakpoint-2xl))]'
]
const styles = {
  root: cva('mx-auto w-full px-4 sm:px-6 lg:px-8', {
    variants: {
      size: {
        sm: widths.slice(0, 1),
        md: widths.slice(0, 2),
        lg: widths.slice(0, 3),
        xl: widths.slice(0, 4),
        '2xl': widths.slice(0, 5),
        full: 'max-w-none'
      }
    },
    defaultVariants: {
      size: 'lg'
    }
  })
}

// 2. types
type ContainerProps = React.ComponentProps<'div'> &
  VariantProps<typeof styles.root> & {
    children?: React.ReactNode
  }

// 3. component
const Container: React.FC<ContainerProps> = (props) => {
  // a. props
  const { className, size = 'lg', ...rest } = props

  // d. component
  return <div className={cn(styles.root({ size, className }))} data-slot="container" {...rest} />
}

// 4. exports
export { Container }
