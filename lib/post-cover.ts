import type { Post } from "@/types/post";

/** Grid / card cover: first media by position. */
export function getPostCoverUrl(post: Post): string {
  if (post.media.length === 0) return "";
  return [...post.media].sort((a, b) => a.position - b.position)[0].media_url;
}
