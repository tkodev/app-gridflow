'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { SettingsView } from '@/components/sections/settings-view'
import { useProfilesQuery } from '@/queries/profile'
import { useUserQuery } from '@/queries/user'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva('py-6'),
  loading: cva('flex items-center justify-center py-20 text-muted-foreground')
}

// 2. types
type SettingsPageProps = {
  className?: string
} & VariantProps<typeof styles.root>

// 3. component
const SettingsPage: React.FC<SettingsPageProps> = (props) => {
  // a. props
  const { className } = props

  // b. hooks
  const { data: user } = useUserQuery()
  const { data: profiles, isLoading } = useProfilesQuery(user?.id)

  // c. logic
  if (isLoading) {
    return (
      <div className={cn(styles.root({ className }))}>
        <p className={styles.loading()}>Loading...</p>
      </div>
    )
  }

  // d. component
  return (
    <div className={cn(styles.root({ className }))}>
      <SettingsView profiles={profiles ?? []} userEmail={user?.email || ''} />
    </div>
  )
}

// 4. exports
export default SettingsPage
