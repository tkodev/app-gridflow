'use client'

import { useTheme } from 'next-themes'
import Link from 'next/link'
import { Grid3X3, Moon, Sun } from 'lucide-react'
import * as React from 'react'
import { Button } from '@/components/ui/button'

export const LandingHeader = () => {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="bg-background/80 fixed top-0 z-50 w-full border-b backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link className="flex items-center gap-2" href="/">
          <Grid3X3 className="h-6 w-6" />
          <span className="text-xl font-bold">GridFlow</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            aria-label="Toggle theme"
            size="icon"
            variant="ghost"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          >
            {mounted ? (
              resolvedTheme === 'dark' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/auth/login">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/sign-up">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
