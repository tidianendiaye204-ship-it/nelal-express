// app/auth/login/page.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = e.currentTarget
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement).value

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        setError('Email ou mot de passe incorrect')
        setLoading(false)
        return
      }

      if (!data.user) {
        setError('Une erreur est survenue lors de la connexion')
        setLoading(false)
        return
      }

      // Rediriger vers le dashboard racine, le serveur se chargera de la redirection selon le rôle
      window.location.href = '/dashboard'
      
      return
    } catch {
      setError('Une erreur technique est survenue. Veuillez réessayer.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-[440px]">
        <Link href="/" className="flex items-center gap-3 mb-10 group">
          <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 transform group-hover:-rotate-12 transition-transform">
            <span className="text-white font-display font-black text-2xl">N</span>
          </div>
          <span className="font-display font-black text-slate-900 text-3xl tracking-tight">Nelal Express</span>
        </Link>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-xl shadow-slate-200/50">
          <div className="text-center mb-10">
            <h1 className="font-display font-black text-3xl text-slate-900 mb-3 uppercase tracking-tight">Connexion</h1>
            <p className="text-slate-500 text-base font-medium">Heureux de vous revoir ! 👋</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-black text-slate-700 mb-2 ml-1 uppercase tracking-widest">Email</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl opacity-50 group-focus-within:opacity-100 transition-opacity">📧</span>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="votre@email.com"
                  className="w-full bg-slate-50 border-2 border-slate-50 text-slate-900 rounded-2xl pl-12 pr-5 py-4 text-base placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-slate-700 mb-2 ml-1 uppercase tracking-widest">Mot de passe</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl opacity-50 group-focus-within:opacity-100 transition-opacity">🔑</span>
                <input
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border-2 border-slate-50 text-slate-900 rounded-2xl pl-12 pr-5 py-4 text-base placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all font-medium"
                />
              </div>
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
                <>C&apos;est parti ! 🚀</>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-50 text-center">
            <p className="text-slate-500 font-medium">
              Pas encore de compte ?{' '}
              <Link href="/auth/signup" className="text-orange-600 hover:text-orange-700 font-black underline decoration-orange-200 decoration-4 underline-offset-4">
                S&apos;inscrire gratuitement
              </Link>
            </p>
          </div>
        </div>

        <Link href="/" className="mt-8 flex items-center justify-center gap-2 text-slate-400 hover:text-slate-600 transition-colors font-bold text-sm group">
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  )
}
