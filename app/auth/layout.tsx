import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { AppHeader } from '@/components/sections/app-header'
import { createClient } from '@/utils/supabase-server'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva('flex min-h-screen flex-col'),
  main: cva('flex flex-1 items-center justify-center p-4')
}

// 2. types
type AuthLayoutProps = {
  children: React.ReactNode
  className?: string
} & VariantProps<typeof styles.root>

// 3. component
const AuthLayout = async (props: AuthLayoutProps) => {
  // a. props
  const { children, className } = props

  // b. hooks

  // c. logic
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  // d. component
  return (
    <div className={cn(styles.root({ className }))}>
      <AppHeader user={user} />
      <main className={styles.main()}>{children}</main>
    </div>
  )
}

// 4. exports
export default AuthLayout
