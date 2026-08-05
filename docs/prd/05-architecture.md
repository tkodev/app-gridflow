# Architecture

## Stack

Next.js (App Router) · Tailwind CSS · shadcn/ui (includes dark mode) · Radix UI (primitives
with no shadcn/ui equivalent) · React · TanStack Query · React Hook Form · Framer Motion
(scroll, animations, gestures). PNPM only, Node 24, deployed on Vercel Serverless.

**Data & backend:** TanStack Query (`@tanstack/react-query`) for async state over browser
Supabase calls, with hooks/helpers in `queries/`. Supabase provides the database, auth, and
storage. Cron is reserved for the post-scheduling stretch feature (see `01-brief.md`).

Note: this is not the Next.js version most training data describes — APIs, conventions, and
layout can differ. Read the relevant guide under `node_modules/next/dist/docs/` before
writing Next-specific code, and heed deprecation notices.

## Repo structure

```text
.
├── docs/prd/          # this pipeline
├── app/               # Next.js App Router routes
├── components/
│   ├── providers/     # tree wrappers (e.g. TanStack QueryClientProvider) — logic/context only
│   └── ...            # UI components
├── queries/           # TanStack Query only: useMutation/useQuery, mutationFn/queryFn, keys.ts
├── types/             # shared TypeScript shapes (domain models, mutation inputs)
├── constants/         # app-wide constants, camelCase (Supabase table/bucket names, routes, limits)
├── utils/             # pure helpers, formatting, integration glue (Supabase clients, cn, etc.)
└── hooks/             # non–data-fetching reusable UI logic
```

## Data layer

- **TanStack Query owns all async state.** Colocate `useMutation`/`useQuery` and shared
  `mutationFn` helpers under `queries/`, keyed via `queries/keys.ts`. Import from the file
  that defines them (`@/queries/<name>`) — no barrel `queries/index.ts`. SWR was removed in
  favour of TanStack Query; don't reintroduce it.
- **Supabase** is the database/auth/storage backend, accessed via browser client calls
  wrapped in the TanStack Query hooks above.
- **Non-fetching state:** `useState` for local UI state, Server Components for initial
  server data, `useOptimistic` for optimistic UI where it fits.
- **Forms** go through React Hook Form (`useForm`, `register`, `handleSubmit`) for field
  state and validation; `useState` stays for non-plain-input state (e.g. the post media
  grid's drag-and-drop, avatar file preview).
