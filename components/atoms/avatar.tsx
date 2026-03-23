'use client'

import * as AvatarPrimitive from '@radix-ui/react-avatar'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva('relative flex size-10 shrink-0 overflow-hidden rounded-full'),
  image: cva('aspect-square size-full object-cover'),
  fallback: cva('bg-muted flex size-full items-center justify-center rounded-full')
}

// 2. types
type AvatarProps = React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> &
  VariantProps<typeof styles.root>
type AvatarImageProps = React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image> &
  VariantProps<typeof styles.image>
type AvatarFallbackProps = React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> &
  VariantProps<typeof styles.fallback>

// 3. component
const Avatar = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Root>, AvatarProps>(
  (props, ref) => {
    const { className, ...rest } = props
    return <AvatarPrimitive.Root ref={ref} className={cn(styles.root({ className }))} {...rest} />
  }
)
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  AvatarImageProps
>((props, ref) => {
  const { className, ...rest } = props
  return <AvatarPrimitive.Image ref={ref} className={cn(styles.image({ className }))} {...rest} />
})
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  AvatarFallbackProps
>((props, ref) => {
  const { className, ...rest } = props
  return (
    <AvatarPrimitive.Fallback ref={ref} className={cn(styles.fallback({ className }))} {...rest} />
  )
})
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

// 4. exports
export { Avatar, AvatarFallback, AvatarImage }
