import { redirect } from 'next/navigation'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Container } from '@/components/atoms/container'
import { AppFooter } from '@/components/sections/app-footer'
import { AppHeader } from '@/components/sections/app-header'
import { signInRoute } from '@/constants/routes'
import { createClient } from '@/utils/supabase-server'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva('bg-background min-h-screen'),
  main: cva('pt-20 pb-24')
}

// 2. types
type PlanLayoutProps = {
  children: React.ReactNode
  className?: string
} & VariantProps<typeof styles.root>

// 3. component
const PlanLayout: React.FC<PlanLayoutProps> = async (props) => {
  // a. props
  const { children, className } = props

  // c. logic
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(signInRoute)
  }

  // d. component
  return (
    <div className={cn(styles.root({ className }))}>
      <AppHeader user={user} title="Plan" leadingIcon="layoutGrid" />
      <main className={styles.main()}>
        <Container size="md">{children}</Container>
      </main>
      <AppFooter />
    </div>
  )
}

// 4. exports
export default PlanLayout
