import Link from 'next/link'
import { UserPlus } from 'lucide-react'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Button } from '@/components/atoms/button'
import { Icon } from '@/components/atoms/icon'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva('flex flex-col items-center justify-center py-20 text-center'),
  iconRing: cva('flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed'),
  title: cva('mt-4 text-xl font-semibold'),
  description: cva('text-muted-foreground mt-2 max-w-sm text-sm'),
  cta: cva('mt-6')
}

// 2. types
type ProfileMissingViewProps = React.ComponentProps<'div'> & VariantProps<typeof styles.root>

// 3. component
const ProfileMissingView: React.FC<ProfileMissingViewProps> = (props) => {
  // a. props
  const { className, ...rest } = props

  // b. hooks

  // c. logic

  // d. component
  return (
    <div className={cn(styles.root({ className }))} {...rest}>
      <div className={styles.iconRing()}>
        <Icon icon={UserPlus} size="lg" tone="muted" />
      </div>
      <h2 className={styles.title()}>No Profiles Yet</h2>
      <p className={styles.description()}>
        Create your first profile to start planning your Instagram grid. You can add multiple
        profiles for different accounts.
      </p>
      <Button className={styles.cta()} asChild>
        <Link href="/settings">
          <Icon icon={UserPlus} size="sm" slot="buttonLeading" />
          Create Your First Profile
        </Link>
      </Button>
    </div>
  )
}

// 4. exports
export { ProfileMissingView }
