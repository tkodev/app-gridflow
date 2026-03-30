const authKeys = {
  user: () => ['auth', 'user'] as const
}

const profileKeys = {
  all: (userId: string) => ['profiles', userId] as const,
  detail: (profileId: string) => ['profiles', 'detail', profileId] as const
}

const postKeys = {
  all: (profileId: string) => ['posts', profileId] as const,
  detail: (postId: string) => ['posts', 'detail', postId] as const
}

const collectionKeys = {
  all: (profileId: string) => ['collections', profileId] as const,
  detail: (collectionId: string) => ['collections', 'detail', collectionId] as const
}

const tagSetKeys = {
  all: (profileId: string) => ['tagSets', profileId] as const,
  detail: (tagSetId: string) => ['tagSets', 'detail', tagSetId] as const
}

const subscriptionKeys = {
  detail: (userId: string) => ['subscription', userId] as const
}

export { authKeys, collectionKeys, postKeys, profileKeys, subscriptionKeys, tagSetKeys }
