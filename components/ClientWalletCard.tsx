// components/ClientWalletCard.tsx
import { Wallet, Info, Sparkles } from 'lucide-react'

interface ClientWalletCardProps {
  balance: number
}

export default function ClientWalletCard({ balance }: ClientWalletCardProps) {
  if (balance <= 0) {
    return (
      <div className="mx-2 mb-6 bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-tight">Mon Portefeuille</p>
            <p className="text-slate-400 text-xs font-medium">Aucun avoir pour le moment</p>
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
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <p className="text-orange-100 text-[10px] font-black uppercase tracking-widest mb-1">Votre avoir cumulé</p>
            <p className="text-3xl font-display font-black text-white leading-none">
              {balance.toLocaleString('fr-FR')} <span className="text-sm font-normal opacity-80">F</span>
            </p>
          </div>
        </div>
        
        <div className="bg-white/20 hover:bg-white/30 p-2 rounded-xl transition-colors cursor-help group/info relative">
          <Info className="w-4 h-4 text-white" />
          <div className="absolute bottom-full right-0 mb-2 w-48 bg-slate-900 text-white text-[8px] p-2 rounded-lg opacity-0 pointer-events-none group-hover/info:opacity-100 transition-opacity shadow-xl z-50">
            Cet avoir provient des petites coupures non rendues (ardoises) lors de vos précédentes livraisons. Vous pourrez l&apos;utiliser pour vos futurs envois.
          </div>
        </div>
      </div>
    </div>
  )
}
