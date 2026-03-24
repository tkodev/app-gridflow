import type { SupabaseClient } from '@supabase/supabase-js'
import { supabaseStorageBucketPosts } from '@/constants/db'

/**
 * Supabase Storage — posts bucket only: URL parsing and folder cleanup.
 */

/**
 * Object path inside the posts bucket from a Supabase Storage URL.
 * Handles both public and signed URLs (the client only checked public before).
 */
function extractPostsBucketObjectPath(url: string): string | null {
  if (!url) return null
  try {
    const u = new URL(url)
    const escaped = supabaseStorageBucketPosts.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const match = u.pathname.match(
      new RegExp(`/storage/v1/object/(?:public|sign)/${escaped}/(.+)$`)
    )
    return match ? decodeURIComponent(match[1]) : null
  } catch {
    return null
  }
}

/** Remove every object under `{profileId}/{postId}/` in the posts bucket. */
async function removePostFolderObjects(
  supabase: SupabaseClient,
  profileId: string,
  postId: string
): Promise<void> {
  const prefix = `${profileId}/${postId}`
  const { data: files, error: listError } = await supabase.storage
    .from(supabaseStorageBucketPosts)
    .list(prefix)

  if (listError || !files?.length) return

  const paths = files.map((f) => `${prefix}/${f.name}`)
  await supabase.storage.from(supabaseStorageBucketPosts).remove(paths)
}

export { extractPostsBucketObjectPath, removePostFolderObjects }
