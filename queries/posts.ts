'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { asc, eq } from 'drizzle-orm'
import type {
  DeletePostMutationInput,
  ReorderPostsMutationInput,
  SavePostMutationInput
} from '@/types/mutations'
import type { Post, PostMedia } from '@/types/post'
import {
  supabaseStorageBucketPosts,
  supabaseStorageCacheControlPosts
} from '@/constants/db'
import { postKeys } from '@/queries/keys'
import { postMedia, posts } from '@/schema/posts'
import { postTagSets } from '@/schema/tag-sets'
import { rlsQuery } from '@/utils/database'
import { extensionForPostMediaUpload, sortPostMediaByPosition } from '@/utils/post-media'
import { extractPostsBucketObjectPath, removePostFolderObjects } from '@/utils/post-storage'
import { createClient } from '@/utils/supabase-browser'

function usePostsQuery(profileId: string | undefined) {
  return useQuery({
    queryKey: postKeys.all(profileId ?? ''),
    queryFn: async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not signed in')

      const rows = await rlsQuery(user.id, async (tx) => {
        const postRows = await tx
          .select()
          .from(posts)
          .where(eq(posts.profileId, profileId!))
          .orderBy(asc(posts.gridPosition))

        const mediaRows = postRows.length > 0
          ? await tx.select().from(postMedia)
          : []

        return postRows.map((post) => ({
          ...post,
          media: sortPostMediaByPosition(
            mediaRows
              .filter((m) => m.postId === post.id)
              .map((m) => ({
                id: m.id,
                post_id: m.postId,
                media_url: m.mediaUrl,
                media_type: m.mediaType,
                position: m.position,
                created_at: m.createdAt.toISOString()
              }))
          )
        }))
      })

      return rows.map((row) => ({
        id: row.id,
        profile_id: row.profileId,
        caption: row.caption,
        subtitle: row.subtitle,
        tagline: row.tagline,
        grid_position: row.gridPosition,
        status: row.status,
        scheduled_at: row.scheduledAt?.toISOString() ?? null,
        published_at: row.publishedAt?.toISOString() ?? null,
        created_at: row.createdAt.toISOString(),
        updated_at: row.updatedAt.toISOString(),
        media: row.media
      })) as Post[]
    },
    enabled: Boolean(profileId),
    staleTime: 1000 * 60 * 2
  })
}

async function savePostMutationFn(vars: SavePostMutationInput): Promise<Post> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
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
  let postData: Post

  if (isEditing && postId) {
    const [updated] = await rlsQuery(user.id, async (tx) => {
      return await tx
        .update(posts)
        .set({
          caption: caption || null,
          subtitle: subtitle || null,
          tagline: tagline || null,
          status,
          scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
          updatedAt: new Date()
        })
        .where(eq(posts.id, postId!))
        .returning()
    })
    postData = toPost(updated, [])
  } else {
    const [inserted] = await rlsQuery(user.id, async (tx) => {
      return await tx
        .insert(posts)
        .values({
          profileId,
          caption: caption || null,
          subtitle: subtitle || null,
          tagline: tagline || null,
          gridPosition: nextPosition,
          status,
          scheduledAt: scheduledAt ? new Date(scheduledAt) : null
        })
        .returning()
    })
    postId = inserted.id
    postData = toPost(inserted, [])
  }

  if (!postId) throw new Error('Missing post id')

  const uploadedMedia: PostMedia[] = []

  // Delete removed media (storage + DB)
  if (isEditing && post) {
    const currentIds = new Set(mediaItems.filter((m) => !m.isNew).map((m) => m.id))
    const toDelete = post.media.filter((m) => !currentIds.has(m.id))

    for (const media of toDelete) {
      const path = extractPostsBucketObjectPath(media.media_url)
      if (path) {
        await supabase.storage.from(supabaseStorageBucketPosts).remove([path])
      }
      await rlsQuery(user.id, async (tx) => {
        await tx.delete(postMedia).where(eq(postMedia.id, media.id))
      })
    }
  }

  // Upload new media and update positions
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

      const [inserted] = await rlsQuery(user.id, async (tx) => {
        return await tx
          .insert(postMedia)
          .values({
            postId: postId!,
            mediaUrl: urlData.publicUrl,
            mediaType: item.type,
            position: i
          })
          .returning()
      })
      uploadedMedia.push(toPostMedia(inserted))
    } else {
      const [updated] = await rlsQuery(user.id, async (tx) => {
        return await tx
          .update(postMedia)
          .set({ position: i })
          .where(eq(postMedia.id, item.id))
          .returning()
      })
      uploadedMedia.push(toPostMedia(updated))
    }
  }

  postData.media = uploadedMedia

  // Sync tag set associations
  if (postId) {
    await rlsQuery(user.id, async (tx) => {
      await tx.delete(postTagSets).where(eq(postTagSets.postId, postId!))
      if (tagSetIds.length > 0) {
        const rows = tagSetIds.map((tagSetId) => ({ postId: postId!, tagSetId }))
        await tx.insert(postTagSets).values(rows)
      }
    })
  }

  return postData
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
  const { data: { user } } = await supabase.auth.getUser()
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

  await rlsQuery(user.id, async (tx) => {
    await tx.delete(posts).where(eq(posts.id, post.id))
  })
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
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not signed in')

  await rlsQuery(user.id, async (tx) => {
    for (let i = 0; i < vars.orderedPosts.length; i++) {
      await tx
        .update(posts)
        .set({ gridPosition: i })
        .where(eq(posts.id, vars.orderedPosts[i].id))
    }
  })
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

/** Map a Drizzle post row to the Post domain type. */
function toPost(
  row: typeof posts.$inferSelect,
  media: PostMedia[]
): Post {
  return {
    id: row.id,
    profile_id: row.profileId,
    caption: row.caption,
    subtitle: row.subtitle,
    tagline: row.tagline,
    grid_position: row.gridPosition,
    status: row.status,
    scheduled_at: row.scheduledAt?.toISOString() ?? null,
    published_at: row.publishedAt?.toISOString() ?? null,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
    media
  }
}

/** Map a Drizzle postMedia row to the PostMedia domain type. */
function toPostMedia(row: typeof postMedia.$inferSelect): PostMedia {
  return {
    id: row.id,
    post_id: row.postId,
    media_url: row.mediaUrl,
    media_type: row.mediaType,
    position: row.position,
    created_at: row.createdAt.toISOString()
  }
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
