# Project Scope

GridFlow is a visual Instagram content management platform. Connect your Instagram profiles, schedule posts, and arrange your feed in a true-to-life grid preview — so your profile always looks exactly the way you intend.

## Pages

1. Root
   - Saas marketing landing page
2. Auth
   - Sign in
   - Sign out
   - Sign up
   - Forgot password
3. Profile page - Looks very close to IG
   - Profile Header:
     - Details for the user's social profile, name acts as a dropdown to select profile.
   - Main:
     - View Controls: view buttons and create post button
     - Grid view: user profile grid + drag and drop reordering.
     - Feed view: Shows post items in a feed like infinite scroller format.
   - Post Preview:
     - Just like IG's post preview: Shows username, location/music (text string), image/video carousel, caption and three dot  button to edit a post.
   - Create/Edit Post dialog:
     - supports multiple images/video per post,
     - location tagging/music (text only!),
     - tagging, text only!
     - edit posting date
     - toggles for auto post and reminder
4. Settings:
   - Add / remove social profiles
   - Subscriptions (single tier for now)
   - Billing
   - Account settings (Email, passwords)
   - Sign out
5. Admin
   - Manage users settings
   - Impersonate users scheduler app
6. All Pages
   - Try to match IG layout for profile, but not exactly the same theme

## MVP features

This is core development

- Auth
  - Fully supported
- Profiles
  - Edit and view profile info
  - Posts upload, preview, edit, drag and drop reordering
- Settings
  - Add and remove profiles (No social linking yet)
  - No subscription and billing support
  - Account settings
- Admin
  - Don't implement yet

## Stretch features

We will implement these at a later time

- Collaborators
- Social media account connection (api)
- Scheduling
- Billing and subscriptions
