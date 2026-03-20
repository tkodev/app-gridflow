# Tech Stack

> This file defines **how the product is built** — technology choices, routes, page/component structure, and code conventions. For features and product behaviour, see [product.md](/docs/product.md).

## Technologies

- Environment
  - PNPM - Package manager and runner
  - Node 24
  - Ready for Vercel Serverless
- Application
  - Next.js - App Router
  - Tailwind CSS - Theme / Styling
  - Shadcn UI - Components (with dark mode support)
  - Radix UI - Primitives where no shadcn/ui equivalent exists
  - React state: `useState`, `useOptimistic`, Server Actions
  - React Hook Form — form state management and validation
  - Framer Motion — scroll detection, animations, gesture handling
  - Playwright — end-to-end testing
  - [@tkodev's next eslint config](https://github.com/tkodev/config-eslint-next) - Additional eslint config
- Data
  - TanStack Query (`@tanstack/react-query`) — async state for browser Supabase calls; hooks and helpers live in [`./queries`](/queries/).
  - Supabase Database
  - Supabase Auth
  - Supabase Storage
  - Supabase Cron (cron reserved for post scheduling stretch feature)
  - Drizzle ORM — type-safe SQL query builder and schema management

## PNPM Only

- Use `pnpm` for all package management commands.
- Do not use `npm` or `yarn`.
- Prefer:
  - `pnpm add` for dependencies
  - `pnpm add -D` for dev dependencies
  - `pnpm remove` for removal
  - `pnpm install` for install
  - `pnpm run <script>` for scripts

## Next.js

This is NOT the Next.js you know!

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

Nextjs should use the `src` folder convention.

## TypeScript

- Use explicit types for function parameters and return values
- Prefer `interface` over `type` for object shapes
- Avoid `any` — use `unknown` if type is truly unknown
- Shared types should be defined either app wide (in `./types/<type>.ts`) or next to the object it's referring to (such as component props being in the same file as the component.). Utilize best practices for it.
- Cross-cutting mutation/query payloads shared by hooks and callers live in [`types/mutations.ts`](/types/mutations.ts) (alongside domain types like [`types/post.ts`](/types/post.ts)).

## Code layout

| Folder | Purpose |
| --- | --- |
| [`utils/`](/utils/) | Pure helpers, formatting, small algorithms, and integration glue that does not belong elsewhere (e.g. Supabase `createClient` for browser/server, middleware helpers, Tailwind `cn`). Post **media** (ordering, upload file extensions) — [`post-media.ts`](/utils/post-media.ts); Supabase **posts bucket** (URL paths, folder cleanup) — [`post-storage.ts`](/utils/post-storage.ts) |
| [`types/`](/types/) | Shared TypeScript shapes used in multiple places (domain models, mutation inputs, etc.) |
| [`queries/`](/queries/) | TanStack Query only: `useMutation` / `useQuery` hooks, `mutationFn` / `queryFn` implementations, and [`keys.ts`](/queries/keys.ts). No React providers, no generic utilities |
| [`constants/`](/constants/) | App-wide constants (Supabase table and bucket names, query defaults, routes, limits such as max post media) |

React providers that wrap the tree (e.g. TanStack `QueryClientProvider`) live under [`components/providers/`](/components/providers/), not in `queries/`.

```typescript
// ✅ Good
interface PostProps {
  post: Post
  onEdit: (post: Post) => void
}

// ❌ Avoid
type PostProps = { post: any; onEdit: Function }
```

## Hooks & Queries

- Concentrate reusable UI logic in [`./hooks`](/hooks) when it is not data-fetching
- **TanStack Query** — colocate `useMutation` / `useQuery` and shared `mutationFn` helpers under [`./queries`](/queries/) (see [`keys.ts`](/queries/keys.ts) for query keys). Import hooks and types from the file that defines them (`@/queries/<name>`), not from a barrel `index.ts`. Do not add SWR; it was removed in favour of TanStack Query.
- **Barrel files** — avoid `index.ts` (or similar) that only re-export sibling modules; prefer direct imports from the source file so dependency graphs stay obvious and tree-shaking stays predictable.
- Import from the specific module (e.g. `@/queries/auth`, `@/queries/posts`); do not add a `queries/index.ts` barrel or other re-export aggregators for `./queries`

## Pages

- Pages combine React components, content, and hooks. They are the main source of truth for the composition of a page.

All pages share a common header bar. Pages that use a sidebar share the same sidebar component. For visual design principles, see [design.md](/docs/design.md).

## Tailwind CSS

- Use semantic tokens (`bg-background`, `text-foreground`, etc.)
- Use `gap-*` for spacing; avoid arbitrary values
- Use `size-*` wherever `h-*` and `w-*` are the same value.

```tsx
// ✅ Good
<div className="flex items-center gap-4 p-4 bg-card rounded-lg border">

// ❌ Avoid
<div className="flex items-center p-[17px] bg-white dark:bg-gray-800 rounded-[10px]">
```

Post status classes: `bg-scheduled`, `bg-draft`, `bg-published` (and `text-*` variants)

## React Components

- Responsive (Desktop, tablet, mobile support)
- Components should not contain content or business logic, this should be supplied via props or children
- Reuse components where possible
- Use functional components with TypeScript interfaces
- Prefer named exports; colocate component types in the same file
- Use `"use client"` only when necessary
- Dialogs: always include `<DialogTitle>` and `<DialogDescription>`

```tsx
"use client"

interface MyComponentProps {
  title: string
  children: React.ReactNode
}

export function MyComponent({ title, children }: MyComponentProps) {
  return <div><h1>{title}</h1>{children}</div>
}
```

## React Hooks & State

- State: `useState` for local UI state; Server Components for initial server data; `useOptimistic` for optimistic UI where appropriate
- Client writes and refetches: TanStack Query mutations (and queries if you add client-side reads) under `./queries`, with `QueryProvider` from `@/components/providers/query-provider` in the root layout; consumers import hooks from `@/queries/<file>` directly
- Extract reusable non-data logic into `/hooks` (shared types follow the [TypeScript](#typescript) conventions above)

## React Accessibility

- Use semantic HTML (`main`, `header`, `nav`, `button`)
- Include ARIA labels where needed; use `sr-only` for screen reader text
- Ensure keyboard navigation works in modals/dialogs

## Routes

```txt
/ - landing
/profiles - core app — profile grid and feed planner
/settings - user's settings
/admin - admin/superadmin stuff
/auth - sign-in, sign-out, sign-up, forgot-pw
```
