'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Button } from '@/components/atoms/button'
import { Icon } from '@/components/atoms/icon'
import { collectRoute, planRoute, settingsRoute } from '@/constants/routes'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva('fixed right-0 bottom-0 left-0 z-50 mx-4 mb-3'),
  nav: cva(
    'bg-surface-container-lowest/85 mx-auto flex h-14 max-w-xs items-center justify-center gap-4 rounded-2xl px-4 shadow-[0_2px_16px_-2px_hsl(var(--foreground)/0.04)] backdrop-blur-xl'
  ),
  srOnly: cva('sr-only')
}

const routeActive = (pathname: string, route: string) =>
  pathname === route || pathname.startsWith(`${route}/`)

// 2. types
type AppFooterProps = React.ComponentProps<'footer'> & VariantProps<typeof styles.root>

// 3. component
const AppFooter: React.FC<AppFooterProps> = (props) => {
  // a. props
  const { className, ...rest } = props

  // b. hooks
  const pathname = usePathname()

  // c. logic
  const collectActive = routeActive(pathname, collectRoute)
  const planActive = routeActive(pathname, planRoute)
  const settingsActive = routeActive(pathname, settingsRoute)

  // d. component
  return (
    <footer className={cn(styles.root({ className }))} {...rest}>
      <nav className={styles.nav()} aria-label="App">
        <Button size="icon-lg" variant={collectActive ? 'secondary' : 'ghost'} asChild>
          <Link href={collectRoute}>
            <Icon name="layers" size="md" />
            <span className={styles.srOnly()}>Collect</span>
          </Link>
        </Button>
        <Button size="icon-lg" variant={planActive ? 'secondary' : 'ghost'} asChild>
          <Link href={planRoute}>
            <Icon name="layoutGrid" size="md" />
            <span className={styles.srOnly()}>Plan</span>
          </Link>
        </Button>
        <Button size="icon-lg" variant={settingsActive ? 'secondary' : 'ghost'} asChild>
          <Link href={settingsRoute}>
            <Icon name="settings" size="md" />
            <span className={styles.srOnly()}>Settings</span>
          </Link>
        </Button>
      </nav>
    </footer>
  )
}

// 4. exports
export type { AppFooterProps }
export { AppFooter }
