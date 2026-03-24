'use client'

import * as React from 'react'
import type { Post } from '@/types/post'
import type { Profile } from '@/types/profile'
import { IntroView } from '@/components/sections/intro-view'
import { PostView } from '@/components/sections/post-view'

// 1. types
type ProfilesViewProps = {
  posts: Post[]
  postsCount: number
  profile: Profile
  profiles: Profile[]
}

// 2. component
const ProfilesView: React.FC<ProfilesViewProps> = (props) => {
  // a. props
  const { posts, postsCount, profile, profiles } = props

  // b. hooks

  // c. component
  return (
    <>
      <IntroView postsCount={postsCount} profile={profile} profiles={profiles} />
      <PostView initialPosts={posts} profile={profile} />
    </>
  )
}

// 3. exports
export type { ProfilesViewProps }
export { ProfilesView }
