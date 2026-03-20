import type { Post, LocalMediaItem } from "./post";
import type { Profile } from "./profile";

export interface AddProfileMutationInput {
  username: string;
}

export interface DeleteProfileMutationInput {
  profile: Profile;
}

export interface ChangePasswordMutationInput {
  newPassword: string;
}

export interface SignInMutationInput {
  email: string;
  password: string;
}

export interface SignUpMutationInput {
  email: string;
  password: string;
  username: string;
}

export interface SavePostMutationInput {
  isEditing: boolean;
  post: Post | null | undefined;
  profileId: string;
  nextPosition: number;
  caption: string;
  subtitle: string;
  status: Post["status"];
  mediaItems: LocalMediaItem[];
}

export interface DeletePostMutationInput {
  post: Post;
  profileId: string;
}

export interface ReorderPostsMutationInput {
  /** Posts in display order; `grid_position` is set to each index. */
  orderedPosts: Pick<Post, "id">[];
}

export interface UpdateProfileMutationInput {
  profileId: string;
  username: string;
  displayName: string;
  bio: string;
  gridRatio: Profile["grid_ratio"];
  existingAvatarUrl: string | null;
  newAvatarFile: File | null;
  /** True when preview was cleared and a stored avatar should be removed. */
  removeStoredAvatar: boolean;
}
