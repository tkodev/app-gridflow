import { NextResponse, type NextRequest } from 'next/server'
import type Stripe from 'stripe'
import { supabaseTableSubscriptions } from '@/constants/db'
import { stripe } from '@/utils/stripe'
import { createClient } from '@/utils/supabase-server'

export const runtime = 'nodejs'

/** Extract period timestamps from a subscription's first item. */
function extractPeriod(subscription: Stripe.Subscription) {
  const item = subscription.items.data[0]
  return {
    start: item ? new Date(item.current_period_start * 1000).toISOString() : null,
    end: item ? new Date(item.current_period_end * 1000).toISOString() : null
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const supabase = await createClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode === 'subscription' && session.subscription && session.customer) {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        )
        const customerId =
          typeof session.customer === 'string' ? session.customer : session.customer.id

        const { data: customerRow } = await supabase
          .from('customers')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (customerRow) {
          const period = extractPeriod(subscription)
          await supabase.from(supabaseTableSubscriptions).upsert({
            user_id: customerRow.id,
            stripe_subscription_id: subscription.id,
            stripe_price_id: subscription.items.data[0]?.price?.id ?? null,
            status: 'active',
            current_period_start: period.start,
            current_period_end: period.end,
            cancel_at_period_end: subscription.cancel_at_period_end
          })
        }
      }
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const statusMap: Record<string, string> = {
        active: 'active',
        canceled: 'canceled',
        past_due: 'past_due',
        unpaid: 'past_due',
        incomplete: 'inactive',
        incomplete_expired: 'inactive',
        trialing: 'active',
        paused: 'inactive'
      }

      const period = extractPeriod(subscription)
      await supabase
        .from(supabaseTableSubscriptions)
        .update({
          status: statusMap[subscription.status] ?? 'inactive',
          stripe_price_id: subscription.items.data[0]?.price?.id ?? null,
          current_period_start: period.start,
          current_period_end: period.end,
          cancel_at_period_end: subscription.cancel_at_period_end,
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', subscription.id)
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      await supabase
        .from(supabaseTableSubscriptions)
        .update({
          status: 'canceled',
          cancel_at_period_end: false,
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', subscription.id)
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      // In Stripe v21, subscription info is in parent.subscription_details
      const parent = invoice.parent as unknown as {
        subscription_details?: { subscription?: string }
      } | null
      const subscriptionId = parent?.subscription_details?.subscription
      if (subscriptionId) {
        await supabase
          .from(supabaseTableSubscriptions)
          .update({
            status: 'past_due',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscriptionId)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
