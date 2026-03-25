import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva('py-6'),
  title: cva('text-2xl font-bold'),
  text: cva('text-muted-foreground mt-2')
}

// 2. types
type CollectPageProps = {
  className?: string
} & VariantProps<typeof styles.root>

// 3. component
const CollectPage: React.FC<CollectPageProps> = (props) => {
  // a. props
  const { className } = props

  // d. component
  return (
    <div className={cn(styles.root({ className }))}>
      <h1 className={styles.title()}>Collect</h1>
      <p className={styles.text()}>This is the collect page.</p>
    </div>
  )
}

// 4. exports
export default CollectPage
