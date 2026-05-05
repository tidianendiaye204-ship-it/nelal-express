// app/auth/login/page.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

type LoginMethod = 'email' | 'whatsapp'
type Step = 'choose' | 'otp'

export default function LoginPage() {
  const [method, setMethod] = useState<LoginMethod>('email')
  const [step, setStep] = useState<Step>('choose')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Email state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // WhatsApp OTP state
  const [phone, setPhone] = useState('')
  const [fullName, setFullName] = useState('')
  const [code, setCode] = useState('')
  const [isNewUser, setIsNewUser] = useState(false)
  const [countdown, setCountdown] = useState(0)

  function formatPhone(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 9)
    if (digits.length <= 2) return digits
    if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`
    if (digits.length <= 7) return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`
    return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}`
  }

  function startCountdown() {
    setCountdown(60)
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(interval); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  // ── EMAIL LOGIN (existant, ne change pas) ──────────────
  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

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

      window.location.href = '/dashboard'
    } catch {
      setError('Une erreur technique est survenue. Veuillez réessayer.')
      setLoading(false)
    }
  }

  // ── WHATSAPP OTP ───────────────────────────────────────
  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: phone.replace(/\s/g, ''),
          full_name: fullName || undefined,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erreur lors de l\'envoi du code')
        setLoading(false)
        return
      }

      setStep('otp')
      startCountdown()
    } catch {
      setError('Erreur de connexion. Vérifiez votre réseau.')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.replace(/\s/g, ''), code }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Code incorrect')
        setLoading(false)
        return
      }

      // Utiliser le token pour s'authentifier côté client
      if (data.token_hash && data.email) {
        const supabase = createClient()
        const { error: verifyError } = await supabase.auth.verifyOtp({
          email: data.email,
          token_hash: data.token_hash,
          type: 'magiclink',
        })

        if (verifyError) {
          console.error('[Verify Error]', verifyError)
          setError('Erreur de connexion. Réessayez.')
          setLoading(false)
          return
        }
      }

      window.location.href = data.redirect || '/dashboard'
    } catch {
      setError('Erreur de connexion. Vérifiez votre réseau.')
      setLoading(false)
    }
  }

  async function handleResend() {
    if (countdown > 0) return
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.replace(/\s/g, '') }),
      })
      if (res.ok) startCountdown()
      else {
        const data = await res.json()
        setError(data.error)
      }
    } catch { setError('Erreur réseau') } 
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white font-inter flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/4 -left-24 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-0 -right-24 w-80 h-80 bg-blue-500/10 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-[440px] relative z-10">
        <Link href="/" className="flex items-center gap-4 mb-10 group justify-center">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/30 transform group-hover:-rotate-12 transition-transform">
            <span className="text-white font-display font-black text-2xl">N</span>
          </div>
          <span className="font-display font-black text-white text-3xl tracking-tighter">Nelal<span className="text-orange-500">Express</span></span>
        </Link>

        <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-white/5 p-10 shadow-2xl">

          {/* ── STEP OTP : Saisie du code ─────────────── */}
          {step === 'otp' ? (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-orange-500/20 border border-orange-500/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-rounded text-3xl text-orange-500">verified_user</span>
                </div>
                <h1 className="font-display font-black text-2xl text-slate-900 mb-2 uppercase tracking-tight">Vérification</h1>
                <p className="text-slate-500 text-sm font-medium">
                  Code envoyé sur WhatsApp au<br />
                  <strong className="text-slate-900 text-lg">+221 {phone}</strong>
                </p>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 mb-2 ml-1 uppercase tracking-widest">Code à 6 chiffres</label>
                  <input
                    type="text" inputMode="numeric" maxLength={6} autoFocus required
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="● ● ● ● ● ●"
                    className="w-full bg-slate-50 border-2 border-slate-100 text-slate-900 rounded-2xl px-5 py-5 text-center text-3xl placeholder:text-slate-200 focus:outline-none focus:border-orange-500 focus:bg-white transition-all font-black tracking-[0.5em]"
                  />
                </div>
                {error && (
                  <div className="bg-red-50 border-2 border-red-100 text-red-600 text-sm font-bold rounded-2xl px-5 py-4 flex items-center gap-3">
                    <span className="text-lg">⚠️</span>{error}
                  </div>
                )}
                <button type="submit" disabled={loading || code.length < 6}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white py-5 rounded-2xl font-display font-black text-xl shadow-xl shadow-orange-500/20 transition-all active:scale-95 flex items-center justify-center gap-3">
                  {loading ? <span className="material-symbols-rounded animate-spin">progress_activity</span> : <><span className="material-symbols-rounded">arrow_forward</span> Valider</>}
                </button>
                <div className="flex items-center justify-between pt-2">
                  <button type="button" onClick={() => { setStep('choose'); setCode(''); setError('') }}
                    className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">← Changer de numéro</button>
                  <button type="button" onClick={handleResend} disabled={countdown > 0 || loading}
                    className="text-xs font-bold text-orange-500 disabled:text-slate-300 transition-colors">
                    {countdown > 0 ? `Renvoyer (${countdown}s)` : 'Renvoyer le code'}
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* ── STEP CHOOSE : Méthode de connexion ──── */
            <>
              <div className="text-center mb-8">
                <h1 className="font-display font-black text-3xl text-slate-900 mb-3 uppercase tracking-tight">Connexion</h1>
                <p className="text-slate-500 text-base font-medium">Heureux de vous revoir ! 👋</p>
              </div>

              {/* Toggle Email / WhatsApp */}
              <div className="flex bg-slate-100 rounded-2xl p-1 mb-8">
                <button
                  type="button"
                  onClick={() => { setMethod('email'); setError('') }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                    method === 'email' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500'
                  }`}
                >
                  <span className="material-symbols-rounded text-lg">mail</span> Email
                </button>
                <button
                  type="button"
                  onClick={() => { setMethod('whatsapp'); setError('') }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${
                    method === 'whatsapp' ? 'bg-white/10 text-green-500 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  <span className="material-symbols-rounded text-lg">chat</span> WhatsApp
                  <span className="absolute -top-2 -right-1 bg-orange-500 text-white text-[8px] px-2 py-1 rounded-full shadow-sm font-black uppercase tracking-tighter">SOON</span>
                </button>
              </div>

              {/* ── EMAIL FORM (identique à l'ancien) ── */}
              {method === 'email' && (
                <form onSubmit={handleEmailLogin} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 mb-2 ml-1 uppercase tracking-widest">Email</label>
                    <div className="relative group">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-500 group-focus-within:text-orange-500 transition-colors">alternate_email</span>
                      <input name="email" type="email" required autoComplete="email" placeholder="votre@email.com"
                        value={email} onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 text-white rounded-2xl pl-12 pr-5 py-4 text-sm placeholder:text-slate-600 focus:outline-none focus:border-orange-500/50 transition-all font-medium" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 mb-2 ml-1 uppercase tracking-widest">Mot de passe</label>
                    <div className="relative group">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-500 group-focus-within:text-orange-500 transition-colors">lock</span>
                      <input name="password" type="password" required autoComplete="current-password" placeholder="••••••••"
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 text-white rounded-2xl pl-12 pr-5 py-4 text-sm placeholder:text-slate-600 focus:outline-none focus:border-orange-500/50 transition-all font-medium" />
                    </div>
                  </div>
                  {error && (
                    <div className="bg-red-50 border-2 border-red-100 text-red-600 text-sm font-bold rounded-2xl px-5 py-4 flex items-center gap-3">
                      <span className="text-lg">⚠️</span>{error}
                    </div>
                  )}
                  <button type="submit" disabled={loading}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white py-5 rounded-2xl font-display font-black text-xl shadow-xl shadow-orange-500/20 transition-all active:scale-95 flex items-center justify-center gap-3">
                    {loading ? <span className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></span> : <>C&apos;est parti ! 🚀</>}
                  </button>
                </form>
              )}

              {method === 'whatsapp' && (
                <div className="py-10 text-center space-y-4">
                  <div className="w-20 h-20 bg-white/5 border border-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-rounded text-4xl text-slate-700">forum</span>
                  </div>
                  <h3 className="font-display font-black text-xl text-white uppercase tracking-tight">Bientôt disponible</h3>
                  <p className="text-slate-500 text-sm px-4">
                    La connexion simplifiée via WhatsApp arrive très prochainement. 
                    En attendant, merci d&apos;utiliser votre <span className="font-bold text-orange-500">email</span>.
                  </p>
                  <button 
                    onClick={() => setMethod('email')}
                    className="mt-4 text-orange-600 font-black text-xs uppercase tracking-widest hover:underline decoration-2 underline-offset-4"
                  >
                    Utiliser mon email →
                  </button>
                </div>
              )}

              <div className="mt-10 pt-8 border-t border-white/5 text-center">
                <p className="text-slate-500 font-medium text-xs">
                  Pas encore de compte ?{' '}
                  <Link href="/auth/signup" className="text-orange-500 hover:text-orange-400 font-black uppercase tracking-widest ml-1">
                    S&apos;inscrire
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>

        <Link href="/" className="mt-8 flex items-center justify-center gap-2 text-slate-400 hover:text-slate-600 transition-colors font-bold text-sm group">
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  )
}
