import { redirect } from 'next/navigation'
import type { Post } from '@/types/post'
import type { Profile } from '@/types/profile'
import { PostsGridView } from '@/components/profiles/posts-grid-view'
import { ProfileHeader } from '@/components/profiles/profile-header'
import { ProfileMissingView } from '@/components/profiles/profile-missing-view'
import { SUPABASE_TABLE_POSTS, SUPABASE_TABLE_PROFILES } from '@/constants/supabase'
import { sortPostMediaByPosition } from '@/utils/post-media'
import { createClient } from '@/utils/supabase-server'

const ProfilesPage = async ({ searchParams }: { searchParams: Promise<{ profile?: string }> }) => {
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

  // Fetch posts for current profile with their media
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

  return (
    <div className="py-6">
      <ProfileHeader postsCount={posts?.length || 0} profile={profile} profiles={profiles} />
      <PostsGridView initialPosts={posts || []} profile={profile} />
    </div>
  )
}

export default ProfilesPage
