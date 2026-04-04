'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  DeletePostMutationInput,
  ReorderPostsMutationInput,
  SavePostMutationInput
} from '@/types/mutations'
import type { Post } from '@/types/post'
import { supabaseStorageBucketPosts, supabaseStorageCacheControlPosts } from '@/constants/db'
import { postKeys } from '@/queries/keys'
import { extensionForPostMediaUpload } from '@/utils/post-media'
import { extractPostsBucketObjectPath, removePostFolderObjects } from '@/utils/post-storage'
import { createClient } from '@/utils/supabase-browser'

async function fetchPosts(profileId: string): Promise<Post[]> {
  const res = await fetch(`/api/posts?profileId=${encodeURIComponent(profileId)}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(typeof err.error === 'string' ? err.error : 'Failed to load posts')
  }
  const data = (await res.json()) as { posts: Post[] }
  return data.posts
}

function usePostsQuery(profileId: string | undefined) {
  return useQuery({
    queryKey: postKeys.all(profileId ?? ''),
    queryFn: () => fetchPosts(profileId!),
    enabled: Boolean(profileId),
    staleTime: 1000 * 60 * 2
  })
}

type MediaSyncItem =
  | { isNew: true; mediaUrl: string; mediaType: 'image' | 'video'; position: number }
  | { isNew: false; id: string; position: number }

async function savePostMutationFn(vars: SavePostMutationInput): Promise<Post> {
  const supabase = createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not signed in')

  const {
    isEditing,
    post,
    profileId,
    nextPosition,
    caption,
    subtitle,
    tagline,
    status,
    scheduledAt,
    mediaItems,
    tagSetIds
  } = vars

  let postId = post?.id

  if (!isEditing) {
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profileId,
        nextPosition,
        caption: caption || null,
        subtitle: subtitle || null,
        tagline: tagline || null,
        status,
        scheduledAt
      })
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(typeof err.error === 'string' ? err.error : 'Failed to create post')
    }
    const data = (await res.json()) as { post: Post }
    postId = data.post.id
  } else {
    postId = post!.id
  }

  if (!postId) throw new Error('Missing post id')

  if (isEditing && post) {
    const currentIds = new Set(mediaItems.filter((m) => !m.isNew).map((m) => m.id))
    const toDelete = post.media.filter((m) => !currentIds.has(m.id))
    for (const media of toDelete) {
      const path = extractPostsBucketObjectPath(media.media_url)
      if (path) {
        await supabase.storage.from(supabaseStorageBucketPosts).remove([path])
      }
    }
  }

  const apiMedia: MediaSyncItem[] = []

  for (let i = 0; i < mediaItems.length; i++) {
    const item = mediaItems[i]
    if (item.isNew && item.file) {
      const ext = extensionForPostMediaUpload(item.file)
      const filePath = `${profileId}/${postId}/${crypto.randomUUID()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from(supabaseStorageBucketPosts)
        .upload(filePath, item.file, {
          cacheControl: supabaseStorageCacheControlPosts,
          upsert: false,
          contentType: item.file.type || undefined
        })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from(supabaseStorageBucketPosts)
        .getPublicUrl(filePath)

      apiMedia.push({ isNew: true, mediaUrl: urlData.publicUrl, mediaType: item.type, position: i })
    } else if (!item.isNew) {
      apiMedia.push({ isNew: false, id: item.id, position: i })
    }
  }

  const res = await fetch(`/api/posts/${postId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      caption,
      subtitle,
      tagline,
      status,
      scheduledAt,
      tagSetIds,
      mediaItems: apiMedia
    })
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(typeof err.error === 'string' ? err.error : 'Failed to save post')
  }

  const data = (await res.json()) as { post: Post }
  return data.post
}

function useSavePostMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: savePostMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    }
  })
}

async function deletePostMutationFn(vars: DeletePostMutationInput): Promise<void> {
  const supabase = createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not signed in')

  const { post, profileId } = vars

  const paths = new Set<string>()
  for (const media of post.media) {
    const path = extractPostsBucketObjectPath(media.media_url)
    if (path) paths.add(path)
  }
  if (paths.size > 0) {
    await supabase.storage.from(supabaseStorageBucketPosts).remove([...paths])
  }

  await removePostFolderObjects(supabase, profileId, post.id)

  const res = await fetch(`/api/posts/${post.id}`, { method: 'DELETE' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(typeof err.error === 'string' ? err.error : 'Failed to delete post')
  }
}

function useDeletePostMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deletePostMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    }
  })
}

async function reorderPostsMutationFn(vars: ReorderPostsMutationInput): Promise<void> {
  const res = await fetch('/api/posts/reorder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderedPosts: vars.orderedPosts })
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(typeof err.error === 'string' ? err.error : 'Failed to reorder posts')
  }
}

function useReorderPostsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: reorderPostsMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    }
  })
}

export {
  deletePostMutationFn,
  reorderPostsMutationFn,
  savePostMutationFn,
  useDeletePostMutation,
  usePostsQuery,
  useReorderPostsMutation,
  useSavePostMutation
}
