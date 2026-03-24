# Tech stack & conventions

This file defines **how the product is built** — technology, routes, structure, and code rules. For product behaviour see [product.md](/docs/product.md); for visuals see [design.md](/docs/design.md).

## Environment & scripts

| Item | Rule |
| --- | --- |
| Package manager | **PNPM only** — `pnpm` for all package commands. Do not use `npm` or `yarn`. |
| Node | 24 |
| Deployment | Ready for Vercel Serverless |

Common commands: `pnpm add`, `pnpm add -D`, `pnpm remove`, `pnpm install`, `pnpm run <script>`.

## Stack

**Application:** Next.js (App Router) · Tailwind CSS (theme and styling) · Shadcn UI (includes dark mode) · Radix UI (primitives when there is no shadcn/ui equivalent) · React (`useState`, `useOptimistic`; Server Actions for mutations where used) · React Hook Form · Framer Motion (scroll, animations, gestures) · Playwright (e2e) · ESLint — [`@tkodev/config-eslint-next`](https://github.com/tkodev/config-eslint-next) (Git dependency in `package.json`). Root [`eslint.config.mjs`](/eslint.config.mjs) uses `withTkodevConfig([...])` so the shared flat config is **extended** with app-specific entries, **not** replaced.

**Data & backend:** TanStack Query (`@tanstack/react-query`) — async state for browser Supabase calls; hooks and helpers in [`queries/`](/queries/). Supabase — Database, Auth, Storage. Cron is reserved for a post-scheduling stretch feature.

## Next.js

- This is not the Next.js version most training data describes: APIs, conventions, and layout can differ. Before writing Next-specific code, read the relevant guide under `node_modules/next/dist/docs/` and heed deprecation notices.
- Use the **`src` folder** convention for the app.

## TypeScript

- Explicit types for function parameters and return values.
- Prefer `type` for object shapes (matches `@tkodev/config-eslint-next` / `@typescript-eslint/consistent-type-definitions`).
- Avoid `any` — use `unknown` when the type is truly unknown.
- Shared types: app-wide in [`types/<name>.ts`](/types/) or next to what they describe (e.g. component props in the same file), per usual TS practice.
- **Component props:** Prefer **one** `ComponentNameProps` type per file for the primary export. If you would split `BaseProps` and `ComponentProps`, merge them into a single `ComponentNameProps` when the base is only used once. **Export** that type when other modules need the shape (`export type ComponentNameProps = …` or `export type { ComponentNameProps }`). Compound UI that exposes several named subcomponents (e.g. `Card` + `CardHeader`) may use one `*Props` type per subcomponent; keep those **internal** unless a consumer needs them.
- Cross-cutting mutation/query payloads shared by hooks and callers live in [`types/mutations.ts`](/types/mutations.ts), alongside domain types such as [`types/post.ts`](/types/post.ts).
- **Constants:** values under [`constants/`](/constants/) (and other module-level constants) use **camelCase** — e.g. `maxPostMediaItems`, `supabaseTablePosts`, `routeProfiles`. Do **not** use `SCREAMING_SNAKE_CASE` for these. Names from the runtime environment (`process.env.*`) stay as defined by the platform.

## ES modules & exports

- Prefer a single export block, using named exports at the **end** of the file. For UI that follows the numbered section layout ([`components/atoms/example-base.tsx`](/components/atoms/example-base.tsx)), use **`// 4. exports`** as the final section.
- [`app/`](/app/):** Route files (`page.tsx`, `layout.tsx`, etc.) may use **`export default`** for the route component, plus any other patterns Next.js requires (`metadata`, `generateMetadata`, `viewport`, etc.).
- Avoid **`export default`** except where a tool requires it — e.g. [`next.config.ts`](/next.config.ts) uses default export as required by Next.js.

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
| [`utils/`](/utils/) | Pure helpers, formatting, small algorithms, integration glue (e.g. Supabase `createClient` for browser/server, proxy/session helpers, Tailwind `cn`). |
| [`types/`](/types/) | Shared TypeScript shapes used in multiple places (domain models, mutation inputs, etc.). |
| [`queries/`](/queries/) | TanStack Query only: `useMutation` / `useQuery`, `mutationFn` / `queryFn`, and [`keys.ts`](/queries/keys.ts). No React providers and no generic utilities here. |
| [`constants/`](/constants/) | App-wide constants in **camelCase** (Supabase table and bucket names, query defaults, routes, limits such as max post media). |

**Providers:** Tree wrappers (e.g. TanStack `QueryClientProvider`) belong in [`components/providers/`](/components/providers/), not in `queries/`. Provider modules are logic/context only: they do **not** use the `cva` styling pattern, and exported components do **not** need a `className` prop or other presentational styling API.

## Data fetching, mutations & state

### TanStack Query

- Colocate `useMutation` / `useQuery` and shared `mutationFn` helpers under [`queries/`](/queries/). Query keys: [`queries/keys.ts`](/queries/keys.ts).
- Import hooks and types from the file that defines them (`@/queries/<name>`), not from a barrel `index.ts` — e.g. `@/queries/auth`, `@/queries/posts`. **Do not** add `queries/index.ts` or other re-export aggregators for `./queries`.
- Do **not** add SWR; it was removed in favour of TanStack Query.

### Barrel files

- Avoid `index.ts` (or similar) that only re-exports sibling modules. Prefer direct imports from the source file so dependency graphs stay clear and tree-shaking stays predictable.

### Client reads/writes

- Use TanStack Query mutations (and queries if you add client-side reads) under `queries/`, with `QueryProvider` from `@/components/providers/query-provider` in the root layout.

### React state (non-fetching)

- `useState` — local UI state.
- Server Components — initial server data where appropriate.
- `useOptimistic` — optimistic UI where it fits.

### Forms

- Use [React Hook Form](https://react-hook-form.com/) (`useForm`, `register`, `handleSubmit`) for field state and validation on auth pages, settings dialogs, profile edit, and post caption/subtitle/status.
- Keep `useState` for data that is **not** plain inputs (e.g. post media grid + drag-and-drop, avatar file preview).

### Reusable UI logic

- Non–data-fetching reusable UI logic → [`hooks/`](/hooks/).
- Types for that logic follow the [TypeScript](#typescript) rules above.

## Pages

- Pages assemble React components, content, and hooks; they are the main place that defines how a screen is composed.
- All pages share a common header bar. Pages that use a sidebar share the same sidebar component. Visual principles: [design.md](/docs/design.md).
- **Exports:** `app/**/page.tsx` and `app/**/layout.tsx` default-export the route component; other route files follow Next.js as needed. See [ES modules & exports](#es-modules--exports) — rules for end-of-file exports do **not** apply under `app/`.

## React components

### Layout & behaviour

- Support responsive layouts (desktop, tablet, mobile).
- **Mobile-first:** Treat touch and small viewports as the default. Do **not** rely on hover to reveal essential controls — patterns such as `opacity-0` with `group-hover:opacity-100`, or hiding actions until `:hover`, fail on touch devices. Prefer always-visible affordances (or touch-friendly alternatives like explicit menus) for anything the user must reach to complete a task.
- Keep components presentational: supply content and business logic via props or children, not inside the component.
- Reuse components where it makes sense.
- Add `"use client"` only when required.
- **Dialogs:** Always include `<DialogTitle>` and `<DialogDescription>`.

### File structure (new components)

New UI must follow one of the two layouts in [`components/atoms/example-base.tsx`](/components/atoms/example-base.tsx) and [`components/atoms/example-ref.tsx`](/components/atoms/example-ref.tsx) — pick the one that fits.

- Use the file as a starting point: same section order (styles & constants → types → component → **`// 4. exports`**). Colocate TypeScript props in the same file as a single `MyComponentProps` when possible. Define the component as `const MyComponent = …` (or `React.forwardRef`) and finish with `export type { MyComponentProps }` (when consumers need the type) and `export { MyComponent }`. **Do not** use `export default` for components in [`components/`](/components/).
- The same end-of-file export pattern applies to [`constants/`](/constants/), [`hooks/`](/hooks/), [`queries/`](/queries/), [`types/`](/types/), [`utils/`](/utils/), and other non-`app` modules — use **`// exports`** at the end when the file does not use the numbered `1–4` layout.
- Compound modules (several related components or `cva` helpers such as `buttonVariants`) list every public symbol in the same exports block.
- Inside `// 3. component`, the examples use lettered subsections (`// a. props`, `// b. hooks`, `// c. logic`, `// d. component`). **Omit the comment line for any subsection that has no code** — do not leave empty `// b. hooks` / `// c. logic` (or other) placeholders when unused.
- **Base (`example-base.tsx`):** Use when callers do not need a ref to the root DOM node (`React.FC<…>`).
- **With ref (`example-ref.tsx`):** Use when the root must accept a ref — focus, `useSortable`/measurement, or any parent that passes `ref` (`React.forwardRef` + `displayName`).

### Styling (CVA everywhere)

Do **not** put class strings (literals, template literals, or `cn("a", "b")`-style ad hoc lists) in `className={}` on elements in UI modules. This applies to everything under [`components/`](/components/), [`app/`](/app/) (pages, layouts, `layout.tsx`), and other React UI files in the repo.

- Always define styles with `cva()` (class-variance-authority), usually on a `styles` object whose values are `cva(...)` builders; use `variants`, `compoundVariants`, and `defaultVariants` whenever classes differ by prop, state, or size.
- Every `className={...}` should resolve through those builders (e.g. `className={cn(styles.root({ className }))}` on the root, `className={cn(styles.toolbar())}` on inner nodes). Use `VariantProps<typeof styles.<slot>>` where variants apply.
- **Keep the `styles` object tidy:** every `cva` slot must be referenced from the component (or shared intentionally across elements); delete unused slots.
- **All Tailwind for that file** belongs in those `cva` definitions — do not leave one-off utility strings in JSX.
- **Narrow exceptions:** a third-party API that requires a raw `className` string (prefer a `cva` slot plus `cn` when merging is allowed), or framework glue such as `next/font` variable classes merged on `<html>` / `<body>` in the root layout.
- **Root `className` prop:** Exported components must accept `className?: string` and merge it into the root slot via `cva` (as in the examples), so parents can extend layout or spacing.
- **Shared slots:** Multiple elements may reuse the same `cva` definition when classes are identical — e.g. one `styles.iconSm` for several Lucide icons of the same size. You do not need a separate `cva` per element if the class string is identical.

The **Tailwind** subsection below is token/layout guidance; express it **via `cva` in real files**, not as raw strings in JSX.

## Tailwind (tokens & layout)

- Follow the **Styling (CVA everywhere)** rules above: no inline class strings in `className={}` — only outputs of `cva()` (and `cn` when merging slots or `cva` results).
- Prefer semantic tokens (`bg-background`, `text-foreground`, etc.).
- Use `gap-*` for spacing; avoid arbitrary pixel values unless necessary.
- Use `size-*` when height and width would be the same (`h-*` and `w-*`).

### Responsive: 12-column grid

- Prefer Tailwind’s **12-column grid**: `grid grid-cols-12` on the container, then `col-span-*` with breakpoint prefixes (`sm:col-span-6`, `md:col-span-4`, etc.) so columns reflow across breakpoints.
- For **three equal columns** (e.g. profile grid, landing grid preview, post media thumbnails), use `grid-cols-12` with **`col-span-4`** on each cell (three × four = twelve).

```tsx
// ✅ Good (express via cva in real components)
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
