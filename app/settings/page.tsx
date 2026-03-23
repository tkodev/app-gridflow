import { cva, type VariantProps } from 'class-variance-authority'
import type { Profile } from '@/types/profile'
import { SettingsSection } from '@/components/sections/settings-section'
import { SUPABASE_TABLE_PROFILES } from '@/constants/supabase'
import { createClient } from '@/utils/supabase-server'
import { cn } from '@/utils/tailwind'

// 1. styles & constants
const styles = {
  root: cva('py-6'),
  title: cva('text-2xl font-bold'),
  subtitle: cva('text-muted-foreground mt-1'),
  sectionWrap: cva('mt-8')
}

// 2. types
type SettingsPageProps = {
  className?: string
} & VariantProps<typeof styles.root>

// 3. component
const SettingsPage = async (props: SettingsPageProps) => {
  // a. props
  const { className } = props

  // b. hooks

  // c. logic
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

  // d. component
  return (
    <div className={cn(styles.root({ className }))}>
      <h1 className={styles.title()}>Settings</h1>
      <p className={styles.subtitle()}>Manage your profiles and account</p>

      <div className={styles.sectionWrap()}>
        <SettingsSection profiles={profiles} userEmail={user!.email || ''} />
      </div>
    </div>
  )
}

// 4. exports
export default SettingsPage
