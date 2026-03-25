import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva(
    'group/card bg-card text-card-foreground ring-foreground/10 flex flex-col overflow-hidden rounded-xl text-sm ring-1 has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl',
    {
      variants: {
        size: {
          default: 'gap-4 py-4',
          sm: 'gap-3 py-3 has-data-[slot=card-footer]:pb-0'
        }
      },
      defaultVariants: {
        size: 'default'
      }
    }
  ),
  header: cva(
    'group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-4 group-data-[size=sm]/card:px-3 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3'
  ),
  title: cva('text-base leading-snug font-medium group-data-[size=sm]/card:text-sm'),
  description: cva('text-muted-foreground text-sm'),
  action: cva('col-start-2 row-span-2 row-start-1 self-start justify-self-end'),
  content: cva('px-4 group-data-[size=sm]/card:px-3'),
  footer: cva(
    'bg-muted/50 flex items-center rounded-b-xl border-t p-4 group-data-[size=sm]/card:p-3'
  )
}

// 2. types
type CardProps = Omit<React.ComponentProps<'div'>, 'size'> & VariantProps<typeof styles.root>

type CardHeaderProps = React.ComponentProps<'div'>
type CardTitleProps = React.ComponentProps<'div'>
type CardDescriptionProps = React.ComponentProps<'div'>
type CardActionProps = React.ComponentProps<'div'>
type CardContentProps = React.ComponentProps<'div'>
type CardFooterProps = React.ComponentProps<'div'>

// 3. component
const Card: React.FC<CardProps> = (props) => {
  // a. props
  const { className, size = 'default', ...rest } = props

  // d. component
  return (
    <div
      className={cn(styles.root({ size, className }))}
      data-size={size}
      data-slot="card"
      {...rest}
    />
  )
}

const CardHeader: React.FC<CardHeaderProps> = (props) => {
  // a. props
  const { className, ...rest } = props

  // d. component
  return <div className={cn(styles.header({ className }))} data-slot="card-header" {...rest} />
}

const CardTitle: React.FC<CardTitleProps> = (props) => {
  // a. props
  const { className, ...rest } = props

  // d. component
  return <div className={cn(styles.title({ className }))} data-slot="card-title" {...rest} />
}

const CardDescription: React.FC<CardDescriptionProps> = (props) => {
  // a. props
  const { className, ...rest } = props

  // d. component
  return (
    <div className={cn(styles.description({ className }))} data-slot="card-description" {...rest} />
  )
}

const CardAction: React.FC<CardActionProps> = (props) => {
  // a. props
  const { className, ...rest } = props

  // d. component
  return <div className={cn(styles.action({ className }))} data-slot="card-action" {...rest} />
}

const CardContent: React.FC<CardContentProps> = (props) => {
  // a. props
  const { className, ...rest } = props

  // d. component
  return <div className={cn(styles.content({ className }))} data-slot="card-content" {...rest} />
}

const CardFooter: React.FC<CardFooterProps> = (props) => {
  // a. props
  const { className, ...rest } = props

  // d. component
  return <div className={cn(styles.footer({ className }))} data-slot="card-footer" {...rest} />
}

// 4. exports
export type {
  CardActionProps,
  CardContentProps,
  CardDescriptionProps,
  CardFooterProps,
  CardHeaderProps,
  CardProps,
  CardTitleProps
}
export { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle }
