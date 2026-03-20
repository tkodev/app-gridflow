export interface Post {
  id: string;
  profile_id: string;
  image_url: string;
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
}
