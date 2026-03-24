import type { LocalMediaItem, Post } from './post'
import type { Profile } from './profile'

type AddProfileMutationInput = {
  username: string
}

type DeleteProfileMutationInput = {
  profile: Profile
}

type ChangePasswordMutationInput = {
  currentPassword: string
  newPassword: string
}

type ChangeEmailMutationInput = {
  currentPassword: string
  newEmail: string
}

type SignInMutationInput = {
  email: string
  password: string
}

type SignUpMutationInput = {
  email: string
  password: string
  username: string
}

type SavePostMutationInput = {
  isEditing: boolean
  post: Post | null | undefined
  profileId: string
  nextPosition: number
  caption: string
  subtitle: string
  status: Post['status']
  mediaItems: LocalMediaItem[]
}

type DeletePostMutationInput = {
  post: Post
  profileId: string
}

type ReorderPostsMutationInput = {
  /** Posts in display order; `grid_position` is set to each index. */
  orderedPosts: Pick<Post, 'id'>[]
}

type UpdateProfileMutationInput = {
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

export type {
  AddProfileMutationInput,
  ChangeEmailMutationInput,
  ChangePasswordMutationInput,
  DeletePostMutationInput,
  DeleteProfileMutationInput,
  ReorderPostsMutationInput,
  SavePostMutationInput,
  SignInMutationInput,
  SignUpMutationInput,
  UpdateProfileMutationInput
}
