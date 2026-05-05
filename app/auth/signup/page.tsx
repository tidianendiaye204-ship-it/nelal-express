// app/auth/signup/page.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

export default function SignupPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = e.currentTarget
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement).value
    const full_name = (form.elements.namedItem('full_name') as HTMLInputElement).value
    const phone = (form.elements.namedItem('phone') as HTMLInputElement).value

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name, phone },
          emailRedirectTo: `${window.location.origin}/dashboard/client`,
        },
      })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      if (!data.session) {
        setError('Veuillez vérifier vos e-mails pour confirmer votre compte.')
        setLoading(false)
        return
      }

      window.location.href = '/dashboard/client'
    } catch {
      setError('Une erreur technique est survenue. Veuillez réessayer.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white font-inter flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/4 -left-24 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-0 -right-24 w-80 h-80 bg-blue-500/10 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-[480px] relative z-10">
        <Link href="/" className="flex items-center gap-4 mb-10 group justify-center">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/30 transform group-hover:-rotate-12 transition-transform">
            <span className="text-white font-display font-black text-2xl">N</span>
          </div>
          <span className="font-display font-black text-white text-3xl tracking-tighter">Nelal<span className="text-orange-500">Express</span></span>
        </Link>

        <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-white/5 p-8 sm:p-10 shadow-2xl">
          <div className="text-center mb-10">
            <h1 className="font-display font-black text-3xl text-white mb-3 uppercase tracking-tight">Bienvenue !</h1>
            <p className="text-slate-500 text-sm font-medium">Commencez à envoyer vos colis dès maintenant</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 mb-2 ml-1 uppercase tracking-widest">Nom complet</label>
                <input name="full_name" type="text" required autoComplete="name" placeholder="Prénom Nom"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-2xl px-5 py-4 text-sm placeholder:text-slate-600 focus:outline-none focus:border-orange-500/50 transition-all font-medium" />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 mb-2 ml-1 uppercase tracking-widest">Téléphone</label>
                <input name="phone" type="tel" required autoComplete="tel" placeholder="71 XXX XX XX"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-2xl px-5 py-4 text-sm placeholder:text-slate-600 focus:outline-none focus:border-orange-500/50 transition-all font-medium" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 mb-2 ml-1 uppercase tracking-widest">Email</label>
              <input name="email" type="email" required autoComplete="email" placeholder="votre@email.com"
                className="w-full bg-white/5 border border-white/10 text-white rounded-2xl px-5 py-4 text-sm placeholder:text-slate-600 focus:outline-none focus:border-orange-500/50 transition-all font-medium" />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 mb-2 ml-1 uppercase tracking-widest">Mot de passe</label>
              <input name="password" type="password" required minLength={8} autoComplete="new-password" placeholder="Min. 8 caractères"
                className="w-full bg-white/5 border border-white/10 text-white rounded-2xl px-5 py-4 text-sm placeholder:text-slate-600 focus:outline-none focus:border-orange-500/50 transition-all font-medium" />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold rounded-2xl px-5 py-4 flex items-center gap-3 animate-pulse">
                <span className="material-symbols-rounded">warning</span> {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white py-5 rounded-2xl font-display font-black text-xl shadow-xl shadow-orange-500/20 transition-all active:scale-95 flex items-center justify-center gap-3">
              {loading ? <span className="material-symbols-rounded animate-spin">progress_activity</span> : <>Créer mon compte</>}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-slate-500 font-medium text-xs">
              Déjà un compte ?{' '}
              <Link href="/auth/login" className="text-orange-500 hover:text-orange-400 font-black uppercase tracking-widest ml-1">
                Connexion
              </Link>
            </p>
          </div>
        </div>

        <Link href="/" className="mt-8 flex items-center justify-center gap-2 text-slate-500 hover:text-white transition-colors font-bold text-xs uppercase tracking-widest group">
          <span className="material-symbols-rounded group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Retour
        </Link>
      </div>
    </div>
  )
}
