/** Supabase Storage bucket names */
export const supabaseStorageBucketPosts = 'posts' as const
export const supabaseStorageBucketAvatars = 'avatars' as const

/** Supabase Postgres table names used by the app */
export const supabaseTablePosts = 'posts' as const
export const supabaseTablePostMedia = 'post_media' as const
export const supabaseTableProfiles = 'profiles' as const

/** `cacheControl` value for Storage uploads to the posts bucket */
export const supabaseStorageCacheControlPosts = '3600' as const
