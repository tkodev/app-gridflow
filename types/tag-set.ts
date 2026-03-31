/** Matches `public.tag_sets` (see migration scripts). */
type TagSet = {
  id: string
  profile_id: string
  name: string
  /** Whitespace-separated hashtags, e.g. "#minimalist #monochrome". */
  tags: string
  created_at: string
  updated_at: string
}

export type { TagSet }
