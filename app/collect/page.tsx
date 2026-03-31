'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { CollectView } from '@/components/sections/collect-view'
import { useProfilesQuery } from '@/queries/profile'
import { useUserQuery } from '@/queries/user'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva(''),
  loading: cva('text-muted-foreground py-12 text-center text-sm')
}

// 2. types
type CollectPageProps = {
  className?: string
} & VariantProps<typeof styles.root>

// 3. component
const CollectPage: React.FC<CollectPageProps> = (props) => {
  // a. props
  const { className } = props

  // b. hooks
  const userQuery = useUserQuery()
  const profilesQuery = useProfilesQuery(userQuery.data?.id)

  // c. logic
  const activeProfile = profilesQuery.data?.[0]
  const isLoading = userQuery.isLoading || profilesQuery.isLoading

  // d. component
  if (isLoading) {
    return <p className={styles.loading()}>Loading collections…</p>
  }

  if (!activeProfile) {
    return <p className={styles.loading()}>Create a profile to start collecting.</p>
  }

  return (
    <div className={cn(styles.root({ className }))}>
      <CollectView profileId={activeProfile.id} />
    </div>
  )
}

// 4. exports
export default CollectPage
