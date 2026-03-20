/** Supabase Storage bucket names */
export const SUPABASE_STORAGE_BUCKET_POSTS = "posts" as const;
export const SUPABASE_STORAGE_BUCKET_AVATARS = "avatars" as const;

/** Supabase Postgres table names used by the app */
export const SUPABASE_TABLE_POSTS = "posts" as const;
export const SUPABASE_TABLE_POST_MEDIA = "post_media" as const;
export const SUPABASE_TABLE_PROFILES = "profiles" as const;

/** `cacheControl` value for Storage uploads to the posts bucket */
export const SUPABASE_STORAGE_CACHE_CONTROL_POSTS = "3600" as const;
