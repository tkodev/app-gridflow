'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import type { User } from '@supabase/supabase-js'
import { Button } from '@/components/atoms/button'
import { Container } from '@/components/atoms/container'
import { Icon, type IconName } from '@/components/atoms/icon'
import { planRoute, rootRoute, signInRoute } from '@/constants/routes'
import { useSignOutMutation } from '@/queries/auth'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva(
    'bg-background/85 fixed top-0 right-0 left-0 z-50 mx-4 mt-3 rounded-2xl shadow-[0_2px_16px_-2px_hsl(var(--foreground)/0.04)] backdrop-blur-xl'
  ),
  inner: cva('flex h-12 items-center justify-between px-4'),
  leading: cva('flex items-center gap-2'),
  title: cva('text-base font-semibold'),
  actions: cva('flex items-center gap-2'),
  srOnly: cva('sr-only')
}

// 2. types
type AppHeaderProps = React.ComponentProps<'header'> &
  VariantProps<typeof styles.root> & {
    user?: User | null
    title?: string
    leadingIcon?: IconName
    trailingAction?: React.ReactNode
  }

// 3. component
const AppHeader: React.FC<AppHeaderProps> = (props) => {
  // a. props
  const { user, title, leadingIcon = 'grid3x3', trailingAction, className, ...rest } = props

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
      <Container className={styles.inner()} size="full">
        <div className={styles.leading()}>
          <Link href={isAuthed ? planRoute : rootRoute}>
            <Icon name={leadingIcon} size="md" />
          </Link>
          {title && <span className={styles.title()}>{title}</span>}
        </div>

        <div className={styles.actions()}>
          {trailingAction}
          {isAuthed ? (
            <Button
              disabled={signOut.isPending}
              size="icon"
              variant="ghost"
              onClick={handleSignOut}
            >
              <Icon name="logOut" size="sm" />
              <span className={styles.srOnly()}>Sign out</span>
            </Button>
          ) : (
            <Button variant="ghost" asChild>
              <Link href={signInRoute}>
                <Icon name="logIn" size="sm" />
                Sign in
              </Link>
            </Button>
          )}
        </div>
      </Container>
    </header>
  )
}

// 4. exports
export type { AppHeaderProps }
export { AppHeader }
