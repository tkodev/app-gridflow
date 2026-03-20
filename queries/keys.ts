import { QUERY_ROOT_SEGMENT } from '@/constants/query'

/**
 * Central query keys for TanStack Query. Extend as you add useQuery/useInfiniteQuery.
 */
export const queryKeys = {
  root: [QUERY_ROOT_SEGMENT] as const,
  profiles: () => [...queryKeys.root, 'profiles'] as const,
  posts: (profileId: string) => [...queryKeys.root, 'posts', profileId] as const
} as const
