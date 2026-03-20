import { createClient } from "@/lib/supabase/server";
import { ProfileHeader } from "@/components/profiles/profile-header";
import { PostsGrid } from "@/components/profiles/posts-grid";

export default async function ProfilesPage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("user_id", user!.id)
    .order("grid_position", { ascending: true });

  return (
    <div className="py-6">
      <ProfileHeader profile={profile} postsCount={posts?.length || 0} />
      <PostsGrid initialPosts={posts || []} />
    </div>
  );
}
