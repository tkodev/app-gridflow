'use client'

import type { User } from '@supabase/supabase-js'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Grid3X3, LogOut, Moon, Settings, Sun, Users } from 'lucide-react'
import * as React from 'react'
import { Button } from '@/components/ui/button'
import { useSignOutMutation } from '@/queries/auth'

export const AppHeader = ({ user: _user }: { user: User }) => {
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const signOut = useSignOutMutation()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleSignOut = () => {
    signOut.mutate(undefined, {
      onSuccess: () => {
        router.push('/')
        router.refresh()
      }
    })
  }

  return (
    <header className="bg-background/80 sticky top-0 z-50 border-b backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
        <Link className="flex items-center gap-2" href="/profiles">
          <Grid3X3 className="h-5 w-5" />
          <span className="font-bold">GridFlow</span>
        </Link>

        <div className="flex items-center gap-1">
          <Button
            aria-label="Toggle theme"
            size="icon"
            variant="ghost"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          >
            {mounted ? (
              resolvedTheme === 'dark' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>
          <Button size="icon" variant="ghost" asChild>
            <Link href="/profiles">
              <Users className="h-4 w-4" />
              <span className="sr-only">Profiles</span>
            </Link>
          </Button>
          <Button size="icon" variant="ghost" asChild>
            <Link href="/settings">
              <Settings className="h-4 w-4" />
              <span className="sr-only">Settings</span>
            </Link>
          </Button>
          <Button disabled={signOut.isPending} size="icon" variant="ghost" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Sign out</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
