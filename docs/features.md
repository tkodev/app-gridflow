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

Run these in order against your Supabase project:

1. `scripts/001_create_tables.sql` — Initial schema
2. `scripts/002_restructure_profiles.sql` — Multi-profile per user
3. `scripts/003_create_storage_bucket.sql` — Storage buckets
4. `scripts/004_add_subtitle_grid_ratio_avatars.sql` — Column additions
5. `scripts/005_drop_posts_image_url.sql` — Schema cleanup
6. `scripts/006_drop_posts_location_music.sql` — Schema cleanup
7. `scripts/007_create_collections.sql` — Collections & collection_media
8. `scripts/008_create_tag_sets.sql` — Tag sets & post_tag_sets junction
9. `scripts/009_create_subscriptions.sql` — Customers & subscriptions
10. `scripts/010_add_tagline_to_posts.sql` — Tagline column on posts
