/** Supabase Storage bucket names */
const supabaseStorageBucketPosts = 'posts' as const
const supabaseStorageBucketAvatars = 'avatars' as const

/** Supabase Postgres table names used by the app */
const supabaseTablePosts = 'posts' as const
const supabaseTablePostMedia = 'post_media' as const
const supabaseTableProfiles = 'profiles' as const

/** `cacheControl` value for Storage uploads to the posts bucket */
const supabaseStorageCacheControlPosts = '3600' as const

export {
  supabaseStorageBucketAvatars,
  supabaseStorageBucketPosts,
  supabaseStorageCacheControlPosts,
  supabaseTablePostMedia,
  supabaseTablePosts,
  supabaseTableProfiles
}
