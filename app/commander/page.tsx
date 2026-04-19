import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import QuickOrderForm from '@/components/QuickOrderForm'
import { Package, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function CommanderPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/commander')
  }

  // Get user profile for extra check
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'livreur') {
    redirect('/dashboard/livreur')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard/client" className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-slate-900 rounded-full transition-colors active:scale-95">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <Package className="w-4 h-4" />
            </div>
            <span className="font-display font-black text-lg text-slate-900 tracking-tight">Nelal Express</span>
          </div>
          <div className="w-10"></div> {/* Spacer */}
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-1 max-w-md mx-auto w-full px-4 pt-8 pb-32">
        <div className="mb-8 text-center space-y-3">
           <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/20">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></span>
              Axe Stratégique : Dakar ↔ Ndioum
           </div>
           <h1 className="font-display font-black text-3xl text-slate-900 tracking-tight leading-none">Nouvelle Frappe 🚀</h1>
           <p className="text-sm text-slate-500">Service premium opéré localement à Yeumbeul, Dakar et Ndioum.</p>
        </div>

        <QuickOrderForm />
      </main>
    </div>
  )
}
