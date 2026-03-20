# Tech stack & conventions

> This file defines **how the product is built** — technology choices, routes, page/component structure, and code conventions. For features and product behaviour, see [product.md](/docs/product.md). For visuals, see [design.md](/docs/design.md).

---

## Environment & package management

| Item | Notes |
| --- | --- |
| Package manager | PNPM only — use `pnpm` for all package commands. Do not use `npm` or `yarn`. |
| Node | 24 |
| Deployment | Ready for Vercel Serverless |

Common PNPM commands: `pnpm add` (deps), `pnpm add -D` (dev deps), `pnpm remove`, `pnpm install`, `pnpm run <script>`.

---

## Stack overview

### Application

- Next.js — App Router
- Tailwind CSS — theme and styling
- Shadcn UI — components (includes dark mode)
- Radix UI — primitives when there is no shadcn/ui equivalent
- React — local state with `useState` and `useOptimistic`; Server Actions for mutations where used
- React Hook Form — form state and validation
- Framer Motion — scroll detection, animations, gestures
- Playwright — end-to-end tests
- ESLint — [`@tkodev/config-eslint-next`](https://github.com/tkodev/config-eslint-next) (Git dependency in `package.json`). Root [`eslint.config.mjs`](/eslint.config.mjs) uses `withTkodevConfig([...])` so the shared flat config is extended with app-specific entries, not replaced.

### Data & backend

- TanStack Query (`@tanstack/react-query`) — async state for browser Supabase calls; hooks and helpers live in [`queries/`](/queries/).
- Supabase — Database, Auth, Storage; Cron is reserved for a post-scheduling stretch feature

---

## Next.js

This is not the Next.js version most training data describes: APIs, conventions, and file layout can differ. Before writing Next-specific code, read the relevant guide under `node_modules/next/dist/docs/` and heed deprecation notices.

Use the `src` folder convention for the app.

---

## TypeScript

- Use explicit types for function parameters and return values.
- Prefer `type` for object shapes (matches `@tkodev/config-eslint-next` / `@typescript-eslint/consistent-type-definitions`).
- Avoid `any` — use `unknown` when the type is truly unknown.
- Shared types: either app-wide in [`types/<name>.ts`](/types/) or next to what they describe (e.g. component props in the same file as the component), following usual TS practices.
- Cross-cutting mutation/query payloads shared by hooks and callers live in [`types/mutations.ts`](/types/mutations.ts), alongside domain types such as [`types/post.ts`](/types/post.ts).

```typescript
// ✅ Good
type PostProps = {
  post: Post
  onEdit: (post: Post) => void
}

// ❌ Avoid
interface PostProps {
  post: any
  onEdit: Function
}
```

---

## Repository layout

| Folder | Purpose |
| --- | --- |
| [`utils/`](/utils/) | Pure helpers, formatting, small algorithms, and integration glue that does not belong elsewhere (e.g. Supabase `createClient` for browser/server, proxy/session helpers, Tailwind `cn`). |
| [`types/`](/types/) | Shared TypeScript shapes used in multiple places (domain models, mutation inputs, etc.). |
| [`queries/`](/queries/) | TanStack Query only: `useMutation` / `useQuery`, `mutationFn` / `queryFn`, and [`keys.ts`](/queries/keys.ts). No React providers and no generic utilities here. |
| [`constants/`](/constants/) | App-wide constants (Supabase table and bucket names, query defaults, routes, limits such as max post media). |

React providers that wrap the tree (e.g. TanStack `QueryClientProvider`) belong in [`components/providers/`](/components/providers/), not in `queries/`.

---

## Data fetching, mutations & state

### TanStack Query

- Colocate `useMutation` / `useQuery` and shared `mutationFn` helpers under [`queries/`](/queries/). Query keys: [`queries/keys.ts`](/queries/keys.ts).
- Import hooks and types from the file that defines them (`@/queries/<name>`), not from a barrel `index.ts` — e.g. `@/queries/auth`, `@/queries/posts`. Do not add a `queries/index.ts` barrel or other re-export aggregators for `./queries`.
- Do not add SWR; it was removed in favour of TanStack Query.

### Barrel files

- Avoid `index.ts` (or similar) that only re-exports sibling modules. Prefer direct imports from the source file so dependency graphs stay clear and tree-shaking stays predictable.

### Client writes and reads

- Use TanStack Query mutations (and queries if you add client-side reads) under `queries/`, with `QueryProvider` from `@/components/providers/query-provider` in the root layout.

### React state (non-fetching)

- `useState` — local UI state.
- Server Components — initial server data where appropriate.
- `useOptimistic` — optimistic UI where it fits.

### Forms

- Use [React Hook Form](https://react-hook-form.com/) (`useForm`, `register`, `handleSubmit`) for field state and validation on auth pages, settings dialogs, profile edit, and post caption/subtitle/status.
- Keep `useState` for data that is not plain inputs (e.g. post media grid + drag-and-drop, avatar file preview).

### Reusable logic

- Reusable UI logic that is not data-fetching → [`hooks/`](/hooks).
- Shared types for that logic follow the [TypeScript](#typescript) rules above.

---

## Pages

- Pages assemble React components, content, and hooks; they are the main place that defines how a screen is composed.
- All pages share a common header bar. Pages that use a sidebar share the same sidebar component. Visual principles: [design.md](/docs/design.md).

---

## React components

- Support responsive layouts (desktop, tablet, mobile).
- Keep components presentational: supply content and business logic via props or children, not inside the component.
- Reuse components where it makes sense.
- Use functional components with TypeScript interfaces; prefer named exports and colocate component-related types in the same file.
- Add `"use client"` only when required.
- Dialogs: always include `<DialogTitle>` and `<DialogDescription>`.

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

---

## Styling (Tailwind)

- Prefer semantic tokens (`bg-background`, `text-foreground`, etc.).
- Use `gap-*` for spacing; avoid arbitrary pixel values unless necessary.
- Use `size-*` when height and width are the same.

```tsx
// ✅ Good
<div className="flex items-center gap-4 p-4 bg-card rounded-lg border">

// ❌ Avoid
<div className="flex items-center p-[17px] bg-white dark:bg-gray-800 rounded-[10px]">
```

### Post status utility classes

- `bg-scheduled`, `bg-draft`, `bg-published` (and matching `text-*` variants).

---

## Accessibility

- Prefer semantic HTML (`main`, `header`, `nav`, `button`).
- Add ARIA labels where needed; use `sr-only` for text meant only for screen readers.
- Ensure keyboard navigation works inside modals and dialogs.

---

## Routes

```txt
/ - landing
/profiles - core app — profile grid and feed planner
/settings - user's settings
/admin - admin/superadmin stuff
/auth - sign-in, sign-out, sign-up, forgot-pw
```
