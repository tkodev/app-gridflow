'use client'

import { useTheme } from 'next-themes'
import Link from 'next/link'
import { Grid3X3, Moon, Sun } from 'lucide-react'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Button } from '@/components/atoms/button'
import { Container } from '@/components/atoms/container'
import { Icon } from '@/components/atoms/icon'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva('bg-background/80 fixed top-0 z-50 w-full border-b backdrop-blur-sm'),
  inner: cva('flex h-16 items-center justify-between'),
  brand: cva('flex items-center gap-2'),
  brandText: cva('text-xl font-bold'),
  actions: cva('flex items-center gap-2')
}

// 2. types
type LandingHeaderProps = React.ComponentProps<'header'> & VariantProps<typeof styles.root>

// 3. component
const LandingHeader: React.FC<LandingHeaderProps> = (props) => {
  // a. props
  const { className, ...rest } = props

  // b. hooks
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // c. logic

  // d. component
  return (
    <header className={cn(styles.root({ className }))} {...rest}>
      <Container className={styles.inner()}>
        <Link className={styles.brand()} href="/">
          <Icon icon={Grid3X3} size="lg" />
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
                <Icon icon={Moon} size="md" />
              ) : (
                <Icon icon={Sun} size="md" />
              )
            ) : (
              <Icon icon={Sun} size="md" />
            )}
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/auth/login">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/sign-up">Get Started</Link>
          </Button>
        </div>
      </Container>
    </header>
  )
}

// 4. exports
export { LandingHeader }
