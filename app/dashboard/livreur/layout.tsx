import { getProfile } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function LivreurLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile()
  if (!profile || (profile.role !== 'livreur' && profile.role !== 'agent')) {
    redirect('/dashboard')
  }
  return <>{children}</>
}
