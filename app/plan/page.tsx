'use client'

import { useSearchParams } from 'next/navigation'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { MissingView } from '@/components/sections/missing-view'
import { PlanView } from '@/components/sections/plan-view'
import { usePostsQuery } from '@/queries/posts'
import { useProfilesQuery } from '@/queries/profile'
import { useUserQuery } from '@/queries/user'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva('py-6'),
  loading: cva('text-muted-foreground flex items-center justify-center py-20')
}

// 2. types
type PlanPageProps = {
  className?: string
} & VariantProps<typeof styles.root>

// 3. component
const PlanPage: React.FC<PlanPageProps> = (props) => {
  // a. props
  const { className } = props

  // b. hooks
  const searchParams = useSearchParams()
  const { data: user } = useUserQuery()
  const { data: profiles, isLoading: profilesLoading } = useProfilesQuery(user?.id)

  // c. logic
  const profileParam = searchParams.get('profile')
  const currentProfileId = profileParam || profiles?.[0]?.id
  const profile = profiles?.find((p) => p.id === currentProfileId) ?? profiles?.[0]

  const { data: posts, isLoading: postsLoading } = usePostsQuery(profile?.id)

  const isLoading = profilesLoading || postsLoading

  if (isLoading) {
    return (
      <div className={cn(styles.root({ className }))}>
        <p className={styles.loading()}>Loading...</p>
      </div>
    )
  }

  if (!profiles || profiles.length === 0) {
    return (
      <MissingView
        ctaLabel="Create Your First Profile"
        description="Create your first profile to start planning your Instagram grid. You can add multiple profiles for different accounts."
        icon="userPlus"
        title="No Profiles Yet"
        href="/settings"
      />
    )
  }

  if (!profile) {
    return null
  }

  // d. component
  return (
    <div className={cn(styles.root({ className }))}>
      <PlanView posts={posts || []} profile={profile} profiles={profiles} />
    </div>
  )
}

// 4. exports
export default PlanPage
