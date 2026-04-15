// app/auth/signup/page.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
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

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
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

    router.push('/dashboard/client')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-[480px]">
        <Link href="/" className="flex items-center justify-center gap-3 mb-10 group">
          <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 transform group-hover:rotate-12 transition-transform">
            <span className="text-white font-display font-black text-2xl leading-none">N</span>
          </div>
          <span className="font-display font-black text-3xl text-slate-900 tracking-tight">Nelal Express</span>
        </Link>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-xl shadow-slate-200/50">
          <div className="text-center mb-10">
            <h1 className="font-display font-black text-3xl text-slate-900 mb-3 uppercase tracking-tight">Bienvenue !</h1>
            <p className="text-slate-500 text-base font-medium">Commencez à envoyer vos colis dès maintenant 🚀</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-black text-slate-700 mb-2 ml-1 uppercase tracking-widest">Nom complet</label>
                <input
                  name="full_name"
                  type="text"
                  required
                  placeholder="Prénom Nom"
                  className="w-full bg-slate-50 border-2 border-slate-50 text-slate-900 rounded-2xl px-5 py-4 text-base placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-black text-slate-700 mb-2 ml-1 uppercase tracking-widest">Téléphone</label>
                <input
                  name="phone"
                  type="tel"
                  required
                  placeholder="77 XXX XX XX"
                  className="w-full bg-slate-50 border-2 border-slate-50 text-slate-900 rounded-2xl px-5 py-4 text-base placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-slate-700 mb-2 ml-1 uppercase tracking-widest">Email</label>
              <input
                name="email"
                type="email"
                required
                placeholder="votre@email.com"
                className="w-full bg-slate-50 border-2 border-slate-50 text-slate-900 rounded-2xl px-5 py-4 text-base placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-black text-slate-700 mb-2 ml-1 uppercase tracking-widest">Mot de passe</label>
              <input
                name="password"
                type="password"
                required
                minLength={8}
                placeholder="Min. 8 caractères"
                className="w-full bg-slate-50 border-2 border-slate-50 text-slate-900 rounded-2xl px-5 py-4 text-base placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all font-medium"
              />
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-100 text-red-600 text-sm font-bold rounded-2xl px-5 py-4 flex items-center gap-3">
                <span className="text-lg">⚠️</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white py-5 rounded-2xl font-display font-black text-xl shadow-xl shadow-orange-500/20 transition-all transform active:scale-95 flex items-center justify-center gap-3"
            >
              {loading ? (
                <span className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>Créer mon compte ✨</>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-50 text-center">
            <p className="text-slate-500 font-medium">
              Déjà un compte ?{' '}
              <Link href="/auth/login" className="text-orange-600 hover:text-orange-700 font-black underline decoration-orange-200 decoration-4 underline-offset-4">
                Se connecter ici
              </Link>
            </p>
          </div>
        </div>

        <Link href="/" className="mt-8 flex items-center justify-center gap-2 text-slate-400 hover:text-slate-600 transition-colors font-bold text-sm group">
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          Retour à l'accueil
        </Link>
      </div>
    </div>
  )
}
