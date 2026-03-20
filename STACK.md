---
description: TypeScript, React, Tailwind, and accessibility code style guidelines
globs: **/*.{ts,tsx}
alwaysApply: false
---

# Stack

## Tech Stack

- Nextjs
- Tailwind
- Shadcn (with dark mode support)
- Radix primitives if no shadcn / magic ui / aceternity / etc equivalent
- Supabase db for databases
- Supabase auth for auth
- Supabase storage for media uploads
- Supabase cron for scheduled posts
- React/Next's useState, useOptimistic, server actions

## Routes

/ - landing
/profile - core app user's IG profiles / schedulers
/settings - user's settings
/admin - admin/superadmin stuff
/auth - sign-in, sign-out, sign-up, forgot-pw

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

- Pages combine react components usage, with content and hooks. It is main source of truth for the composition of a page.

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

- The application will have shared header bar regardless of page
- Pages that use a sidebar should use the same component for sidebars
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
