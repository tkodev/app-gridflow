/** Matches `public.collections` (see migration scripts). */
type Collection = {
  id: string
  profile_id: string
  name: string
  description: string | null
  cover_url: string | null
  created_at: string
  updated_at: string
}

/** Matches `public.collection_media` (see migration scripts). */
type CollectionMedia = {
  id: string
  collection_id: string
  media_url: string
  media_type: 'image' | 'video'
  position: number
  created_at: string
}

export type { Collection, CollectionMedia }
