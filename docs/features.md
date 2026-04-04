# Features

Maps each major feature to its entrypoint file so developers can quickly find where to start.

| Feature | Entrypoint |
|---------|-----------|
| Post Editor / Adder | `components/organisms/post-edit-dialog.tsx` |
| Post Grid (Plan) | `components/sections/plan-view.tsx` |
| Collections | `components/sections/collect-view.tsx` |
| Tag Sets | `components/organisms/tag-set-edit-dialog.tsx` |
| Settings | `components/sections/settings-view.tsx` |
| Landing Page | `app/page.tsx` |
| Auth | `queries/auth.ts` |
| Subscriptions | `queries/subscription.ts` |
| Profile Management | `components/organisms/profile-edit-dialog.tsx` |

## Query Hooks

All data fetching uses TanStack Query for cross-platform portability.

| Hook | File | Purpose |
|------|------|---------|
| `useUserQuery` | `queries/user.ts` | Current auth user |
| `useProfilesQuery` | `queries/profile.ts` | User's profiles |
| `usePostsQuery` | `queries/posts.ts` | Posts for a profile |
| `useCollectionsQuery` | `queries/collections.ts` | Collections for a profile |
| `useTagSetsQuery` | `queries/tag-sets.ts` | Tag sets for a profile |
| `useSubscriptionQuery` | `queries/subscription.ts` | Subscription status |

## Database Migrations

Apply schema with Drizzle: `pnpm db:migrate` (see `databases/migrations/`). The `posts` storage bucket and `storage.objects` policies live in `databases/migrations/0001_posts_storage_bucket.sql`.
