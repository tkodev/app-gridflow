import { redirect } from 'next/navigation'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Container } from '@/components/atoms/container'
import { AppHeader } from '@/components/sections/app-header'
import { createClient } from '@/utils/supabase-server'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva('bg-background min-h-screen'),
  main: cva('pb-20')
}

// 2. types
type SettingsLayoutProps = {
  children: React.ReactNode
  className?: string
} & VariantProps<typeof styles.root>

// 3. component
const SettingsLayout: React.FC<SettingsLayoutProps> = async (props) => {
  // a. props
  const { children, className } = props

  // b. hooks

  // c. logic
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // d. component
  return (
    <div className={cn(styles.root({ className }))}>
      <AppHeader user={user} />
      <main className={styles.main()}>
        <Container>{children}</Container>
      </main>
    </div>
  )
}

// 4. exports
export default SettingsLayout
