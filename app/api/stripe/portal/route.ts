import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/databases/client'
import { customers } from '@/schemas/subscriptions'
import { stripe } from '@/utils/stripe'
import { createClient } from '@/utils/supabase-server'

async function POST() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [customer] = await db
    .select({ stripeCustomerId: customers.stripeCustomerId })
    .from(customers)
    .where(eq(customers.id, user.id))

  if (!customer?.stripeCustomerId) {
    return NextResponse.json({ error: 'No subscription found' }, { status: 404 })
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customer.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/settings`
  })

  return NextResponse.json({ url: session.url })
}

export { POST }
