import { redirect } from 'next/navigation'
import { UserPlus } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import type { Post } from '@/types/post'
import type { Profile } from '@/types/profile'
import { MissingView } from '@/components/sections/missing-view'
import { ProfilesView } from '@/components/sections/profiles-view'
import { supabaseTablePosts, supabaseTableProfiles } from '@/constants/db'
import { sortPostMediaByPosition } from '@/utils/post-media'
import { createClient } from '@/utils/supabase-server'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva('py-6')
}

// 2. types
type ProfilesPageProps = {
  searchParams: Promise<{ profile?: string }>
  className?: string
} & VariantProps<typeof styles.root>

// 3. component
const ProfilesPage: React.FC<ProfilesPageProps> = async (props) => {
  // a. props
  const { searchParams, className } = props

  // b. hooks

  // c. logic
  const supabase = await createClient()
  const params = await searchParams

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profilesRaw } = await supabase
    .from(supabaseTableProfiles)
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  const profiles = (profilesRaw ?? []) as Profile[]

  if (profiles.length === 0) {
    return (
      <MissingView
        ctaLabel="Create Your First Profile"
        description="Create your first profile to start planning your Instagram grid. You can add multiple profiles for different accounts."
        icon={UserPlus}
        title="No Profiles Yet"
        href="/settings"
      />
    )
  }

  const currentProfileId = params.profile || profiles[0].id
  const profile = profiles.find((p) => p.id === currentProfileId) ?? profiles[0]

  const { data: postsRaw } = await supabase
    .from(supabaseTablePosts)
    .select(
      `
      id,
      profile_id,
      caption,
      subtitle,
      grid_position,
      status,
      scheduled_at,
      published_at,
      created_at,
      updated_at,
      post_media(*)
    `
    )
    .eq('profile_id', profile.id)
    .order('grid_position', { ascending: true })

  const posts: Post[] = (postsRaw ?? []).map((row) => {
    const { post_media, ...rest } = row as typeof row & {
      post_media?: Post['media']
    }
    return {
      ...rest,
      media: sortPostMediaByPosition(post_media ?? [])
    }
  })

  // d. component
  return (
    <div className={cn(styles.root({ className }))}>
      <ProfilesView
        posts={posts || []}
        postsCount={posts?.length || 0}
        profile={profile}
        profiles={profiles}
      />
    </div>
  )
}

// 4. exports
export default ProfilesPage
