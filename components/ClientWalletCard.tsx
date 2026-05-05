// components/ClientWalletCard.tsx

interface ClientWalletCardProps {
  balance: number
}

export default function ClientWalletCard({ balance }: ClientWalletCardProps) {
  if (balance <= 0) {
    return (
      <div className="mx-2 mb-6 bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
            <span className="material-symbols-rounded">account_balance_wallet</span>
          </div>
          <div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Mon Solde</p>
            <p className="text-slate-400 text-[10px] font-medium">0 F disponible</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-2 mb-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 shadow-lg shadow-orange-500/20 relative overflow-hidden group">
      {/* Decorative patterns */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 transform group-hover:scale-110 transition-transform duration-700"></div>
      
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white shadow-inner">
            <span className="material-symbols-rounded text-2xl animate-pulse">payments</span>
          </div>
          <div>
            <p className="text-orange-100 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Mon Argent (Monnaie & Gains)</p>
            <p className="text-3xl font-display font-black text-white leading-none">
              {balance.toLocaleString('fr-FR')} <span className="text-sm font-normal opacity-80">F</span>
            </p>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <div className="bg-white/20 hover:bg-white/30 p-2 rounded-xl transition-colors cursor-help group/info relative">
            <span className="material-symbols-rounded text-white text-lg">info</span>
            <div className="absolute bottom-full right-0 mb-2 w-56 bg-slate-900 text-white text-[9px] p-3 rounded-2xl opacity-0 pointer-events-none group-hover/info:opacity-100 transition-opacity shadow-2xl z-50 border border-white/10 leading-relaxed font-medium">
              Cet argent provient de vos ventes (Nelal Pay) et de la <strong className="text-orange-400 font-black italic underline">monnaie</strong> que les livreurs vous ont rendue virtuellement.
            </div>
          </div>
          <a 
            href={`https://wa.me/221711165368?text=${encodeURIComponent("Bonjour, je souhaite retirer mon solde Nelal Express de " + balance.toLocaleString() + " F.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-orange-600 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-transform"
          >
            Retirer
          </a>
        </div>
      </div>
    </div>
  )
}
