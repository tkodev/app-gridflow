'use client'

import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import * as React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/tailwind'

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80',
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-lg leading-none font-semibold tracking-tight', className)}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-muted-foreground text-sm', className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
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
    /** Classes for the scrollable body (default includes padding). Use e.g. `p-0` for full-bleed content. */
    bodyClassName?: string
  }
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
      ...props
    },
    ref
  ) => {
    const hasHeader = Boolean(headerTitle)

    return (
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          ref={ref}
          className={cn(
            'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed top-[50%] left-[50%] z-50 flex w-full max-w-lg translate-x-[-50%] translate-y-[-50%] flex-col overflow-hidden border p-0 shadow-lg duration-200 sm:rounded-lg',
            'max-h-[min(90vh,720px)]',
            className
          )}
          {...props}
        >
          {hasHeader ? (
            <div
              className={cn(
                'border-border flex shrink-0 items-center gap-3 border-b p-3',
                headerClassName
              )}
            >
              {headerLeading ? (
                <div className="flex shrink-0 items-center">{headerLeading}</div>
              ) : null}
              <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
                <DialogTitle
                  className={cn(
                    'text-left text-sm leading-none font-semibold tracking-tight',
                    headerTitleClassName
                  )}
                >
                  {headerTitle}
                </DialogTitle>
                {headerDescription != null && headerDescription !== '' ? (
                  <DialogDescription className="text-muted-foreground text-left text-xs leading-snug font-normal">
                    {headerDescription}
                  </DialogDescription>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {headerTrailing}
                {headerShowCloseButton ? (
                  <DialogClose asChild>
                    <Button
                      type="button"
                      className="h-8 w-8 shrink-0"
                      disabled={headerCloseDisabled}
                      size="icon"
                      variant="ghost"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Close</span>
                    </Button>
                  </DialogClose>
                ) : null}
              </div>
            </div>
          ) : null}
          <div
            className={cn(
              'flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain p-6',
              bodyClassName
            )}
          >
            {children}
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    )
  }
)
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />
)
DialogHeader.displayName = 'DialogHeader'

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
    {...props}
  />
)
DialogFooter.displayName = 'DialogFooter'

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
