'use client'

import * as React from 'react'
import * as SeparatorPrimitive from '@radix-ui/react-separator'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva(
    'bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px data-[orientation=vertical]:self-stretch'
  )
}

// 2. types
type SeparatorProps = React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> &
  VariantProps<typeof styles.root>

// 3. component
const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  SeparatorProps
>((props, ref) => {
  const { className, decorative = true, orientation = 'horizontal', ...rest } = props
  return (
    <SeparatorPrimitive.Root
      ref={ref}
      className={cn(styles.root({ className }))}
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      {...rest}
    />
  )
})
Separator.displayName = SeparatorPrimitive.Root.displayName

// 4. exports
export type { SeparatorProps }
export { Separator }
