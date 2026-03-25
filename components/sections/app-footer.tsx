'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Layers, LayoutGrid, Settings } from 'lucide-react'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Button } from '@/components/atoms/button'
import { Container } from '@/components/atoms/container'
import { Icon } from '@/components/atoms/icon'
import { collectRoute, planRoute, settingsRoute } from '@/constants/routes'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva('bg-background/80 fixed right-0 bottom-0 left-0 z-50 w-full border-t backdrop-blur-sm'),
  inner: cva('flex h-14 items-center justify-center'),
  nav: cva('flex items-center justify-center gap-4'),
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
      <Container className={styles.inner()}>
        <nav className={styles.nav()} aria-label="App">
          <Button size="icon-lg" variant={collectActive ? 'secondary' : 'ghost'} asChild>
            <Link href={collectRoute}>
              <Icon icon={Layers} size="md" />
              <span className={styles.srOnly()}>Collect</span>
            </Link>
          </Button>
          <Button size="icon-lg" variant={planActive ? 'secondary' : 'ghost'} asChild>
            <Link href={planRoute}>
              <Icon icon={LayoutGrid} size="md" />
              <span className={styles.srOnly()}>Plan</span>
            </Link>
          </Button>
          <Button size="icon-lg" variant={settingsActive ? 'secondary' : 'ghost'} asChild>
            <Link href={settingsRoute}>
              <Icon icon={Settings} size="md" />
              <span className={styles.srOnly()}>Settings</span>
            </Link>
          </Button>
        </nav>
      </Container>
    </footer>
  )
}

// 4. exports
export type { AppFooterProps }
export { AppFooter }
