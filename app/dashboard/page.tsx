// app/dashboard/page.tsx
import { getProfile } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardRoot() {
  const profile = await getProfile()
  if (!profile) redirect('/auth/login')
  redirect(`/dashboard/${profile.role}`)
}
