# Tech Stack

> This file defines **how the product is built** — technology choices, routes, page/component structure, and code conventions. For features and product behaviour, see [product.md](/docs/product.md).

## Technologies

- Next.js (App Router)
- Tailwind CSS
- shadcn/ui (with dark mode support)
- Radix UI primitives where no shadcn/ui equivalent exists
- Supabase — database, auth, storage, cron (cron reserved for post scheduling stretch feature)
- React state: `useState`, `useOptimistic`, Server Actions
- react-hook-form — form state management and validation
- Drizzle ORM — type-safe SQL query builder and schema management
- Playwright — end-to-end testing

## Routes

```txt
/ - landing
/profiles - core app — profile grid and feed planner
/settings - user's settings
/admin - admin/superadmin stuff
/auth - sign-in, sign-out, sign-up, forgot-pw
```

## Page Structure

All pages share a common header bar. Pages that use a sidebar share the same sidebar component. For visual design principles, see [design.md](/docs/design.md).

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
