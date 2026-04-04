import type { Collection } from './collection'
import type { LocalMediaItem, Post } from './post'
import type { Profile } from './profile'
import type { TagSet } from './tag-set'

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
  displayName: string
}

type SavePostMutationInput = {
  isEditing: boolean
  post: Post | null | undefined
  profileId: string
  nextPosition: number
  caption: string
  subtitle: string
  tagline: string
  status: Post['status']
  scheduledAt: string | null
  mediaItems: LocalMediaItem[]
  tagSetIds: string[]
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

type SaveCollectionMutationInput = {
  isEditing: boolean
  collection: Collection | null | undefined
  profileId: string
  name: string
  description: string
}

type DeleteCollectionMutationInput = {
  collection: Collection
}

type SaveTagSetMutationInput = {
  isEditing: boolean
  tagSet: TagSet | null | undefined
  profileId: string
  name: string
  tags: string
}

type DeleteTagSetMutationInput = {
  tagSet: TagSet
}

export type {
  AddProfileMutationInput,
  ChangeEmailMutationInput,
  ChangePasswordMutationInput,
  DeleteCollectionMutationInput,
  DeletePostMutationInput,
  DeleteProfileMutationInput,
  DeleteTagSetMutationInput,
  ReorderPostsMutationInput,
  SaveCollectionMutationInput,
  SavePostMutationInput,
  SaveTagSetMutationInput,
  SignInMutationInput,
  SignUpMutationInput,
  UpdateProfileMutationInput
}
