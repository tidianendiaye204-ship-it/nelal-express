// app/page.tsx
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-dm overflow-hidden">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-slate-100/50">
        <div className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 transform group-hover:rotate-12 transition-all duration-500">
              <span className="text-white font-display font-black text-xl">N</span>
            </div>
            <span className="font-display font-black text-2xl tracking-tighter text-slate-900 group-hover:text-orange-500 transition-colors">Nellal Express</span>
          </div>
          <div className="hidden md:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <Link href="#comment-ca-marche" className="hover:text-orange-500 transition-colors relative group/link">
              Comment ça marche
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover/link:w-full"></span>
            </Link>
            <Link href="#zones" className="hover:text-orange-500 transition-colors relative group/link">
              Zones
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover/link:w-full"></span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-slate-900 hover:text-orange-500 transition-colors text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2">
              Connexion
            </Link>
            <Link href="/auth/signup"
              className="bg-slate-900 hover:bg-orange-600 text-white px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-2xl shadow-slate-900/10 active:scale-95">
              S'inscrire
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-24 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[20%] left-[10%] w-[40vw] h-[40vw] bg-orange-200/30 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[20%] right-[10%] w-[40vw] h-[40vw] bg-blue-200/30 rounded-full blur-[120px] animate-pulse [animation-delay:2s]"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-3 bg-white/50 backdrop-blur-md border border-white/50 rounded-full px-6 py-2.5 mb-12 shadow-sm transform hover:-translate-y-1 transition-transform cursor-default">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <span className="text-slate-900 text-[10px] font-black uppercase tracking-[0.3em]">Excellence Logistique Sénégalaise</span>
          </div>

          <h1 className="font-display font-black text-6xl md:text-9xl leading-[0.85] mb-12 tracking-tighter text-slate-900">
            L'Élite de la<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">Livraison.</span>
          </h1>

          <p className="text-slate-500 text-lg md:text-2xl max-w-2xl mx-auto mb-16 leading-relaxed font-medium">
            Une expérience premium pour vos envois. Sécurité, rapidité et élégance au service de vos colis.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/auth/signup"
              className="w-full sm:w-auto bg-orange-500 hover:bg-slate-900 text-white px-12 py-7 rounded-[2.5rem] font-display font-black text-xl transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_-10px_rgba(249,115,22,0.3)] flex items-center justify-center gap-4 group">
              Commencer l'envoi
              <span className="text-2xl group-hover:translate-x-2 transition-transform">→</span>
            </Link>
          </div>
        </div>

        {/* Floating cards for "Wow" effect */}
        <div className="hidden lg:block absolute bottom-10 left-10 w-64 bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] border border-white/50 shadow-2xl shadow-slate-200/50 animate-bounce [animation-duration:4s]">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center text-green-600 text-xl">✅</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">En direct</div>
          </div>
          <p className="text-slate-800 font-bold text-sm">Colis livré à Keur Massar</p>
          <p className="text-slate-400 text-[10px] mt-1 italic">Il y a 2 minutes</p>
        </div>

        <div className="hidden lg:block absolute top-40 right-10 w-64 bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] border border-white/50 shadow-2xl shadow-slate-200/50 animate-bounce [animation-duration:5s] [animation-delay:1s]">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600 text-xl">🚴</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Coursier</div>
          </div>
          <p className="text-slate-800 font-bold text-sm">Livreur en route vers Plateau</p>
          <p className="text-slate-400 text-[10px] mt-1 italic">Vitesse optimale</p>
        </div>
      </section>

      {/* STATS */}
      <section className="max-w-7xl mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { value: '20+', label: 'Zones couvertes', icon: '📍', color: 'bg-blue-50 text-blue-600' },
            { value: '24h', label: 'Délai moyen', icon: '⚡', color: 'bg-orange-50 text-orange-600' },
            { value: 'Simple', label: 'Paiement Wave/Cash', icon: '💰', color: 'bg-green-50 text-green-600' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border-2 border-slate-50 rounded-[2.5rem] p-8 flex flex-col items-center text-center hover:border-slate-100 transition-colors group">
              <div className={`w-16 h-16 rounded-2xl ${stat.color} flex items-center justify-center text-3xl mb-6 shadow-inner group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <div className="font-display font-black text-4xl text-slate-900 mb-2">{stat.value}</div>
              <div className="text-slate-400 text-sm font-black uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section id="comment-ca-marche" className="bg-slate-50 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-display font-black text-4xl md:text-6xl text-slate-900 mb-6 tracking-tight uppercase">
              C'est super simple
            </h2>
            <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto font-medium">
              Pas besoin de longues études, tout est pensé pour vous faciliter la vie.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                step: '01',
                title: 'Créez votre commande',
                desc: 'Renseignez l\'adresse, le colis et le prix. Ça prend 1 minute.',
                icon: '📦',
                color: 'bg-orange-500'
              },
              {
                step: '02',
                title: 'On trouve un livreur',
                desc: 'On assigne immédiatement un livreur proche de chez vous.',
                icon: '🚴',
                color: 'bg-blue-500'
              },
              {
                step: '03',
                title: 'Livré & Encaissé',
                desc: 'Le colis arrive. Vous recevez votre argent par Wave ou cash.',
                icon: '✅',
                color: 'bg-green-500'
              },
            ].map((item) => (
              <div key={item.step} className="relative group">
                <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100 relative z-10 h-full transform group-hover:-translate-y-2 transition-transform">
                  <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center text-2xl mb-8 shadow-lg`}>
                    {item.icon}
                  </div>
                  <div className="font-display font-black text-slate-200 text-7xl absolute top-6 right-10 -z-10">{item.step}</div>
                  <h3 className="font-display font-black text-2xl mb-4 text-slate-900 uppercase tracking-tight">{item.title}</h3>
                  <p className="text-slate-500 text-base leading-relaxed font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ZONES */}
      <section id="zones" className="max-w-7xl mx-auto px-6 py-32">
        <div className="text-center mb-16">
          <h2 className="font-display font-black text-4xl md:text-6xl text-slate-900 mb-6 tracking-tight uppercase">
            Nos Zones
          </h2>
          <p className="text-slate-500 text-lg font-medium">On livre partout, même là où c'est difficile.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              type: 'Dakar Centre',
              emoji: '🏙️',
              zones: ['Plateau', 'Médina', 'Yoff', 'Almadies', 'Ouakam'],
              tarif: 'À partir de 1 000 F',
              color: 'border-blue-100 bg-blue-50/30'
            },
            {
              type: 'Banlieue',
              emoji: '🏘️',
              zones: ['Pikine', 'Guédiawaye', 'Keur Massar', 'Rufisque'],
              tarif: 'À partir de 2 000 F',
              color: 'border-orange-100 bg-orange-50/30'
            },
            {
              type: 'Régions',
              emoji: '🚌',
              zones: ['Saint-Louis', 'Touba', 'Thiès', 'Kaolack', 'Ziguinchor'],
              tarif: 'À partir de 5 000 F',
              color: 'border-purple-100 bg-purple-50/30'
            },
          ].map((section) => (
            <div key={section.type} className={`border-2 rounded-[2.5rem] p-10 ${section.color} hover:scale-105 transition-transform`}>
              <div className="text-4xl mb-6">{section.emoji}</div>
              <h3 className="font-display font-black text-2xl mb-6 text-slate-900 uppercase tracking-tight">{section.type}</h3>
              <div className="space-y-3 mb-8">
                {section.zones.map((z) => (
                  <div key={z} className="text-slate-600 text-base font-bold flex items-center gap-3">
                    <span className="w-2 h-2 bg-slate-300 rounded-full"></span>
                    {z}
                  </div>
                ))}
              </div>
              <div className="inline-block bg-white px-4 py-2 rounded-xl text-orange-600 font-black text-sm uppercase tracking-widest shadow-sm">
                {section.tarif}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="max-w-7xl mx-auto px-6 pb-32">
        <div className="bg-slate-900 rounded-[3.5rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl shadow-slate-900/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px]"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]"></div>
          
          <h2 className="font-display font-black text-4xl md:text-7xl text-white mb-8 tracking-tighter uppercase leading-none">
            On commence ?<br /><span className="text-orange-500">C'est gratuit.</span>
          </h2>
          <p className="text-slate-400 mb-12 text-lg md:text-xl max-w-2xl mx-auto font-medium">
            Créez votre compte en 2 minutes et faites livrer votre premier colis aujourd'hui.
          </p>
          <Link href="/auth/signup"
            className="bg-orange-500 hover:bg-orange-600 text-white px-12 py-6 rounded-[2rem] font-display font-black text-2xl shadow-2xl shadow-orange-500/20 transition-all hover:scale-105 active:scale-95 inline-flex items-center gap-4">
            Créer mon compte 🚀
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
            <span className="font-display font-black text-xl text-slate-900">Nellal Express</span>
            </div>
            <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] italic">
              L'excellence logistique au service du Sénégal
            </p>
            <p className="text-slate-400 text-sm font-medium">© 2026 Nellal Express</p>
        </div>
      </footer>
    </div>
  )
}
