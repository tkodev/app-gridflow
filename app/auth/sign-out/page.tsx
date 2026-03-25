'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Button } from '@/components/atoms/button'
import { Icon } from '@/components/atoms/icon'
import { rootRoute, signInRoute } from '@/constants/routes'
import { useSignOutMutation } from '@/queries/auth'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva('py-6 text-center'),
  iconRing: cva('bg-primary/10 mx-auto flex size-16 items-center justify-center rounded-full'),
  title: cva('mt-6 text-2xl font-bold'),
  description: cva('text-muted-foreground mt-2'),
  errorBanner: cva(
    'border-destructive bg-destructive/10 text-destructive mt-6 rounded-(--radius) border p-3 text-sm'
  ),
  actions: cva('mt-8 flex flex-col gap-2')
}

// 2. types
type SignOutPageProps = {
  className?: string
} & VariantProps<typeof styles.root>

// 3. component
const SignOutPage: React.FC<SignOutPageProps> = (props) => {
  // a. props
  const { className } = props

  // b. hooks
  const router = useRouter()
  const signOut = useSignOutMutation()
  const hasRequestedSignOut = React.useRef(false)

  // c. logic
  const runSignOut = React.useCallback(() => {
    signOut.mutate(undefined, {
      onSuccess: () => {
        router.push(rootRoute)
        router.refresh()
      }
    })
  }, [router, signOut])

  React.useEffect(() => {
    if (hasRequestedSignOut.current) return
    hasRequestedSignOut.current = true
    runSignOut()
  }, [runSignOut])

  // d. component
  return (
    <div className={cn(styles.root({ className }))}>
      <div className={styles.iconRing()}>
        <Icon icon={LogOut} size="lg" />
      </div>
      <h1 className={styles.title()}>Sign out</h1>
      {signOut.isError ? (
        <>
          <p className={styles.description()}>We couldn&apos;t sign you out. Please try again.</p>
          <p className={styles.errorBanner()} role="alert">
            {signOut.error instanceof Error ? signOut.error.message : 'Something went wrong.'}
          </p>
          <div className={styles.actions()}>
            <Button type="button" onClick={() => runSignOut()}>
              Try again
            </Button>
            <Button variant="outline" asChild>
              <Link href={signInRoute}>Back to Sign in</Link>
            </Button>
          </div>
        </>
      ) : (
        <p className={styles.description()}>
          {signOut.isPending || !signOut.isSuccess ? 'Signing you out…' : 'Redirecting…'}
        </p>
      )}
    </div>
  )
}

// 4. exports
export default SignOutPage
