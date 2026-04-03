'use client'

import * as DialogPrimitive from '@radix-ui/react-dialog'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Button } from '@/components/atoms/button'
import { Icon } from '@/components/atoms/icon'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  overlay: cva(
    'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80'
  ),
  title: cva('text-lg leading-none font-semibold tracking-tight'),
  description: cva('text-muted-foreground text-sm'),
  content: cva(
    'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed top-[50%] left-[50%] z-50 flex max-h-[min(90vh,720px)] w-full max-w-lg translate-x-[-50%] translate-y-[-50%] flex-col overflow-hidden border p-0 shadow-lg duration-200 sm:rounded-lg'
  ),
  headerRow: cva('border-border flex shrink-0 items-center gap-3 border-b p-3'),
  headerLeadingWrap: cva('flex shrink-0 items-center'),
  headerTextCol: cva('flex min-w-0 flex-1 flex-col gap-0.5 text-left'),
  headerTitle: cva('text-left text-sm leading-none font-semibold tracking-tight'),
  headerDescription: cva('text-muted-foreground text-left text-xs leading-snug font-normal'),
  headerActions: cva('flex shrink-0 items-center gap-3'),
  closeButton: cva('size-8 shrink-0'),
  srOnly: cva('sr-only'),
  body: cva('flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain', {
    variants: {
      padding: {
        default: 'p-6',
        none: 'p-0'
      }
    },
    defaultVariants: {
      padding: 'default'
    }
  }),
  dialogHeader: cva('flex flex-col space-y-1.5 text-center sm:text-left'),
  dialogFooter: cva('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2')
}

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

// 2. types
type DialogOverlayProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> &
  VariantProps<typeof styles.overlay>
type DialogTitleProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title> &
  VariantProps<typeof styles.title>
type DialogDescriptionProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description> &
  VariantProps<typeof styles.description>
type DialogContentProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> &
  VariantProps<typeof styles.content> & {
    /** Renders the standard header row (title, optional description, leading/trailing, header close). */
    headerTitle?: string
    headerDescription?: React.ReactNode
    headerLeading?: React.ReactNode
    headerTrailing?: React.ReactNode
    headerTitleClassName?: string
    headerClassName?: string
    headerShowCloseButton?: boolean
    /** Disables the header close control (still rendered). */
    headerCloseDisabled?: boolean
    /** Extra classes merged onto the scrollable body (padding comes from `bodyPadding`). */
    bodyClassName?: string
    /** Scrollable body padding; use `none` for full-bleed content (e.g. media previews). */
    bodyPadding?: 'default' | 'none'
  }
type DialogHeaderProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof styles.dialogHeader>
type DialogFooterProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof styles.dialogFooter>

// 3. component
const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  DialogOverlayProps
>((props, ref) => {
  const { className, ...rest } = props
  return (
    <DialogPrimitive.Overlay ref={ref} className={cn(styles.overlay({ className }))} {...rest} />
  )
})
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  DialogTitleProps
>((props, ref) => {
  const { className, ...rest } = props
  return <DialogPrimitive.Title ref={ref} className={cn(styles.title({ className }))} {...rest} />
})
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  DialogDescriptionProps
>((props, ref) => {
  const { className, ...rest } = props
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cn(styles.description({ className }))}
      {...rest}
    />
  )
})
DialogDescription.displayName = DialogPrimitive.Description.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(
  (
    {
      className,
      children,
      headerTitle,
      headerDescription,
      headerLeading,
      headerTrailing,
      headerTitleClassName,
      headerClassName,
      headerShowCloseButton = true,
      headerCloseDisabled = false,
      bodyClassName,
      bodyPadding = 'default',
      ...props
    },
    ref
  ) => {
    const hasHeader = Boolean(headerTitle)

    return (
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content ref={ref} className={cn(styles.content({ className }))} {...props}>
          {hasHeader ? (
            <div className={cn(styles.headerRow({ className: headerClassName }))}>
              {headerLeading ? (
                <div className={styles.headerLeadingWrap()}>{headerLeading}</div>
              ) : null}
              <div className={styles.headerTextCol()}>
                <DialogTitle className={styles.headerTitle({ className: headerTitleClassName })}>
                  {headerTitle}
                </DialogTitle>
                {headerDescription != null && headerDescription !== '' ? (
                  <DialogDescription className={styles.headerDescription()}>
                    {headerDescription}
                  </DialogDescription>
                ) : null}
              </div>
              <div className={styles.headerActions()}>
                {headerTrailing}
                {headerShowCloseButton ? (
                  <DialogClose asChild>
                    <Button
                      type="button"
                      className={styles.closeButton()}
                      disabled={headerCloseDisabled}
                      size="icon"
                      variant="ghost"
                    >
                      <Icon name="x" size="sm" />
                      <span className={styles.srOnly()}>Close</span>
                    </Button>
                  </DialogClose>
                ) : null}
              </div>
            </div>
          ) : null}
          <div className={cn(styles.body({ padding: bodyPadding, className: bodyClassName }))}>
            {children}
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    )
  }
)
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader: React.FC<DialogHeaderProps> = (props) => {
  const { className, ...rest } = props
  return <div className={cn(styles.dialogHeader({ className }))} {...rest} />
}
DialogHeader.displayName = 'DialogHeader'

const DialogFooter: React.FC<DialogFooterProps> = (props) => {
  const { className, ...rest } = props
  return <div className={cn(styles.dialogFooter({ className }))} {...rest} />
}
DialogFooter.displayName = 'DialogFooter'

// 4. exports
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger
}
