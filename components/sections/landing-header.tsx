'use client'

import Link from 'next/link'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Button } from '@/components/atoms/button'
import { Container } from '@/components/atoms/container'
import { Icon } from '@/components/atoms/icon'
import { signInRoute } from '@/constants/routes'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva(
    'bg-background/85 fixed top-0 right-0 left-0 z-50 mx-4 mt-3 rounded-2xl shadow-[0_2px_16px_-2px_hsl(var(--foreground)/0.04)] backdrop-blur-xl'
  ),
  inner: cva('flex h-14 items-center justify-between px-4'),
  brand: cva('flex items-center gap-2'),
  brandText: cva('font-serif text-lg font-bold'),
  nav: cva('hidden items-center gap-6 md:flex'),
  navLink: cva('text-muted-foreground hover:text-foreground text-sm font-medium transition-colors'),
  actions: cva('flex items-center gap-2')
}

// 2. types
type LandingHeaderProps = React.ComponentProps<'header'> & VariantProps<typeof styles.root>

// 3. component
const LandingHeader: React.FC<LandingHeaderProps> = (props) => {
  // a. props
  const { className, ...rest } = props

  // d. component
  return (
    <header className={cn(styles.root({ className }))} {...rest}>
      <div className={styles.inner()}>
        <Link className={styles.brand()} href="/">
          <Icon name="grid3x3" size="md" />
          <span className={styles.brandText()}>GridFlow</span>
        </Link>

        <nav className={styles.nav()}>
          <a className={styles.navLink()} href="#features">
            Features
          </a>
          <a className={styles.navLink()} href="#pricing">
            Pricing
          </a>
        </nav>

        <div className={styles.actions()}>
          <Button size="sm" variant="ghost" asChild>
            <Link href={signInRoute}>Sign In</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/auth/sign-up">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

// 4. exports
export type { LandingHeaderProps }
export { LandingHeader }
