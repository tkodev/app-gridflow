import type { Post } from '@/types/post'
import type { Profile } from '@/types/profile'

/**
 * Demo assets in `public/landing/`. Photos from Unsplash (free to use under the Unsplash License).
 * @see https://unsplash.com/license
 */
const demoMediaUrls = [
  '/landing/grid-01.jpg',
  '/landing/grid-02.jpg',
  '/landing/grid-03.jpg',
  '/landing/grid-04.jpg',
  '/landing/grid-05.jpg',
  '/landing/grid-06.jpg',
  '/landing/grid-07.jpg',
  '/landing/grid-08.jpg',
  '/landing/grid-09.jpg'
] as const

const demoTimestamp = '2024-06-01T12:00:00.000Z'

/** Hypothetical interior designer — matches the landing grid preview persona. */
const demoProfile: Profile = {
  id: 'demo-profile-landing',
  user_id: 'demo-user-landing',
  username: 'atelier.nova',
  display_name: 'Mara Ellis Studio',
  bio: 'Residential interiors — light, materials, and layout. Planning the grid before the reveal.',
  avatar_url: '/landing/avatar.jpg',
  created_at: demoTimestamp,
  updated_at: demoTimestamp,
  grid_ratio: 'square'
}

const demoPosts = ((): Post[] => {
  return Array.from({ length: 9 }, (_, i) => {
    const id = `demo-post-${i + 1}`
    const mediaUrl = demoMediaUrls[i]
    return {
      id,
      profile_id: demoProfile.id,
      caption: null,
      subtitle: null,
      tagline: null,
      grid_position: i,
      status: 'published' as const,
      scheduled_at: null,
      published_at: demoTimestamp,
      created_at: demoTimestamp,
      updated_at: demoTimestamp,
      media: [
        {
          id: `demo-media-${i + 1}`,
          post_id: id,
          media_url: mediaUrl,
          media_type: 'image' as const,
          position: 0,
          created_at: demoTimestamp
        }
      ]
    }
  })
})()

export { demoMediaUrls, demoPosts, demoProfile }
