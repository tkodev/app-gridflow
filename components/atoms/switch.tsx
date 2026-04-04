'use client'

import * as React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva(
    'peer focus-visible:ring-ring/50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-surface-container-highest inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
  ),
  thumb: cva(
    'bg-surface-container-lowest pointer-events-none block size-4 rounded-full shadow-sm ring-0 transition-transform data-[state=checked]:translate-x-[18px] data-[state=unchecked]:translate-x-0.5'
  )
}

// 2. types
type SwitchProps = React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> &
  VariantProps<typeof styles.root>

// 3. component
const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitive.Root>, SwitchProps>(
  (props, ref) => {
    const { className, ...rest } = props
    return (
      <SwitchPrimitive.Root ref={ref} className={cn(styles.root({ className }))} {...rest}>
        <SwitchPrimitive.Thumb className={styles.thumb()} />
      </SwitchPrimitive.Root>
    )
  }
)
Switch.displayName = SwitchPrimitive.Root.displayName

// 4. exports
export type { SwitchProps }
export { Switch }
