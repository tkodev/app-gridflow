export interface PostMedia {
  id: string;
  post_id: string;
  media_url: string;
  media_type: "image" | "video";
  position: number;
  created_at: string;
}

export interface Post {
  id: string;
  profile_id: string;
  image_url: string; // Legacy field, kept for backward compatibility
  caption: string | null;
  subtitle: string | null;
  location: string | null;
  music: string | null;
  grid_position: number;
  status: "draft" | "scheduled" | "published";
  scheduled_at: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  media?: PostMedia[]; // Array of media items (images/videos)
}

// Local media item for form handling (before upload)
export interface LocalMediaItem {
  id: string;
  file?: File;
  url: string;
  type: "image" | "video";
  isNew: boolean; // true if file needs to be uploaded
}
