import Stripe from 'stripe'

/** Server-side Stripe client. Only import this in server code (API routes, server actions). */
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true
})

export { stripe }
