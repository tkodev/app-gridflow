import Link from 'next/link'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Container } from '@/components/atoms/container'
import { Icon } from '@/components/atoms/icon'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva('py-12'),
  inner: cva('flex flex-col items-center gap-6'),
  brand: cva('flex items-center gap-2'),
  brandText: cva('font-serif text-lg font-bold'),
  links: cva('text-muted-foreground flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm'),
  link: cva('hover:text-foreground transition-colors'),
  copyright: cva('text-muted-foreground text-xs')
}

// 2. types
type LandingFooterProps = React.ComponentProps<'footer'> & VariantProps<typeof styles.root>

// 3. component
const LandingFooter: React.FC<LandingFooterProps> = (props) => {
  const { className, ...rest } = props

  return (
    <footer className={cn(styles.root({ className }))} {...rest}>
      <Container className={styles.inner()}>
        <div className={styles.brand()}>
          <Icon name="grid3x3" size="md" />
          <span className={styles.brandText()}>GridFlow</span>
        </div>
        <nav className={styles.links()}>
          <Link className={styles.link()} href="#">
            Privacy Policy
          </Link>
          <Link className={styles.link()} href="#">
            Terms
          </Link>
          <Link className={styles.link()} href="#">
            Instagram
          </Link>
          <Link className={styles.link()} href="#">
            Twitter
          </Link>
        </nav>
        <p className={styles.copyright()}>
          &copy; {new Date().getFullYear()} GridFlow. All rights reserved.
        </p>
      </Container>
    </footer>
  )
}

// 4. exports
export type { LandingFooterProps }
export { LandingFooter }
