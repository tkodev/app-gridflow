# Tech stack & conventions

> This file defines **how the product is built** — technology choices, routes, page/component structure, and code conventions. For features and product behaviour, see [product.md](/docs/product.md). For visuals, see [design.md](/docs/design.md).

## Environment & package management

| Item | Notes |
| --- | --- |
| Package manager | PNPM only — use `pnpm` for all package commands. Do not use `npm` or `yarn`. |
| Node | 24 |
| Deployment | Ready for Vercel Serverless |

Common PNPM commands: `pnpm add` (deps), `pnpm add -D` (dev deps), `pnpm remove`, `pnpm install`, `pnpm run <script>`.

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

## Next.js

This is not the Next.js version most training data describes: APIs, conventions, and file layout can differ. Before writing Next-specific code, read the relevant guide under `node_modules/next/dist/docs/` and heed deprecation notices.

Use the `src` folder convention for the app.

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

## Repository layout

| Folder | Purpose |
| --- | --- |
| [`utils/`](/utils/) | Pure helpers, formatting, small algorithms, and integration glue that does not belong elsewhere (e.g. Supabase `createClient` for browser/server, proxy/session helpers, Tailwind `cn`). |
| [`types/`](/types/) | Shared TypeScript shapes used in multiple places (domain models, mutation inputs, etc.). |
| [`queries/`](/queries/) | TanStack Query only: `useMutation` / `useQuery`, `mutationFn` / `queryFn`, and [`keys.ts`](/queries/keys.ts). No React providers and no generic utilities here. |
| [`constants/`](/constants/) | App-wide constants (Supabase table and bucket names, query defaults, routes, limits such as max post media). |

React providers that wrap the tree (e.g. TanStack `QueryClientProvider`) belong in [`components/providers/`](/components/providers/), not in `queries/`. Provider modules are logic/context wrappers only: they do not use the `cva` styling pattern, and their exported components do not need a `className` prop or other presentational styling API.

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

## Pages

- Pages assemble React components, content, and hooks; they are the main place that defines how a screen is composed.
- All pages share a common header bar. Pages that use a sidebar share the same sidebar component. Visual principles: [design.md](/docs/design.md).
- **Exports:** `app/**/page.tsx` and `app/**/layout.tsx` must export the route component **only** as the **default** export. Do not add a named export for the page or layout component (Next.js App Router convention; keeps route modules unambiguous). Other named exports in those files (e.g. `metadata`, `generateMetadata`, `viewport`) are fine when the framework allows them.

## React components

- Support responsive layouts (desktop, tablet, mobile).
- Keep components presentational: supply content and business logic via props or children, not inside the component.
- Reuse components where it makes sense.
- **Structure:** New UI components must follow one of the two canonical layouts in [`components/atoms/example-base.tsx`](/components/atoms/example-base.tsx) and [`components/atoms/example-ref.tsx`](/components/atoms/example-ref.tsx) — pick the one that fits (see below).
  - Use the file as a starting point: same section order (styles & constants → types → component → exports), TypeScript props colocated in the same file. Prefer named exports; default export is optional and matches those examples when used.
  - Inside `// 3. component`, the examples use lettered subsections (`// a. props`, `// b. hooks`, `// c. logic`, `// d. component`). **Omit the comment line for any subsection that has no code** — do not leave empty `// b. hooks` / `// c. logic` (or other) placeholders when that block is unused.
  - **Styling:** Do not put class strings (literals, template literals, or `cn("a", "b")`-style ad hoc lists) in `className={}` on elements in UI modules. This applies to everything under [`components/`](/components/), [`app/`](/app/) (pages, layouts, `layout.tsx`), and other React UI files in the repo. Always define styles with `cva()` (class-variance-authority), usually on a `styles` object whose values are `cva(...)` builders; use the variant system (`variants`, `compoundVariants`, `defaultVariants`) whenever classes differ by prop, state, or size. Every `className={...}` should resolve through those builders (e.g. `className={cn(styles.root({ className }))}` on the root, `className={styles.toolbar()}` on inner nodes). Use `VariantProps<typeof styles.<slot>>` where variants apply. Narrow exceptions: a third-party API that requires a raw `className` string (prefer a `cva` slot plus `cn` when merging is allowed), or framework glue such as `next/font` variable classes merged on `<html>` / `<body>` in the root layout.
  - **Root `className` prop:** Exported components must accept `className?: string` and merge it into the root slot via `cva` (as in the examples), so parents can extend layout or spacing.
  - **Shared slots in one file:** Multiple elements may reuse the same `cva` definition when they share the same classes — for example, a single `styles.iconSm` used for several Lucide icons of the same size avoids duplication. You do not need a separate `cva` per element if the class string is identical.
- **Base (`example-base.tsx`):** Use when callers do not need a ref to the root DOM node (`React.FC<…>`).
- **With ref (`example-ref.tsx`):** Use when the root element must accept a ref — focus, `useSortable`/measurement, or any parent that passes `ref` (`React.forwardRef` + `displayName`).
- Add `"use client"` only when required.
- Dialogs: always include `<DialogTitle>` and `<DialogDescription>`.

## Tailwind

- Follow the **React components** styling rule everywhere UI is composed: no inline class strings in `className={}` — only outputs of `cva()` (and `cn` when merging slots or `cva` results). The examples below illustrate token and layout choices; express them via `cva` in real files.
- Prefer semantic tokens (`bg-background`, `text-foreground`, etc.).
- Use `gap-*` for spacing; avoid arbitrary pixel values unless necessary.
- Use `size-*` when height and width (`h-*` and `w-*`) are the same.

### Responsive layout: 12-column grid

- Prefer Tailwind’s **12-column grid** for responsive layouts: `grid grid-cols-12` on the container, then `col-span-*` with breakpoint prefixes (`sm:col-span-6`, `md:col-span-4`, etc.) so columns reflow cleanly across breakpoints.
- For layouts that should stay **three equal columns** (e.g. profile grid, landing grid preview, post media thumbnails), use `grid-cols-12` with **`col-span-4`** on each cell (three × four = twelve).

```tsx
// ✅ Good
<div className="flex items-center gap-4 p-4 bg-card rounded-lg border">

// ❌ Avoid
<div className="flex items-center p-[17px] bg-white dark:bg-gray-800 rounded-[10px]">
```

### Post status utility classes

- `bg-scheduled`, `bg-draft`, `bg-published` (and matching `text-*` variants).

## Accessibility

- Prefer semantic HTML (`main`, `header`, `nav`, `button`).
- Add ARIA labels where needed; use `sr-only` for text meant only for screen readers.
- Ensure keyboard navigation works inside modals and dialogs.

---
