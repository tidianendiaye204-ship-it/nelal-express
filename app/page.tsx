// app/page.tsx
import Link from 'next/link'
import { MapPin, Zap, Wallet, Package, Bike, CheckCircle, Navigation, Home, Truck, ArrowRight } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-dm overflow-hidden">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="flex items-center justify-between px-5 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <span className="text-white font-display font-black text-lg">N</span>
            </div>
            <span className="font-display font-black text-xl tracking-tight text-slate-900">Nelal Express</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/auth/login" className="text-slate-600 text-xs font-bold px-3 py-2">
              Connexion
            </Link>
            <Link href="/auth/signup"
              className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95">
              S&apos;inscrire
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative flex flex-col items-center pt-24 pb-12 px-5 overflow-hidden">
        <div className="max-w-2xl w-full text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-full px-3 py-1 mb-6">
            <span className="w-1 h-1 bg-orange-500 rounded-full animate-pulse"></span>
            <span className="text-orange-600 text-[8px] font-black uppercase tracking-wider">Logistique Premium au Sénégal</span>
          </div>

          <h1 className="font-display font-black text-3xl md:text-5xl leading-[1.1] mb-4 tracking-tight text-slate-900 uppercase">
            Livraison Rapide & <br />
            <span className="text-orange-500">Service Élite.</span>
          </h1>

          <p className="text-slate-500 text-sm md:text-base max-w-lg mx-auto mb-8 leading-relaxed font-medium">
            Envoyez vos colis en toute sécurité. Une expérience fluide conçue pour votre quotidien professionnel et personnel.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link href="/auth/signup"
              className="w-full sm:w-auto bg-orange-500 text-white px-6 py-3.5 rounded-xl font-display font-black text-sm transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 group">
              Envoyer un colis
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { value: '20+', label: 'Zones couvertes', icon: <MapPin className="w-6 h-6" />, color: 'bg-blue-50 text-blue-600' },
            { value: '24h', label: 'Délai moyen', icon: <Zap className="w-6 h-6" />, color: 'bg-orange-50 text-orange-600' },
            { value: 'Simple', label: 'Paiement Wave/Cash', icon: <Wallet className="w-6 h-6" />, color: 'bg-green-50 text-green-600' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-slate-100 rounded-[2rem] p-6 flex flex-col items-center text-center hover:border-slate-200 transition-colors group">
              <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center mb-4 shadow-inner group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <div className="font-display font-black text-2xl text-slate-900 mb-1 uppercase">{stat.value}</div>
              <div className="text-slate-400 text-[8px] font-black uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section id="comment-ca-marche" className="bg-slate-50 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display font-black text-3xl md:text-5xl text-slate-900 mb-4 tracking-tight uppercase">
              Le Processus
            </h2>
            <p className="text-slate-500 text-sm md:text-base max-w-xl mx-auto font-medium">
              Une infrastructure pensée pour la fiabilité et la rapidité.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Création de mission',
                desc: 'Renseignez l&apos;adresse, les détails du colis et validez le tarif en quelques secondes.',
                icon: <Package className="w-6 h-6 text-white" />,
                color: 'bg-slate-900'
              },
              {
                step: '02',
                title: 'Assignation',
                desc: 'Notre système dispatch immédiatement la course au livreur le plus proche.',
                icon: <Bike className="w-6 h-6 text-white" />,
                color: 'bg-orange-500'
              },
              {
                step: '03',
                title: 'Livraison & Paiement',
                desc: 'Le colis est remis contre signature. Paiement sécurisé via Wave ou en espèces.',
                icon: <CheckCircle className="w-6 h-6 text-white" />,
                color: 'bg-blue-600'
              },
            ].map((item) => (
              <div key={item.step} className="relative group">
                <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative z-10 h-full transform group-hover:-translate-y-1 transition-transform">
                  <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center mb-6 shadow-lg`}>
                    {item.icon}
                  </div>
                  <div className="font-display font-black text-slate-100 text-5xl absolute top-4 right-8 -z-10">{item.step}</div>
                  <h3 className="font-display font-black text-xl mb-3 text-slate-900 uppercase tracking-tight">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ZONES */}
      <section id="zones" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="font-display font-black text-3xl md:text-5xl text-slate-900 mb-4 tracking-tight uppercase">
            Couverture
          </h2>
          <p className="text-slate-500 text-sm font-medium uppercase tracking-widest opacity-60">Un maillage territorial complet et efficace.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              type: 'Dakar Centre',
              icon: <Navigation className="w-8 h-8 text-blue-500 mb-4" />,
              zones: ['Plateau', 'Médina', 'Yoff', 'Almadies', 'Ouakam'],
              tarif: 'Dès 1 000 F',
              color: 'border-blue-100 bg-blue-50/30'
            },
            {
              type: 'Banlieue',
              icon: <Home className="w-8 h-8 text-orange-500 mb-4" />,
              zones: ['Pikine', 'Guédiawaye', 'Keur Massar', 'Rufisque'],
              tarif: 'Dès 2 000 F',
              color: 'border-orange-100 bg-orange-50/30'
            },
            {
              type: 'Régions',
              icon: <Truck className="w-8 h-8 text-purple-500 mb-4" />,
              zones: ['Saint-Louis', 'Touba', 'Thiès', 'Kaolack', 'Ziguinchor'],
              tarif: 'Dès 5 000 F',
              color: 'border-purple-100 bg-purple-50/30'
            },
          ].map((section) => (
            <div key={section.type} className={`border border-slate-100 rounded-[2rem] p-8 ${section.color} hover:scale-[1.02] transition-transform`}>
              {section.icon}
              <h3 className="font-display font-black text-xl mb-4 text-slate-900 uppercase tracking-tight">{section.type}</h3>
              <div className="space-y-2 mb-6">
                {section.zones.map((z) => (
                  <div key={z} className="text-slate-600 text-sm font-bold flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                    {z}
                  </div>
                ))}
              </div>
              <div className="inline-block bg-white px-3 py-1.5 rounded-lg text-orange-600 font-black text-[10px] uppercase tracking-widest shadow-sm">
                {section.tarif}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="bg-slate-900 rounded-[2.5rem] p-10 md:p-16 text-center relative overflow-hidden shadow-2xl shadow-slate-900/20">
          <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-[60px]"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px]"></div>
          
          <h2 className="font-display font-black text-3xl md:text-5xl text-white mb-6 tracking-tighter uppercase leading-none">
            Prêt à expédier ?<br /><span className="text-orange-500">Rejoignez-nous.</span>
          </h2>
          <p className="text-slate-400 mb-8 text-sm md:text-base max-w-xl mx-auto font-medium">
            Créez votre compte en quelques secondes et lancez votre première mission logistique.
          </p>
          <Link href="/auth/signup"
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-display font-black text-lg shadow-2xl shadow-orange-500/20 transition-all hover:scale-105 active:scale-95 inline-flex items-center gap-3">
            Démarrer maintenant
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-50 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-display font-black text-sm">N</span>
            </div>
            <span className="font-display font-black text-xl text-slate-900">Nelal Express</span>
            </div>
            <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] italic">
              L&apos;excellence logistique au service du Sénégal
            </p>
            <p className="text-slate-400 text-sm font-medium">© 2026 Nelal Express</p>
        </div>
      </footer>
    </div>
  )
}
