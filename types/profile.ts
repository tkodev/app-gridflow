/** Matches `public.profiles` (see migration scripts). */
type Profile = {
  id: string
  user_id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
  grid_ratio: 'square' | 'portrait'
}

export type { Profile }
