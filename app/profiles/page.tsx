import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileHeader } from "@/components/profiles/profile-header";
import { PostsGridView } from "@/components/profiles/posts-grid-view";
import { ProfileMissingView } from "@/components/profiles/profile-missing-view";
import type { Profile } from "@/types/profile";
import type { Post } from "@/types/post";

export default async function ProfilesPage({
  searchParams,
}: {
  searchParams: Promise<{ profile?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profilesRaw } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const profiles = (profilesRaw ?? []) as Profile[];

  if (profiles.length === 0) {
    return <ProfileMissingView />;
  }

  const currentProfileId = params.profile || profiles[0].id;
  const profile = profiles.find((p) => p.id === currentProfileId) ?? profiles[0];

  // Fetch posts for current profile with their media
  const { data: postsRaw } = await supabase
    .from("posts")
    .select(
      `
      id,
      profile_id,
      caption,
      subtitle,
      grid_position,
      status,
      scheduled_at,
      published_at,
      created_at,
      updated_at,
      post_media(*)
    `
    )
    .eq("profile_id", profile.id)
    .order("grid_position", { ascending: true });

  const posts: Post[] = (postsRaw ?? []).map((row) => {
    const { post_media, ...rest } = row as typeof row & {
      post_media?: Post["media"];
    };
    return {
      ...rest,
      media: (post_media ?? []).sort((a, b) => a.position - b.position),
    };
  });

  return (
    <div className="py-6">
      <ProfileHeader profile={profile} profiles={profiles} postsCount={posts?.length || 0} />
      <PostsGridView initialPosts={posts || []} profile={profile} />
    </div>
  );
}
