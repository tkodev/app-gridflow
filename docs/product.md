# Product Scope

> This file defines **what the product does and how it should feel** — features, user flows, MVP boundaries, and per-page design intent. For page structure, routes, and technical implementation, see [tech.md](/docs/tech.md). For app-wide visual principles, see [design.md](/docs/design.md).

GridFlow is a visual Instagram content planning platform. Plan and arrange your feed in a true-to-life grid preview — so your profile always looks exactly the way you intend. In the MVP, GridFlow is a mockup and planning tool; direct Instagram connection and scheduling are stretch features.

The product should feel like “Instagram with scheduling”, not a traditional social media dashboard.
Use a clean, modern mobile-first layout inspired by Instagram, with minimal SaaS elements visible in the profiles interface.

## Pages

1. **Root**
   - SaaS marketing landing page
   - Clean, modern aesthetic that reflects the GridFlow brand
2. **Auth**
   - Sign in, sign up, sign out, forgot password
   - Minimal, centered layout consistent with the overall app theme
3. **Profiles**
   - Profile section — styled like an IG profile header; the username acts as a dropdown to switch profiles, with a "Manage profiles" link to Settings
   - Controls section — toggle between grid and feed views; add post button
   - Main view:
     - Grid view — visual layout planning with drag-and-drop reordering
     - Feed view — scrollable post-by-post view
     - Post Preview mirrors the IG post format — username, optional subtitle (e.g. song/location line), image/video carousel, caption, and a three-dot edit button
     - Each post supports multiple images/video, an optional subtitle line, people tags (text only), and a posting date
4. **Settings**
   - Add / remove profiles (each profile will eventually connect to an Instagram account; no social linking in MVP)
   - Account settings (email, password)
   - Standard settings layout — list-based, clearly sectioned
   - Subscriptions and billing deferred to stretch
5. **Admin**
   - User management and the ability to impersonate users
   - Functional, data-focused layout
   - Not implemented in MVP

## Routes

```txt
/ - landing
/profiles - core app — profile grid and feed planner
/settings - user's settings
/admin - admin/superadmin stuff
/auth - sign-in, sign-out, sign-up, forgot-pw
```

## MVP features

- Auth — fully supported
- Profiles — edit and view profile info; create, upload, preview, edit, and reorder posts; grid and feed views
- Settings — add and remove profiles (no Instagram connection yet); account settings
- Admin — not implemented

## Stretch features

- Social media account connection (API)
- Post scheduling and auto-publish
- Collaborators
- Billing and subscriptions
