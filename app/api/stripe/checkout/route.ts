import { NextResponse } from 'next/server'
import { stripeCreatorProPriceId } from '@/constants/stripe'
import { supabaseTableCustomers } from '@/constants/db'
import { stripe } from '@/utils/stripe'
import { createClient } from '@/utils/supabase-server'

export async function POST() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get or create Stripe customer
  let { data: customer } = await supabase
    .from(supabaseTableCustomers)
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  let stripeCustomerId = customer?.stripe_customer_id

  if (!stripeCustomerId) {
    const stripeCustomer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id }
    })
    stripeCustomerId = stripeCustomer.id

    await supabase.from(supabaseTableCustomers).upsert({
      id: user.id,
      stripe_customer_id: stripeCustomerId
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
