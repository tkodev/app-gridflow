import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva('')
}

// 2. types
type ExampleProps = React.ComponentProps<'div'> &
  VariantProps<typeof styles.root> & {
    children: React.ReactNode
    /** Tailwind / utility classes merged onto the root via `cva`. */
    className?: string
  }

// 3. component
const Example = React.forwardRef<HTMLDivElement, ExampleProps>((props, ref) => {
  // a. props
  const { className, ...rest } = props

  // b. hooks

  // c. logic

  // d. component
  return <div ref={ref} className={cn(styles.root({ className }))} {...rest} />
})
Example.displayName = 'Example'

// 4. exports
export type { ExampleProps }
export { Example }
