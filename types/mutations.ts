import type { LocalMediaItem, Post } from './post'
import type { Profile } from './profile'

export type AddProfileMutationInput = {
  username: string
}

export type DeleteProfileMutationInput = {
  profile: Profile
}

export type ChangePasswordMutationInput = {
  currentPassword: string
  newPassword: string
}

export type ChangeEmailMutationInput = {
  currentPassword: string
  newEmail: string
}

export type SignInMutationInput = {
  email: string
  password: string
}

export type SignUpMutationInput = {
  email: string
  password: string
  username: string
}

export type SavePostMutationInput = {
  isEditing: boolean
  post: Post | null | undefined
  profileId: string
  nextPosition: number
  caption: string
  subtitle: string
  status: Post['status']
  mediaItems: LocalMediaItem[]
}

export type DeletePostMutationInput = {
  post: Post
  profileId: string
}

export type ReorderPostsMutationInput = {
  /** Posts in display order; `grid_position` is set to each index. */
  orderedPosts: Pick<Post, 'id'>[]
}

export type UpdateProfileMutationInput = {
  profileId: string
  username: string
  displayName: string
  bio: string
  gridRatio: Profile['grid_ratio']
  existingAvatarUrl: string | null
  newAvatarFile: File | null
  /** True when preview was cleared and a stored avatar should be removed. */
  removeStoredAvatar: boolean
}
