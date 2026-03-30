import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva(
    'bg-surface-container-low file:text-foreground placeholder:text-muted-foreground focus:bg-surface-container-highest flex h-10 w-full rounded-xl px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
  )
}

// 2. types
type InputProps = React.ComponentProps<'input'> & VariantProps<typeof styles.root>

// 3. component
const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  // a. props
  const { className, type, ...rest } = props

  // b. hooks

  // c. logic

  // d. component
  return <input ref={ref} type={type} className={cn(styles.root({ className }))} {...rest} />
})
Input.displayName = 'Input'

// 4. exports
export type { InputProps }
export { Input }
