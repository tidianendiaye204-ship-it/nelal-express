
'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Route Error:', error)
  }, [error])

  return (
    <div className="p-8 text-center bg-red-50 rounded-3xl border border-red-100 m-8">
      <h2 className="text-red-600 font-black uppercase tracking-tight mb-2">Une erreur est survenue</h2>
      <p className="text-red-500 text-xs font-medium mb-6">
        {error.message || 'Le serveur a rencontré une erreur inattendue.'}
      </p>
      {error.digest && (
        <p className="text-[10px] text-red-300 font-mono mb-6">Digest: {error.digest}</p>
      )}
      <button
        onClick={() => reset()}
        className="px-6 py-2 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
      >
        Réessayer
      </button>
    </div>
  )
}
