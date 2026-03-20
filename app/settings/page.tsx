import { createClient } from "@/utils/supabase-server";
import { ProfilesManager } from "@/components/settings/profiles-manager";
import type { Profile } from "@/types/profile";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profilesRaw } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: true });

  const profiles = (profilesRaw ?? []) as Profile[];

  return (
    <div className="py-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="mt-1 text-muted-foreground">
        Manage your profiles and account
      </p>

      <div className="mt-8">
        <ProfilesManager profiles={profiles} userEmail={user!.email || ""} />
      </div>
    </div>
  );
}
