import { NextResponse } from 'next/server'
import { asc, eq, inArray } from 'drizzle-orm'
import { rlsQuery } from '@/databases/client'
import { postMedia, posts } from '@/schemas/posts'
import { postMediaRowToPostMedia, postRowToPost } from '@/utils/post-map'
import { sortPostMediaByPosition } from '@/utils/post-media'
import { createClient } from '@/utils/supabase-server'

async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const profileId = searchParams.get('profileId')
  if (!profileId) {
    return NextResponse.json({ error: 'profileId is required' }, { status: 400 })
  }

  const rows = await rlsQuery(user.id, async (tx) => {
    const postRows = await tx
      .select()
      .from(posts)
      .where(eq(posts.profileId, profileId))
      .orderBy(asc(posts.gridPosition))

    const postIds = postRows.map((p) => p.id)
    const mediaRows =
      postIds.length > 0
        ? await tx.select().from(postMedia).where(inArray(postMedia.postId, postIds))
        : []

    return postRows.map((post) => {
      const media = sortPostMediaByPosition(
        mediaRows.filter((m) => m.postId === post.id).map((m) => postMediaRowToPostMedia(m))
      )
      return postRowToPost(post, media)
    })
  })

  return NextResponse.json({ posts: rows })
}

type CreatePostBody = {
  profileId: string
  nextPosition: number
  caption: string | null
  subtitle: string | null
  tagline: string | null
  status: 'draft' | 'scheduled' | 'published'
  scheduledAt: string | null
}

async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: CreatePostBody
  try {
    body = (await request.json()) as CreatePostBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.profileId) {
    return NextResponse.json({ error: 'profileId is required' }, { status: 400 })
  }

  try {
    const [inserted] = await rlsQuery(user.id, async (tx) => {
      return await tx
        .insert(posts)
        .values({
          profileId: body.profileId,
          caption: body.caption || null,
          subtitle: body.subtitle || null,
          tagline: body.tagline || null,
          gridPosition: body.nextPosition,
          status: body.status,
          scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null
        })
        .returning()
    })

    return NextResponse.json({ post: postRowToPost(inserted, []) })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to create post'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export { GET, POST }
