import Link from 'next/link'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Button } from '@/components/atoms/button'
import { Icon } from '@/components/atoms/icon'
import { signInRoute } from '@/constants/routes'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva('py-6 text-center'),
  iconRing: cva('bg-destructive/10 mx-auto flex size-16 items-center justify-center rounded-full'),
  iconGlyph: cva('text-destructive size-8'),
  title: cva('mt-6 text-2xl font-bold'),
  description: cva('text-muted-foreground mt-2'),
  actions: cva('mt-8 flex flex-col gap-2')
}

// 2. types
type AuthErrorPageProps = {
  className?: string
} & VariantProps<typeof styles.root>

// 3. component
const AuthErrorPage: React.FC<AuthErrorPageProps> = (props) => {
  // a. props
  const { className } = props

  // b. hooks

  // c. logic

  // d. component
  return (
    <div className={cn(styles.root({ className }))}>
      <div className={styles.iconRing()}>
        <Icon name="alertCircle" className={styles.iconGlyph()} size="lg" />
      </div>
      <h1 className={styles.title()}>Authentication Error</h1>
      <p className={styles.description()}>
        Something went wrong during authentication. Please try again.
      </p>
      <div className={styles.actions()}>
        <Button asChild>
          <Link href={signInRoute}>Try Again</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </div>
  )
}

// 4. exports
export default AuthErrorPage
