type PostMedia = {
  id: string
  post_id: string
  media_url: string
  media_type: 'image' | 'video'
  position: number
  created_at: string
}

type Post = {
  id: string
  profile_id: string
  caption: string | null
  subtitle: string | null
  grid_position: number
  status: 'draft' | 'scheduled' | 'published'
  scheduled_at: string | null
  published_at: string | null
  created_at: string
  updated_at: string
  /** Ordered by `position` ascending (normalized when loading from the server and when saving). */
  media: PostMedia[]
}

// Local media item for form handling (before upload)
type LocalMediaItem = {
  id: string
  file?: File
  url: string
  type: 'image' | 'video'
  isNew: boolean // true if file needs to be uploaded
}

export type { LocalMediaItem, Post, PostMedia }
