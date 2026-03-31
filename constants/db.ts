/** Supabase Storage bucket names */
const supabaseStorageBucketPosts = 'posts' as const
const supabaseStorageBucketAvatars = 'avatars' as const

/** Supabase Postgres table names used by the app */
const supabaseTablePosts = 'posts' as const
const supabaseTablePostMedia = 'post_media' as const
const supabaseTableProfiles = 'profiles' as const
const supabaseTableCollections = 'collections' as const
const supabaseTableCollectionMedia = 'collection_media' as const
const supabaseTableTagSets = 'tag_sets' as const
const supabaseTablePostTagSets = 'post_tag_sets' as const
const supabaseTableCustomers = 'customers' as const
const supabaseTableSubscriptions = 'subscriptions' as const

/** `cacheControl` value for Storage uploads to the posts bucket */
const supabaseStorageCacheControlPosts = '3600' as const

export {
  supabaseStorageBucketAvatars,
  supabaseStorageBucketPosts,
  supabaseStorageCacheControlPosts,
  supabaseTableCollectionMedia,
  supabaseTableCollections,
  supabaseTableCustomers,
  supabaseTablePostMedia,
  supabaseTablePostTagSets,
  supabaseTablePosts,
  supabaseTableProfiles,
  supabaseTableSubscriptions,
  supabaseTableTagSets
}
