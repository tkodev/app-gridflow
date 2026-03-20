import { redirect } from 'next/navigation'
import { AppHeader } from '@/components/app/header'
import { createClient } from '@/utils/supabase-server'

const SettingsLayout = async ({ children }: { children: React.ReactNode }) => {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="bg-background min-h-screen">
      <AppHeader user={user} />
      <main className="mx-auto max-w-lg px-4 pb-20">{children}</main>
    </div>
  )
}

export default SettingsLayout
