import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
/** Responsive max-widths use Tailwind’s default `--breakpoint-*` theme tokens (Bootstrap-style “container”, but aligned to Tailwind screens). */
const styles = {
  root: cva('mx-auto w-full', {
    variants: {
      variant: {
        default: [
          'px-4 sm:px-6 lg:px-8',
          'sm:max-w-[min(100%,var(--breakpoint-sm))]',
          'md:max-w-[min(100%,var(--breakpoint-md))]',
          'lg:max-w-[min(100%,var(--breakpoint-lg))]'
          'xl:max-w-[min(100%,var(--breakpoint-xl))]',
          '2xl:max-w-[min(100%,var(--breakpoint-2xl))]'
        ].join(' '),
        fluid: 'max-w-none px-4 sm:px-6 lg:px-8'
      }
    },
    defaultVariants: {
      variant: 'default'
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
  const { className, variant = 'default', ...rest } = props

  // d. component
  return <div className={cn(styles.root({ variant, className }))} data-slot="container" {...rest} />
}

// 4. exports
export { Container }
