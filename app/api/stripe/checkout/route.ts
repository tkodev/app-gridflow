import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { stripeCreatorProPriceId } from '@/constants/stripe'
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

  // Get or create Stripe customer
  const [existing] = await db
    .select({ stripeCustomerId: customers.stripeCustomerId })
    .from(customers)
    .where(eq(customers.id, user.id))

  let stripeCustomerId = existing?.stripeCustomerId

  if (!stripeCustomerId) {
    const stripeCustomer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id }
    })
    stripeCustomerId = stripeCustomer.id

    await db.insert(customers).values({ id: user.id, stripeCustomerId }).onConflictDoUpdate({
      target: customers.id,
      set: { stripeCustomerId }
    })
  }

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    mode: 'subscription',
    line_items: [{ price: stripeCreatorProPriceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/settings?checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/settings?checkout=canceled`
  })

  return NextResponse.json({ url: session.url })
}

export { POST }
