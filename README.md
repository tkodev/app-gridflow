# Gridflow

GridFlow is a visual Instagram content planning platform. Plan and arrange your feed in a true-to-life grid preview — so your profile always looks exactly the way you intend. In the MVP, GridFlow is a mockup and planning tool; direct Instagram connection and scheduling are stretch features.

## Tech Stack

- [Next.js](https://nextjs.org) + TypeScript
- [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- [Supabase](https://supabase.com) — auth, database, storage
- [Stripe](https://stripe.com) — subscription payments
- [TanStack Query](https://tanstack.com/query) — portable data fetching

## Docs

| File | Owns | Ask when… |
| --- | --- | --- |
| [tech.md](/docs/tech.md) | Tech stack, routes, page structure, and code conventions | How do I build it? |
| [design.md](/docs/design.md) | Visual design principles and Figma references | What should it look like? |
| [git.md](/docs/git.md) | Branch naming, commit conventions, and PR guidelines | How do I commit/PR? |
| [features.md](/docs/features.md) | Feature entrypoints and migration list | Where does feature X live? |

For developer & agent onboarding, read [CONTRIBUTING.md](/CONTRIBUTING.md).

## Preview Environments

### Auth in Previews

Supabase requires allowed redirect URLs for OAuth and magic links. For Vercel preview deployments:

1. Go to your Supabase project → Authentication → URL Configuration
2. Add a wildcard pattern for your preview URLs: `https://*-<your-team>.vercel.app/**`
3. Set `NEXT_PUBLIC_SITE_URL` in your Vercel project environment variables to `https://<your-project>.vercel.app` for production, and use the automatic `VERCEL_URL` env var for previews
4. The `.env.example` includes `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` for local dev overrides

### Payments in Previews

All non-production environments should use Stripe **test mode** keys:

1. Use `sk_test_*` and `pk_test_*` keys in preview/development environments
2. Set these as environment variables in Vercel for preview branches:
   - `STRIPE_SECRET_KEY` → your test secret key
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → your test publishable key
   - `STRIPE_WEBHOOK_SECRET` → your test webhook signing secret
3. For local development, use the Stripe CLI to forward webhooks:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
4. For preview deploys, add a webhook endpoint in the Stripe dashboard pointing to `https://<preview-url>/api/stripe/webhook`
5. Test card numbers: `4242 4242 4242 4242` (success), `4000 0000 0000 0002` (decline)

### Database in Previews

Recommended approach: use a **shared Supabase development project** for all preview deployments. RLS policies ensure data isolation between users. Set the Supabase URL and anon key as Vercel environment variables for preview branches.
