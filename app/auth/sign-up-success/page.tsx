import Link from 'next/link'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Button } from '@/components/atoms/button'
import { Icon } from '@/components/atoms/icon'
import { signInRoute } from '@/constants/routes'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva('py-6 text-center'),
  iconRing: cva('bg-primary/10 mx-auto flex size-16 items-center justify-center rounded-full'),
  title: cva('mt-6 text-2xl font-bold'),
  description: cva('text-muted-foreground mt-2'),
  cta: cva('mt-8')
}

// 2. types
type SignUpSuccessPageProps = {
  className?: string
} & VariantProps<typeof styles.root>

// 3. component
const SignUpSuccessPage: React.FC<SignUpSuccessPageProps> = (props) => {
  // a. props
  const { className } = props

  // d. component
  return (
    <div className={cn(styles.root({ className }))}>
      <div className={styles.iconRing()}>
        <Icon name="mail" size="lg" />
      </div>
      <h1 className={styles.title()}>Check your email</h1>
      <p className={styles.description()}>
        We sent you a confirmation link. Click the link in your email to activate your account.
      </p>
      <Button className={styles.cta()} variant="outline" asChild>
        <Link href={signInRoute}>Back to Sign In</Link>
      </Button>
    </div>
  )
}

// 4. exports
export default SignUpSuccessPage
