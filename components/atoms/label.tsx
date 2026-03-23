'use client'

import * as LabelPrimitive from '@radix-ui/react-label'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva(
    'text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
  )
}

// 2. types
type LabelProps = React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
  VariantProps<typeof styles.root>

// 3. component
const Label = React.forwardRef<React.ElementRef<typeof LabelPrimitive.Root>, LabelProps>(
  (props, ref) => {
    // a. props
    const { className, ...rest } = props

    // b. hooks

    // c. logic

    // d. component
    return <LabelPrimitive.Root ref={ref} className={cn(styles.root({ className }))} {...rest} />
  }
)
Label.displayName = LabelPrimitive.Root.displayName

// 4. exports
export { Label }
