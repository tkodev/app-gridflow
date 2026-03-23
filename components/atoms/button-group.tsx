import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import { Separator } from '@/components/atoms/separator'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  group: cva(
    'flex w-fit items-stretch *:focus-visible:relative *:focus-visible:z-10 has-[>[data-slot=button-group]]:gap-2 has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-lg [&>[data-slot=select-trigger]:not([class*="w-"])]:w-fit [&>input]:flex-1',
    {
      variants: {
        orientation: {
          horizontal:
            '[&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0 [&>*:not(:last-child)]:rounded-r-none [&>[data-slot]:not(:has(~[data-slot]))]:rounded-r-lg!',
          vertical:
            'flex-col [&>*:not(:first-child)]:rounded-t-none [&>*:not(:first-child)]:border-t-0 [&>*:not(:last-child)]:rounded-b-none [&>[data-slot]:not(:has(~[data-slot]))]:rounded-b-lg!'
        }
      },
      defaultVariants: {
        orientation: 'horizontal'
      }
    }
  ),
  text: cva(
    'bg-muted flex items-center gap-2 rounded-lg border px-2.5 text-sm font-medium [&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-4'
  ),
  separator: cva(
    'bg-input relative self-stretch data-[orientation=horizontal]:mx-px data-[orientation=horizontal]:w-auto data-[orientation=vertical]:my-px data-[orientation=vertical]:h-auto'
  )
}

const buttonGroupVariants = styles.group

// 2. types
type ButtonGroupProps = React.ComponentProps<'div'> & VariantProps<typeof styles.group>

type ButtonGroupTextProps = React.ComponentProps<'div'> & {
  asChild?: boolean
}

type ButtonGroupSeparatorProps = React.ComponentProps<typeof Separator>

// 3. component
const ButtonGroup: React.FC<ButtonGroupProps> = (props) => {
  const { className, orientation, ...rest } = props
  return (
    <div
      className={cn(styles.group({ orientation, className }))}
      data-orientation={orientation}
      data-slot="button-group"
      role="group"
      {...rest}
    />
  )
}

const ButtonGroupText: React.FC<ButtonGroupTextProps> = (props) => {
  const { asChild = false, className, ...rest } = props
  const Comp = asChild ? Slot.Root : 'div'
  return <Comp className={cn(styles.text({ className }))} {...rest} />
}

const ButtonGroupSeparator: React.FC<ButtonGroupSeparatorProps> = (props) => {
  const { className, orientation = 'vertical', ...rest } = props
  return (
    <Separator
      className={cn(styles.separator({ className }))}
      data-slot="button-group-separator"
      orientation={orientation}
      {...rest}
    />
  )
}

// 4. exports
export { ButtonGroup, ButtonGroupSeparator, ButtonGroupText, buttonGroupVariants }
