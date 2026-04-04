import { NextResponse } from 'next/server'
import { and, eq, notInArray } from 'drizzle-orm'
import { rlsQuery } from '@/databases/client'
import { postMedia, posts } from '@/schemas/posts'
import { postTagSets } from '@/schemas/tag-sets'
import { postMediaRowToPostMedia, postRowToPost } from '@/utils/post-map'
import { sortPostMediaByPosition } from '@/utils/post-media'
import { createClient } from '@/utils/supabase-server'

type MediaSyncItem =
  | { isNew: true; mediaUrl: string; mediaType: 'image' | 'video'; position: number }
  | { isNew: false; id: string; position: number }

type PatchPostBody = {
  caption: string
  subtitle: string
  tagline: string
  status: 'draft' | 'scheduled' | 'published'
  scheduledAt: string | null
  tagSetIds: string[]
  mediaItems: MediaSyncItem[]
}

async function PATCH(request: Request, context: { params: Promise<{ postId: string }> }) {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: PatchPostBody
  try {
    body = (await request.json()) as PatchPostBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { postId } = await context.params

  if (!['draft', 'scheduled', 'published'].includes(body.status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  try {
    const result = await rlsQuery(user.id, async (tx) => {
      const updatedRows = await tx
        .update(posts)
        .set({
          caption: body.caption || null,
          subtitle: body.subtitle || null,
          tagline: body.tagline || null,
          status: body.status,
          scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
          updatedAt: new Date()
        })
        .where(eq(posts.id, postId))
        .returning()

      const updated = updatedRows[0]
      if (!updated) {
        return null
      }

      const idsToKeep = body.mediaItems.filter((m) => !m.isNew).map((m) => m.id)

      if (idsToKeep.length > 0) {
        await tx
          .delete(postMedia)
          .where(and(eq(postMedia.postId, postId), notInArray(postMedia.id, idsToKeep)))
      } else {
        await tx.delete(postMedia).where(eq(postMedia.postId, postId))
      }

      for (const m of body.mediaItems) {
        if (m.isNew) {
          await tx.insert(postMedia).values({
            postId,
            mediaUrl: m.mediaUrl,
            mediaType: m.mediaType,
            position: m.position
          })
        } else {
          await tx.update(postMedia).set({ position: m.position }).where(eq(postMedia.id, m.id))
        }
      }

      await tx.delete(postTagSets).where(eq(postTagSets.postId, postId))
      if (body.tagSetIds.length > 0) {
        await tx
          .insert(postTagSets)
          .values(body.tagSetIds.map((tagSetId) => ({ postId, tagSetId })))
      }

      const mediaRows = await tx.select().from(postMedia).where(eq(postMedia.postId, postId))
      const media = sortPostMediaByPosition(mediaRows.map((row) => postMediaRowToPostMedia(row)))

      return postRowToPost(updated, media)
    })

    if (!result) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json({ post: result })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Update failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

async function DELETE(_request: Request, context: { params: Promise<{ postId: string }> }) {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { postId } = await context.params

  try {
    const deleted = await rlsQuery(user.id, async (tx) => {
      const rows = await tx.delete(posts).where(eq(posts.id, postId)).returning({ id: posts.id })
      return rows[0]
    })

    if (!deleted) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Delete failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export { DELETE, PATCH }
