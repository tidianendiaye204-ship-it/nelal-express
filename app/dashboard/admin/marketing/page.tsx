// app/dashboard/admin/marketing/page.tsx
import { createClient, getProfile } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Printer, Smartphone } from 'lucide-react'
import AdminMarketingQR from '@/components/AdminMarketingQR'

export const dynamic = 'force-dynamic'

export default async function AdminMarketingPage() {
  const supabase = await createClient()
  const profile = await getProfile()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  // Fetch livreurs to populate the selection list
  const { data: livreurs } = await supabase
    .from('profiles')
    .select('id, full_name, phone')
    .eq('role', 'livreur')
    .order('full_name', { ascending: true })

  return (
    <div className="max-w-7xl mx-auto px-4 pb-24">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-10 no-print">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/admin" 
            className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="font-display font-black text-3xl text-slate-900 uppercase tracking-tight leading-none mb-2">
              Marketing Nelal
            </h1>
            <div className="h-1.5 w-12 bg-orange-500 rounded-full"></div>
          </div>
        </div>

        <div className="flex items-center gap-8 no-print">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shadow-sm border border-orange-200">
               <Printer className="w-5 h-5" />
             </div>
             <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Impression</p>
               <p className="text-xs font-bold text-slate-700 italic">Optimisé jet d&apos;encre</p>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-200">
               <Smartphone className="w-5 h-5" />
             </div>
             <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">WhatsApp</p>
               <p className="text-xs font-bold text-slate-700 italic">QR Code scan direct</p>
             </div>
          </div>
        </div>
      </div>

      <div className="mb-10 no-print">
        <p className="text-slate-500 text-sm max-w-2xl leading-relaxed">
          Générez des cartes de visite et de service personnalisées pour vos partenaires livreurs. 
          Les clients n&apos;ont qu&apos;à scanner le QR code pour ouvrir une conversation WhatsApp avec une commande déjà remplie.
        </p>
      </div>

      {/* THE TOOL */}
      <AdminMarketingQR livreurs={livreurs || []} />
      
    </div>
  )
}
