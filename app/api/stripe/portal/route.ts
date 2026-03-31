import { NextResponse } from 'next/server'
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

  const { data: customer } = await supabase
    .from(supabaseTableCustomers)
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  if (!customer?.stripe_customer_id) {
    return NextResponse.json({ error: 'No subscription found' }, { status: 404 })
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customer.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/settings`
  })

  return NextResponse.json({ url: session.url })
}
