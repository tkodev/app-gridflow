# Posts Feature

> This document describes the posts feature in GridFlow, including media handling, carousel functionality, and post management.

## Overview

Posts are the core content unit in GridFlow. Each post belongs to a profile and can contain multiple images or videos displayed as a carousel, along with metadata like caption, subtitle, location, and status.

## Data Model

### Posts Table (`public.posts`)

| Column        | Type        | Description                                        |
| ------------- | ----------- | -------------------------------------------------- |
| id            | UUID        | Primary key                                        |
| profile_id    | UUID        | Foreign key to profiles                            |
| caption       | TEXT        | Post caption (optional)                            |
| subtitle      | TEXT        | Subtitle shown below username (e.g., song/location)|
| location      | TEXT        | Location tag (optional)                            |
| music         | TEXT        | Music tag (optional)                               |
| grid_position | INTEGER     | Position in the profile grid                       |
| status        | TEXT        | draft, scheduled, or published                     |
| scheduled_at  | TIMESTAMPTZ | Scheduled publish time (optional)                  |
| published_at  | TIMESTAMPTZ | Actual publish time (optional)                     |
| created_at    | TIMESTAMPTZ | Record creation time                               |
| updated_at    | TIMESTAMPTZ | Last update time                                   |

### Post Media Table (`public.post_media`)

| Column     | Type    | Description                              |
| ---------- | ------- | ---------------------------------------- |
| id         | UUID    | Primary key                              |
| post_id    | UUID    | Foreign key to posts                     |
| media_url  | TEXT    | URL to the image/video in storage        |
| media_type | TEXT    | "image" or "video"                       |
| position   | INTEGER | Order in the carousel (0-indexed)        |
| created_at | TIMESTAMPTZ | Record creation time                  |

## Features

### Multiple Media Per Post

- Each post can have one or more images/videos
- Media is stored in Supabase Storage (`posts` bucket)
- Path format: `{profile_id}/{post_id}/{filename}`
- Supported formats: Images (PNG, JPG, WEBP), Videos (MP4, MOV, WEBM)
- Max file size: 50MB for videos, 5MB for images

### Carousel Display

- Posts with multiple media show navigation controls
- Left/right arrows for navigation (hidden on single-media posts)
- Dot indicators showing current position
- Swipe support on touch devices

### Video Autoplay

- Videos autoplay when scrolled into view (Intersection Observer)
- Videos pause when scrolled out of view
- Videos are muted by default
- User can unmute by clicking the video

### Drag-and-Drop Reordering

- Media can be reordered within a post via drag-and-drop
- Uses @dnd-kit for drag functionality
- Position updates are saved to the database

## Storage Structure

```
posts/
  {profile_id}/
    {post_id}/
      {timestamp}-{random}.{ext}
```

## API Patterns

### Adding Media to Post

1. Upload file to Supabase Storage
2. Create post_media record with position
3. Return updated post with all media

### Reordering Media

1. Update position values for affected media
2. Revalidate post data

### Deleting Media

1. Remove from storage
2. Delete post_media record
3. Reorder remaining media positions

## Component Structure

- `PostFormDialog` - Unified dialog for creating and editing posts with media upload and drag-and-drop reordering
- `PostPreviewDialog` - Modal dialog for previewing a post from the grid
- `PostPreviewItem` - Display post preview with carousel and profile info
- `MediaCarousel` - Carousel component with navigation controls, dot indicators, and video autoplay
- `PostsFeedView` - Feed view with scroll-based video autoplay using framer-motion
- `PostSortableItem` - Grid item with drag-and-drop and multi-media indicator
