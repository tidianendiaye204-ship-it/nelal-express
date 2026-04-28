// app/auth/login/page.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { ArrowRight, ShieldCheck, Loader2, MessageCircle, Mail } from 'lucide-react'

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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-[440px]">
        <Link href="/" className="flex items-center gap-3 mb-10 group">
          <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 transform group-hover:-rotate-12 transition-transform">
            <span className="text-white font-display font-black text-2xl">N</span>
          </div>
          <span className="font-display font-black text-slate-900 text-3xl tracking-tight">Nelal Express</span>
        </Link>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-xl shadow-slate-200/50">

          {/* ── STEP OTP : Saisie du code ─────────────── */}
          {step === 'otp' ? (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-orange-500 rounded-[1.25rem] flex items-center justify-center mx-auto mb-5 shadow-lg shadow-orange-500/20">
                  <ShieldCheck className="w-8 h-8 text-white" />
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
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><ArrowRight className="w-5 h-5" /> Valider</>}
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
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    method === 'email' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'
                  }`}
                >
                  <Mail className="w-4 h-4" /> Email
                </button>
                <button
                  type="button"
                  onClick={() => { setMethod('whatsapp'); setError('') }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    method === 'whatsapp' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-400'
                  }`}
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </button>
              </div>

              {/* ── EMAIL FORM (identique à l'ancien) ── */}
              {method === 'email' && (
                <form onSubmit={handleEmailLogin} className="space-y-6">
                  <div>
                    <label className="block text-sm font-black text-slate-700 mb-2 ml-1 uppercase tracking-widest">Email</label>
                    <div className="relative group">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl opacity-50 group-focus-within:opacity-100 transition-opacity">📧</span>
                      <input name="email" type="email" required autoComplete="email" placeholder="votre@email.com"
                        value={email} onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-50 border-2 border-slate-50 text-slate-900 rounded-2xl pl-12 pr-5 py-4 text-base placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all font-medium" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-black text-slate-700 mb-2 ml-1 uppercase tracking-widest">Mot de passe</label>
                    <div className="relative group">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl opacity-50 group-focus-within:opacity-100 transition-opacity">🔑</span>
                      <input name="password" type="password" required autoComplete="current-password" placeholder="••••••••"
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-50 border-2 border-slate-50 text-slate-900 rounded-2xl pl-12 pr-5 py-4 text-base placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all font-medium" />
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

              {/* ── WHATSAPP FORM ───────────────────── */}
              {method === 'whatsapp' && (
                <form onSubmit={handleSendOTP} className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 mb-2 ml-1 uppercase tracking-widest">Téléphone</label>
                    <div className="relative group">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400 pointer-events-none">🇸🇳 +221</span>
                      <input type="tel" required autoFocus inputMode="numeric"
                        value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))}
                        placeholder="77 123 45 67"
                        className="w-full bg-slate-50 border-2 border-slate-100 text-slate-900 rounded-2xl pl-[100px] pr-5 py-4 text-lg placeholder:text-slate-300 focus:outline-none focus:border-orange-500 focus:bg-white transition-all font-black tracking-wider" />
                    </div>
                  </div>
                  <button type="button" onClick={() => setIsNewUser(!isNewUser)}
                    className="text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors">
                    {isNewUser ? '← J\'ai déjà un compte' : 'Nouveau ? Créer un compte →'}
                  </button>
                  {isNewUser && (
                    <div className="animate-in slide-in-from-top-2 duration-200">
                      <label className="block text-[10px] font-black text-slate-400 mb-2 ml-1 uppercase tracking-widest">Votre nom</label>
                      <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Prénom Nom"
                        className="w-full bg-slate-50 border-2 border-slate-100 text-slate-900 rounded-2xl px-5 py-4 text-base placeholder:text-slate-300 focus:outline-none focus:border-orange-500 focus:bg-white transition-all font-medium" />
                    </div>
                  )}
                  {error && (
                    <div className="bg-red-50 border-2 border-red-100 text-red-600 text-sm font-bold rounded-2xl px-5 py-4 flex items-center gap-3">
                      <span className="text-lg">⚠️</span>{error}
                    </div>
                  )}
                  <button type="submit" disabled={loading || phone.replace(/\s/g, '').length < 9}
                    className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white py-5 rounded-2xl font-display font-black text-xl shadow-xl shadow-green-500/20 transition-all active:scale-95 flex items-center justify-center gap-3">
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><MessageCircle className="w-5 h-5" /> Recevoir le code WhatsApp</>}
                  </button>
                </form>
              )}

              <div className="mt-10 pt-8 border-t border-slate-50 text-center">
                <p className="text-slate-500 font-medium">
                  Pas encore de compte ?{' '}
                  <Link href="/auth/signup" className="text-orange-600 hover:text-orange-700 font-black underline decoration-orange-200 decoration-4 underline-offset-4">
                    S&apos;inscrire gratuitement
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
