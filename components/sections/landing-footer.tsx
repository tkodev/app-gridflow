import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Container } from '@/components/atoms/container'
import { Icon } from '@/components/atoms/icon'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva('border-t py-8'),
  inner: cva('grid grid-cols-12 items-center gap-4'),
  brand: cva('col-span-12 flex items-center justify-center gap-2 md:col-span-6 md:justify-start'),
  brandText: cva('font-semibold'),
  note: cva('text-muted-foreground col-span-12 text-center text-sm md:col-span-6 md:text-right')
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
        <p className={styles.note()}>Built for creators who care about aesthetics.</p>
      </Container>
    </footer>
  )
}

// 4. exports
export type { LandingFooterProps }
export { LandingFooter }
