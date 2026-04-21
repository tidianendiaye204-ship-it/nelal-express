// app/dashboard/client/nouvelle-commande/page.tsx
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import OrderForm from './OrderForm'

export default async function NouvelleCommandePage() {
  const supabase = await createClient()

  const { data: zones } = await supabase
    .from('zones')
    .select('*')
    .order('type')
    .order('name')


  return (
    <div className="max-w-2xl mx-auto pb-20">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/dashboard/client" className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors">
          ←
        </Link>
        <div>
          <h1 className="font-display font-black text-2xl text-slate-900 tracking-tight uppercase">Commander</h1>
          <p className="text-slate-500 text-xs mt-0.5">Rapide et simple</p>
        </div>
      </div>

      <OrderForm zones={zones || []} />
    </div>
  )
}
