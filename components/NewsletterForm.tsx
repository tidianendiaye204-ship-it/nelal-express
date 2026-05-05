'use client'

import { useState } from 'react'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setStatus('loading')
    
    // Simulate sending or open mailto
    // For now, let's open mailto to the admin as requested
    const subject = encodeURIComponent("Inscription Newsletter Nelal Express")
    const body = encodeURIComponent(`Bonjour,\n\nJe souhaite m'inscrire à la newsletter avec l'adresse : ${email}`)
    window.location.href = `mailto:geniedevgeniedev@gmail.com?subject=${subject}&body=${body}`
    
    setTimeout(() => {
      setStatus('success')
      setEmail('')
      setTimeout(() => setStatus('idle'), 3000)
    }, 1000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 text-center md:text-left">
      <h4 className="font-display font-black text-xs uppercase tracking-[0.4em] text-white">Newsletter</h4>
      <div className="flex gap-3">
        <input 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Votre email" 
          required
          className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs w-full focus:outline-none focus:border-orange-500/50 transition-colors text-white" 
        />
        <button 
          type="submit"
          disabled={status === 'loading'}
          className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-2xl transition-all shadow-xl shadow-orange-500/20 active:scale-90 disabled:opacity-50"
        >
          {status === 'loading' ? (
            <span className="material-symbols-rounded animate-spin">progress_activity</span>
          ) : status === 'success' ? (
            <span className="material-symbols-rounded">check</span>
          ) : (
            <span className="material-symbols-rounded">send</span>
          )}
        </button>
      </div>
      {status === 'success' && (
        <p className="text-orange-500 text-[10px] font-black uppercase tracking-widest animate-pulse">Merci pour votre inscription !</p>
      )}
    </form>
  )
}
