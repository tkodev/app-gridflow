import type { Profile } from '@/types/profile'
import { ProfilesManager } from '@/components/settings/profiles-manager'
import { SUPABASE_TABLE_PROFILES } from '@/constants/supabase'
import { createClient } from '@/utils/supabase-server'

const SettingsPage = async () => {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  const { data: profilesRaw } = await supabase
    .from(SUPABASE_TABLE_PROFILES)
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: true })

  const profiles = (profilesRaw ?? []) as Profile[]

  return (
    <div className="py-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="text-muted-foreground mt-1">Manage your profiles and account</p>

      <div className="mt-8">
        <ProfilesManager profiles={profiles} userEmail={user!.email || ''} />
      </div>
    </div>
  )
}

export default SettingsPage
