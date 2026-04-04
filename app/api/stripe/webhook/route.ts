import { NextResponse, type NextRequest } from 'next/server'
import { eq } from 'drizzle-orm'
import type Stripe from 'stripe'
import { customers, subscriptions } from '@/schema/subscriptions'
import { db } from '@/utils/database'
import { stripe } from '@/utils/stripe'

const runtime = 'nodejs'

/** Extract period timestamps from a subscription's first item. */
function extractPeriod(subscription: Stripe.Subscription) {
  const item = subscription.items.data[0]
  return {
    start: item ? new Date(item.current_period_start * 1000) : null,
    end: item ? new Date(item.current_period_end * 1000) : null
  }
}

async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode === 'subscription' && session.subscription && session.customer) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
        const customerId =
          typeof session.customer === 'string' ? session.customer : session.customer.id

        const [customerRow] = await db
          .select({ id: customers.id })
          .from(customers)
          .where(eq(customers.stripeCustomerId, customerId))

        if (customerRow) {
          const period = extractPeriod(subscription)
          await db
            .insert(subscriptions)
            .values({
              userId: customerRow.id,
              stripeSubscriptionId: subscription.id,
              stripePriceId: subscription.items.data[0]?.price?.id ?? null,
              status: 'active',
              currentPeriodStart: period.start,
              currentPeriodEnd: period.end,
              cancelAtPeriodEnd: subscription.cancel_at_period_end
            })
            .onConflictDoUpdate({
              target: subscriptions.stripeSubscriptionId,
              set: {
                stripePriceId: subscription.items.data[0]?.price?.id ?? null,
                status: 'active',
                currentPeriodStart: period.start,
                currentPeriodEnd: period.end,
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
                updatedAt: new Date()
              }
            })
        }
      }
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const statusMap: Record<string, 'active' | 'canceled' | 'past_due' | 'inactive'> = {
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
      await db
        .update(subscriptions)
        .set({
          status: statusMap[subscription.status] ?? 'inactive',
          stripePriceId: subscription.items.data[0]?.price?.id ?? null,
          currentPeriodStart: period.start,
          currentPeriodEnd: period.end,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          updatedAt: new Date()
        })
        .where(eq(subscriptions.stripeSubscriptionId, subscription.id))
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      await db
        .update(subscriptions)
        .set({
          status: 'canceled',
          cancelAtPeriodEnd: false,
          updatedAt: new Date()
        })
        .where(eq(subscriptions.stripeSubscriptionId, subscription.id))
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
        await db
          .update(subscriptions)
          .set({
            status: 'past_due',
            updatedAt: new Date()
          })
          .where(eq(subscriptions.stripeSubscriptionId, subscriptionId))
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}

export { POST, runtime }
