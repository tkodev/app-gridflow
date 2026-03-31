'use client'

import * as React from 'react'
import type { Post } from '@/types/post'
import type { Profile } from '@/types/profile'
import { IntroView } from '@/components/sections/intro-view'
import { PostView } from '@/components/sections/post-view'

// 1. types
type PlanViewProps = {
  posts: Post[]
  profile: Profile
  profiles: Profile[]
}

// 2. component
const PlanView: React.FC<PlanViewProps> = (props) => {
  // a. props
  const { posts, profile, profiles } = props

  // c. component
  return (
    <>
      <IntroView posts={posts} profile={profile} profiles={profiles} />
      <PostView initialPosts={posts} profile={profile} />
    </>
  )
}

// 3. exports
export type { PlanViewProps }
export { PlanView }
