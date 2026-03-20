import type { PostMedia } from "@/types/post";

/**
 * Returns a new array ordered by `position` ascending.
 * Use when normalizing data from the API; prefer relying on `Post.media` already being ordered elsewhere.
 */
export function sortPostMediaByPosition(
  media: readonly PostMedia[]
): PostMedia[] {
  return [...media].sort((a, b) => a.position - b.position);
}
