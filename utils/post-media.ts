import type { PostMedia } from "@/types/post";

/**
 * Post media: ordering, file metadata for uploads, etc.
 * Supabase posts bucket (URL paths, folder cleanup) — `post-storage.ts`.
 */

/** Map upload MIME → safe file extension for storage object keys. */
export function extensionForPostMediaUpload(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]+$/.test(fromName) && fromName.length <= 8) {
    return fromName;
  }
  const typeMap: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/quicktime": "mov",
  };
  return typeMap[file.type] ?? "bin";
}

/**
 * Returns a new array ordered by `position` ascending.
 * Use when normalizing data from the API; prefer relying on `Post.media` already being ordered elsewhere.
 */
export function sortPostMediaByPosition(
  media: readonly PostMedia[]
): PostMedia[] {
  return [...media].sort((a, b) => a.position - b.position);
}
