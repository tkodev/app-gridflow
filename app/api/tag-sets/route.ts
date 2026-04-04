import { NextResponse } from 'next/server'
import { desc, eq } from 'drizzle-orm'
import type { TagSet } from '@/types/tag-set'
import { rlsQuery } from '@/databases/client'
import { tagSets } from '@/schemas/tag-sets'
import { createClient } from '@/utils/supabase-server'

function toTagSet(row: typeof tagSets.$inferSelect): TagSet {
  return {
    id: row.id,
    profile_id: row.profileId,
    name: row.name,
    tags: row.tags,
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

  const rows = await rlsQuery(user.id, async (tx) => {
    return await tx
      .select()
      .from(tagSets)
      .where(eq(tagSets.profileId, profileId))
      .orderBy(desc(tagSets.createdAt))
  })

  return NextResponse.json({ tagSets: rows.map(toTagSet) })
}

type CreateBody = {
  profileId: string
  name: string
  tags: string
}

async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: CreateBody
  try {
    body = (await request.json()) as CreateBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.profileId || !body.name?.trim()) {
    return NextResponse.json({ error: 'profileId and name are required' }, { status: 400 })
  }

  try {
    const [inserted] = await rlsQuery(user.id, async (tx) => {
      return await tx
        .insert(tagSets)
        .values({ profileId: body.profileId, name: body.name, tags: body.tags })
        .returning()
    })

    return NextResponse.json({ tagSet: toTagSet(inserted) })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to create tag set'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export { GET, POST }
