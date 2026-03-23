import { redirect } from 'next/navigation'
import { cva, type VariantProps } from 'class-variance-authority'
import type { Post } from '@/types/post'
import type { Profile } from '@/types/profile'
import { PostsSection } from '@/components/organisms/posts-section'
import { ProfileMissingView } from '@/components/organisms/profile-missing-view'
import { ProfileSection } from '@/components/organisms/profile-section'
import { SUPABASE_TABLE_POSTS, SUPABASE_TABLE_PROFILES } from '@/constants/supabase'
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
const ProfilesPage = async (props: ProfilesPageProps) => {
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
    .from(SUPABASE_TABLE_PROFILES)
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  const profiles = (profilesRaw ?? []) as Profile[]

  if (profiles.length === 0) {
    return <ProfileMissingView />
  }

  const currentProfileId = params.profile || profiles[0].id
  const profile = profiles.find((p) => p.id === currentProfileId) ?? profiles[0]

  const { data: postsRaw } = await supabase
    .from(SUPABASE_TABLE_POSTS)
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
      <ProfileSection postsCount={posts?.length || 0} profile={profile} profiles={profiles} />
      <PostsSection initialPosts={posts || []} profile={profile} />
    </div>
  )
}

// 4. exports
export default ProfilesPage
