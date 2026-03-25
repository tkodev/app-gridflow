'use client'

import type { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Grid3X3, LogIn, LogOut } from 'lucide-react'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Button } from '@/components/atoms/button'
import { Container } from '@/components/atoms/container'
import { Icon } from '@/components/atoms/icon'
import { planRoute, rootRoute, signInRoute } from '@/constants/routes'
import { useSignOutMutation } from '@/queries/auth'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva('bg-background/80 sticky top-0 z-50 w-full border-b backdrop-blur-sm'),
  inner: cva('flex h-14 items-center justify-between'),
  brand: cva('flex items-center gap-2'),
  brandText: cva('font-bold'),
  actions: cva('flex items-center gap-2')
}

// 2. types
type AppHeaderProps = React.ComponentProps<'header'> &
  VariantProps<typeof styles.root> & {
    user?: User | null
  }

// 3. component
const AppHeader: React.FC<AppHeaderProps> = (props) => {
  // a. props
  const { user, className, ...rest } = props

  // b. hooks
  const router = useRouter()
  const signOut = useSignOutMutation()

  // c. logic
  const isAuthed = Boolean(user)

  const handleSignOut = () => {
    signOut.mutate(undefined, {
      onSuccess: () => {
        router.push(rootRoute)
        router.refresh()
      }
    })
  }

  // d. component
  return (
    <header className={cn(styles.root({ className }))} {...rest}>
      <Container className={styles.inner()}>
        <Link className={styles.brand()} href={isAuthed ? planRoute : rootRoute}>
          <Icon icon={Grid3X3} size="md" />
          <span className={styles.brandText()}>GridFlow</span>
        </Link>

        <div className={styles.actions()}>
          {isAuthed ? (
            <>
              <Button disabled={signOut.isPending} variant="ghost" onClick={handleSignOut}>
                <Icon icon={LogOut} size="sm" />
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href={signInRoute}>
                  <Icon icon={LogIn} size="sm" />
                  Sign in
                </Link>
              </Button>
            </>
          )}
        </div>
      </Container>
    </header>
  )
}

// 4. exports
export type { AppHeaderProps }
export { AppHeader }
