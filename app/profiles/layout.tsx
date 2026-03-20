import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase-server";
import { AppHeader } from "@/components/app/header";

export default async function ProfilesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader user={user} />
      <main className="mx-auto max-w-lg px-4 pb-20">{children}</main>
    </div>
  );
}
