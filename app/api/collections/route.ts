import { NextResponse } from 'next/server'
import { desc, eq, inArray } from 'drizzle-orm'
import type { Collection, CollectionMedia } from '@/types/collection'
import { rlsQuery } from '@/databases/client'
import { collectionMedia, collections } from '@/schemas/collections'
import { createClient } from '@/utils/supabase-server'

function toCollection(row: typeof collections.$inferSelect): Collection {
  return {
    id: row.id,
    profile_id: row.profileId,
    name: row.name,
    description: row.description,
    cover_url: row.coverUrl,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString()
  }
}

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

  const result = await rlsQuery(user.id, async (tx) => {
    const collectionRows = await tx
      .select()
      .from(collections)
      .where(eq(collections.profileId, profileId))
      .orderBy(desc(collections.createdAt))

    const collectionIds = collectionRows.map((c) => c.id)
    const mediaRows =
      collectionIds.length > 0
        ? await tx
            .select()
            .from(collectionMedia)
            .where(inArray(collectionMedia.collectionId, collectionIds))
        : []

    return collectionRows.map((c) => {
      const media = mediaRows
        .filter((m) => m.collectionId === c.id)
        .sort((a, b) => a.position - b.position)
        .map(
          (m): CollectionMedia => ({
            id: m.id,
            collection_id: m.collectionId,
            media_url: m.mediaUrl,
            media_type: m.mediaType,
            position: m.position,
            created_at: m.createdAt.toISOString()
          })
        )

      return { ...toCollection(c), media } as Collection & { media: CollectionMedia[] }
    })
  })

  return NextResponse.json({ collections: result })
}

type CreateCollectionBody = {
  profileId: string
  name: string
  description: string
}

async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: CreateCollectionBody
  try {
    body = (await request.json()) as CreateCollectionBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.profileId || !body.name?.trim()) {
    return NextResponse.json({ error: 'profileId and name are required' }, { status: 400 })
  }

  try {
    const [inserted] = await rlsQuery(user.id, async (tx) => {
      return await tx
        .insert(collections)
        .values({
          profileId: body.profileId,
          name: body.name,
          description: body.description || null
        })
        .returning()
    })

    return NextResponse.json({ collection: toCollection(inserted) })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to create collection'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export { GET, POST }
