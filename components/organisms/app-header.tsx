'use client'

import type { User } from '@supabase/supabase-js'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Grid3X3, LogIn, LogOut, Moon, Settings, Sun, UserPlus, Users } from 'lucide-react'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Button } from '@/components/atoms/button'
import { Icon } from '@/components/atoms/icon'
import { useSignOutMutation } from '@/queries/auth'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva('bg-background/80 sticky top-0 z-50 border-b backdrop-blur-sm'),
  inner: cva('mx-auto flex h-14 max-w-lg items-center justify-between px-4'),
  brand: cva('flex items-center gap-2'),
  brandText: cva('font-bold'),
  srOnly: cva('sr-only'),
  actions: cva('flex items-center gap-1')
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
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const signOut = useSignOutMutation()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // c. logic
  const isAuthed = Boolean(user)

  const handleSignOut = () => {
    signOut.mutate(undefined, {
      onSuccess: () => {
        router.push('/')
        router.refresh()
      }
    })
  }

  // d. component
  return (
    <header className={cn(styles.root({ className }))} {...rest}>
      <div className={styles.inner()}>
        <Link className={styles.brand()} href={isAuthed ? '/profiles' : '/'}>
          <Icon icon={Grid3X3} size="md" />
          <span className={styles.brandText()}>GridFlow</span>
        </Link>

        <div className={styles.actions()}>
          <Button
            aria-label="Toggle theme"
            size="icon"
            variant="ghost"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          >
            {mounted ? (
              resolvedTheme === 'dark' ? (
                <Icon icon={Moon} size="sm" />
              ) : (
                <Icon icon={Sun} size="sm" />
              )
            ) : (
              <Icon icon={Sun} size="sm" />
            )}
          </Button>
          {isAuthed ? (
            <>
              <Button size="icon" variant="ghost" asChild>
                <Link href="/profiles">
                  <Icon icon={Users} size="sm" />
                  <span className={styles.srOnly()}>Profiles</span>
                </Link>
              </Button>
              <Button size="icon" variant="ghost" asChild>
                <Link href="/settings">
                  <Icon icon={Settings} size="sm" />
                  <span className={styles.srOnly()}>Settings</span>
                </Link>
              </Button>
              <Button disabled={signOut.isPending} size="icon" variant="ghost" onClick={handleSignOut}>
                <Icon icon={LogOut} size="sm" />
                <span className={styles.srOnly()}>Sign out</span>
              </Button>
            </>
          ) : (
            <>
              <Button size="icon" variant="ghost" asChild>
                <Link href="/auth/login">
                  <Icon icon={LogIn} size="sm" />
                  <span className={styles.srOnly()}>Log in</span>
                </Link>
              </Button>
              <Button size="icon" variant="ghost" asChild>
                <Link href="/auth/sign-up">
                  <Icon icon={UserPlus} size="sm" />
                  <span className={styles.srOnly()}>Sign up</span>
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

// 4. exports
export { AppHeader }
