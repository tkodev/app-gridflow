import type { SupabaseClient } from '@supabase/supabase-js'
import { SUPABASE_STORAGE_BUCKET_POSTS } from '@/constants/supabase'

/**
 * Supabase Storage — posts bucket only: URL parsing and folder cleanup.
 */

/**
 * Object path inside the posts bucket from a Supabase Storage URL.
 * Handles both public and signed URLs (the client only checked public before).
 */
export function extractPostsBucketObjectPath(url: string): string | null {
  if (!url) return null
  try {
    const u = new URL(url)
    const escaped = SUPABASE_STORAGE_BUCKET_POSTS.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const match = u.pathname.match(
      new RegExp(`/storage/v1/object/(?:public|sign)/${escaped}/(.+)$`)
    )
    return match ? decodeURIComponent(match[1]) : null
  } catch {
    return null
  }
}

/** Remove every object under `{profileId}/{postId}/` in the posts bucket. */
export async function removePostFolderObjects(
  supabase: SupabaseClient,
  profileId: string,
  postId: string
): Promise<void> {
  const prefix = `${profileId}/${postId}`
  const { data: files, error: listError } = await supabase.storage
    .from(SUPABASE_STORAGE_BUCKET_POSTS)
    .list(prefix)

  if (listError || !files?.length) return

  const paths = files.map((f) => `${prefix}/${f.name}`)
  await supabase.storage.from(SUPABASE_STORAGE_BUCKET_POSTS).remove(paths)
}
