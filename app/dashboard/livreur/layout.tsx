import { getProfile } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function LivreurLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile()
  if (!profile || profile.role !== 'livreur') {
    redirect('/dashboard') // Redirige vers le bon dashboard selon vrai rôle
  }
  return <>{children}</>
}
