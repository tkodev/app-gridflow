/** Supabase Storage bucket names */
const supabaseStorageBucketPosts = 'posts' as const
const supabaseStorageBucketAvatars = 'avatars' as const

/** `cacheControl` value for Storage uploads to the posts bucket */
const supabaseStorageCacheControlPosts = '3600' as const

export {
  supabaseStorageBucketAvatars,
  supabaseStorageBucketPosts,
  supabaseStorageCacheControlPosts
}
