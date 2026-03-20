import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileHeader } from "@/components/profiles/profile-header";
import { PostsGrid } from "@/components/profiles/posts-grid";
import { NoProfileState } from "@/components/profiles/no-profile-state";

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

  // Fetch all profiles for this user
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  // If no profiles exist, show empty state
  if (!profiles || profiles.length === 0) {
    return <NoProfileState />;
  }

  // Get current profile from URL or default to first profile
  const currentProfileId = params.profile || profiles[0].id;
  const profile = profiles.find((p) => p.id === currentProfileId) || profiles[0];

  // Fetch posts for current profile
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("profile_id", profile.id)
    .order("grid_position", { ascending: true });

  return (
    <div className="py-6">
      <ProfileHeader profile={profile} postsCount={posts?.length || 0} />
      <PostsGrid initialPosts={posts || []} profileId={profile.id} />
    </div>
  );
}
