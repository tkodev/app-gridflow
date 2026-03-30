import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva(
    'bg-surface-container-low placeholder:text-muted-foreground focus:bg-surface-container-highest flex min-h-[80px] w-full rounded-xl px-3 py-2 text-sm transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
  )
}

// 2. types
type TextareaProps = React.ComponentProps<'textarea'> & VariantProps<typeof styles.root>

// 3. component
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>((props, ref) => {
  // a. props
  const { className, ...rest } = props

  // b. hooks

  // c. logic

  // d. component
  return <textarea ref={ref} className={cn(styles.root({ className }))} {...rest} />
})
Textarea.displayName = 'Textarea'

// 4. exports
export type { TextareaProps }
export { Textarea }
