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
const Example: React.FC<ExampleProps> = (props) => {
  // a. props
  const { className, ...rest } = props

  // b. hooks

  // c. logic

  // d. component
  return <div className={cn(styles.root({ className }))} {...rest} />
}

// 4. exports
export { Example }
export default Example
