'use client'

import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva('grid w-full gap-2'),
  item: cva(
    'group/radio-group-item peer border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary relative flex aspect-square size-4 shrink-0 rounded-full border outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3'
  ),
  indicatorWrap: cva('flex size-4 items-center justify-center'),
  indicatorDot: cva(
    'bg-primary-foreground absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full'
  )
}

// 2. types
type RadioGroupProps = React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> &
  VariantProps<typeof styles.root>

type RadioGroupItemProps = React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> &
  VariantProps<typeof styles.item>

// 3. component
const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupProps
>((props, ref) => {
  const { className, ...rest } = props
  return (
    <RadioGroupPrimitive.Root
      ref={ref}
      className={cn(styles.root({ className }))}
      data-slot="radio-group"
      {...rest}
    />
  )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps
>((props, ref) => {
  const { className, ...rest } = props
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(styles.item({ className }))}
      data-slot="radio-group-item"
      {...rest}
    >
      <RadioGroupPrimitive.Indicator
        className={styles.indicatorWrap()}
        data-slot="radio-group-indicator"
      >
        <span className={styles.indicatorDot()} />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

// 4. exports
export { RadioGroup, RadioGroupItem }
