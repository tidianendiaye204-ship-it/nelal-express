// components/CashCollectionButton.tsx
'use client'

import { useState, useTransition } from 'react'
import { collectCash } from '@/actions/wallet'
import { Banknote, Loader2, CheckCircle, XCircle } from 'lucide-react'

interface CashCollectionButtonProps {
  livreurId: string
  livreurName: string
  currentBalance: number
}

export default function CashCollectionButton({ 
  livreurId, 
  livreurName, 
  currentBalance 
}: CashCollectionButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const [amount, setAmount] = useState(currentBalance.toString())
  const [error, setError] = useState<string | null>(null)

  const handleCollect = () => {
    setError(null)
    const val = parseInt(amount)
    if (isNaN(val) || val <= 0) {
      setError('Montant invalide')
      return
    }

    startTransition(async () => {
      const res = await collectCash(livreurId, val)
      if (res.error) {
        setError(res.error)
      } else {
        setIsOpen(false)
      }
    })
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => {
          setAmount(currentBalance.toString())
          setIsOpen(true)
        }}
        disabled={currentBalance <= 0}
        className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 disabled:opacity-30 disabled:active:scale-100"
      >
        <Banknote className="w-4 h-4" /> Collecter
      </button>
    )
  }

  return (
    <div className="flex flex-col items-end gap-2 animate-in slide-in-from-right-2">
      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 shadow-md">
        <input 
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-24 px-3 py-1.5 text-xs font-bold outline-none"
          autoFocus
        />
        <button 
          onClick={handleCollect}
          disabled={isPending}
          className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 hover:bg-green-600"
        >
          {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />} OK
        </button>
        <button 
          onClick={() => setIsOpen(false)}
          disabled={isPending}
          className="text-slate-400 p-1.5 hover:text-red-500"
        >
          <XCircle className="w-4 h-4" />
        </button>
      </div>
      {error && <p className="text-[8px] text-red-500 font-bold">{error}</p>}
    </div>
  )
}
