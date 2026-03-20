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
  - Playwright — end-to-end testing
  - [@tkodev's next eslint config](https://github.com/tkodev/config-eslint-next) - Additional eslint config
- Data
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

```typescript
// ✅ Good
interface PostProps {
  post: Post
  onEdit: (post: Post) => void
}

// ❌ Avoid
type PostProps = { post: any; onEdit: Function }
```

## Hooks

- Concentrate actions/logic here

## Pages

- Pages combine React components, content, and hooks. They are the main source of truth for the composition of a page.

All pages share a common header bar. Pages that use a sidebar share the same sidebar component. For visual design principles, see [design.md](/docs/design.md).

## React Components

- Responsive (Desktop, tablet, mobile support)
- Components should not contain content or business logic, this should be supplied via props or children
- Reuse components where possible
- Use functional components with TypeScript interfaces
- Prefer named exports; colocate component types in the same file
- Use `"use client"` only when necessary

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

## Tailwind CSS

- Use semantic tokens (`bg-background`, `text-foreground`, etc.)
- Use `gap-*` for spacing; avoid arbitrary values

```tsx
// ✅ Good
<div className="flex items-center gap-4 p-4 bg-card rounded-lg border">

// ❌ Avoid
<div className="flex items-center p-[17px] bg-white dark:bg-gray-800 rounded-[10px]">
```

**Post status classes**: `bg-scheduled`, `bg-draft`, `bg-published` (and `text-*` variants)

## Patterns

- State: `useState` for local state; Server Components + Server Actions for server state; `useOptimistic` for optimistic UI updates
- Dialogs: always include `<DialogTitle>` and `<DialogDescription>`
- Place shared types in `/lib/types.ts`; extract reusable logic into `/hooks`

## Accessibility

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
