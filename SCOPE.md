---
description: Business behaviour and product feature scope. No structural or technical implementation details — those belong in STACK.md.
alwaysApply: true
---

# Project Scope

> This file defines **what the product does and why** — features, user flows, and MVP boundaries. For page structure, routes, and technical implementation, see [STACK.md](/STACK.md).

GridFlow is a visual Instagram content planning platform. Plan and arrange your feed in a true-to-life grid preview — so your profile always looks exactly the way you intend. In the MVP, GridFlow is a mockup and planning tool; direct Instagram connection and scheduling are stretch features.

## Pages

1. Root
   - Saas marketing landing page
2. Auth
   - Sign in
   - Sign out
   - Sign up
   - Forgot password
3. Profiles page - Looks very close to IG
   - Profile Header:
     - Details for the user's social profile; name acts as a dropdown to select a profile, with a "Manage profiles" link at the bottom that navigates to the Settings page.
   - Main:
     - View Controls: view buttons and create post button
     - Grid view: user profile grid + drag and drop reordering.
     - Feed view: shows post items in an infinite-scroll feed format — a core part of the IG experience alongside the grid.
   - Post Preview:
     - Just like IG's post preview: shows username, location/music (text string), image/video carousel, caption, and a three-dot button to edit a post.
   - Create/Edit Post dialog:
     - Supports multiple images/video per post
     - Location tagging and music (text only)
     - People tagging (text only)
     - Edit posting date
     - toggles for auto post and reminder
4. Settings:
   - Add / remove profiles (each profile will eventually connect to an Instagram account; no social linking in MVP)
   - Subscriptions (single tier for now)
   - Billing
   - Account settings (Email, passwords)
   - Sign out
5. Admin
   - Manage user settings
   - Impersonate users in the scheduler app
6. All Pages
   - Try to match IG layout for profile, but not exactly the same theme

## MVP features

This is core development

- Auth
  - Fully supported
- Profiles
  - Edit and view profile info
  - Posts: upload, preview, edit, drag-and-drop reordering
  - Grid view and feed view
- Settings
  - Add and remove profiles (no Instagram connection yet — profiles are placeholders for eventual IG accounts)
  - No subscription or billing support
  - Account settings
- Admin
  - Don't implement yet

## Stretch features

We will implement these at a later time

- Social media account connection (API)
- Post scheduling and auto-publish
- Collaborators
- Billing and subscriptions
