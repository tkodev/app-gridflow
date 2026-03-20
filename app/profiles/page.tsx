import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileHeader } from "@/components/profiles/profile-header";
import { PostsGridView } from "@/components/profiles/posts-grid-view";
import { ProfileMissingView } from "@/components/profiles/profile-missing-view";
import type { Profile } from "@/types/profile";

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
    .select("*, post_media(*)")
    .eq("profile_id", profile.id)
    .order("grid_position", { ascending: true });

  // Transform to include media array sorted by position
  const posts = (postsRaw ?? []).map((post) => ({
    ...post,
    media: (post.post_media ?? []).sort(
      (a: { position: number }, b: { position: number }) => a.position - b.position
    ),
    post_media: undefined, // Remove the raw field
  }));

  return (
    <div className="py-6">
      <ProfileHeader profile={profile} profiles={profiles} postsCount={posts?.length || 0} />
      <PostsGridView initialPosts={posts || []} profile={profile} />
    </div>
  );
}
