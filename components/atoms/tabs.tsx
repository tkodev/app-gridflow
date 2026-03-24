'use client'

import * as TabsPrimitive from '@radix-ui/react-tabs'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  list: cva(
    'bg-muted text-muted-foreground inline-flex items-center justify-center rounded-(--radius) p-0.5'
  ),
  trigger: cva(
    'ring-offset-background focus-visible:ring-ring data-[state=active]:bg-background data-[state=active]:text-foreground inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm'
  ),
  content: cva(
    'ring-offset-background focus-visible:ring-ring mt-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
  )
}

const Tabs = TabsPrimitive.Root

// 2. types
type TabsListProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> &
  VariantProps<typeof styles.list>
type TabsTriggerProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> &
  VariantProps<typeof styles.trigger>
type TabsContentProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> &
  VariantProps<typeof styles.content>

// 3. component
const TabsList = React.forwardRef<React.ElementRef<typeof TabsPrimitive.List>, TabsListProps>(
  (props, ref) => {
    const { className, ...rest } = props
    return <TabsPrimitive.List ref={ref} className={cn(styles.list({ className }))} {...rest} />
  }
)
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>((props, ref) => {
  const { className, ...rest } = props
  return <TabsPrimitive.Trigger ref={ref} className={cn(styles.trigger({ className }))} {...rest} />
})
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  TabsContentProps
>((props, ref) => {
  const { className, ...rest } = props
  return <TabsPrimitive.Content ref={ref} className={cn(styles.content({ className }))} {...rest} />
})
TabsContent.displayName = TabsPrimitive.Content.displayName

// 4. exports
export type { TabsContentProps, TabsListProps, TabsTriggerProps }
export { Tabs, TabsContent, TabsList, TabsTrigger }
