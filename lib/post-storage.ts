import type { SupabaseClient } from "@supabase/supabase-js";

const POSTS_BUCKET = "posts";

/**
 * Object path inside the `posts` bucket from a Supabase Storage URL.
 * Handles both public and signed URLs (the client only checked public before).
 */
export function extractPostsBucketObjectPath(url: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const match = u.pathname.match(
      /\/storage\/v1\/object\/(?:public|sign)\/posts\/(.+)$/
    );
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

/** Remove every object under `posts/{profileId}/{postId}/` (current upload layout). */
export async function removePostFolderObjects(
  supabase: SupabaseClient,
  profileId: string,
  postId: string
): Promise<void> {
  const prefix = `${profileId}/${postId}`;
  const { data: files, error: listError } = await supabase.storage
    .from(POSTS_BUCKET)
    .list(prefix);

  if (listError || !files?.length) return;

  const paths = files.map((f) => `${prefix}/${f.name}`);
  await supabase.storage.from(POSTS_BUCKET).remove(paths);
}
