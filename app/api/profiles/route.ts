import { NextResponse } from 'next/server'
import { asc, eq } from 'drizzle-orm'
import { rlsQuery } from '@/databases/client'
import { profiles } from '@/schemas/profiles'
import { profileRowToProfile } from '@/utils/profile-map'
import { createClient } from '@/utils/supabase-server'
import { sanitizeUsername } from '@/utils/username'

async function GET() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rows = await rlsQuery(user.id, async (tx) => {
    return await tx
      .select()
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .orderBy(asc(profiles.createdAt))
  })

  return NextResponse.json({ profiles: rows.map(profileRowToProfile) })
}

async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { username?: string }
  try {
    body = (await request.json()) as { username?: string }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.username?.trim()) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 })
  }

  try {
    const [inserted] = await rlsQuery(user.id, async (tx) => {
      return await tx
        .insert(profiles)
        .values({
          userId: user.id,
          username: sanitizeUsername(body.username!)
        })
        .returning()
    })

    return NextResponse.json({ profile: profileRowToProfile(inserted) })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to create profile'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export { GET, POST }
