// app/page.tsx
import Link from 'next/link'
import { MapPin, Zap, Wallet, Navigation, Home, Truck, ArrowRight, ShieldCheck, Globe, Users, Briefcase, CheckCircle2 } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-white font-dm overflow-hidden">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F172A]/80 backdrop-blur-xl border-b border-white/5 font-display italic tracking-tighter">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
              <span className="text-white font-black text-lg sm:text-xl italic">N</span>
            </div>
            <span className="font-black text-sm sm:text-xl text-white">Nelal<span className="text-orange-500 underline decoration-2 underline-offset-4">Express</span></span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/auth/login" className="text-slate-400 text-[10px] sm:text-sm font-bold hover:text-white transition-colors">
              Connexion
            </Link>
            <Link href="#recrutement" className="hidden sm:block text-slate-400 text-[10px] sm:text-sm font-bold hover:text-white transition-colors">
              Recrutement
            </Link>
            <Link href="/auth/signup"
              className="bg-white text-slate-900 px-3 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-[10px] sm:text-sm font-black transition-all hover:bg-orange-500 hover:text-white active:scale-95 shadow-xl shadow-white/5">
              Rejoindre
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION - PREMIUM DARK */}
      <section className="relative pt-32 sm:pt-40 pb-16 sm:pb-24 px-6 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-1/4 -left-24 w-64 sm:w-96 h-64 sm:h-96 bg-orange-500/10 rounded-full blur-[80px] sm:blur-[120px]"></div>
        <div className="absolute bottom-0 -right-24 w-80 sm:w-[30rem] h-80 sm:h-[30rem] bg-blue-500/10 rounded-full blur-[100px] sm:blur-[160px]"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 backdrop-blur-md rounded-full px-4 py-1.5 mb-6 sm:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <span className="text-white/70 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em]">Logistique Stratégique Sénégal</span>
          </div>

          <h1 className="font-display font-black text-3xl sm:text-5xl md:text-7xl leading-[0.95] mb-6 sm:mb-8 tracking-tighter uppercase italic">
            L&apos;Axe de <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Confiance</span>
          </h1>

          <div className="flex justify-center mb-8 sm:mb-10">
            <div className="flex flex-col md:flex-row items-center gap-2 sm:gap-4 bg-white/5 border border-white/5 p-2 rounded-3xl sm:rounded-[2.5rem] backdrop-blur-lg w-full sm:w-auto">
                <div className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-2xl sm:rounded-[2rem] bg-white/10 border border-white/10 font-display font-black text-[10px] sm:text-sm uppercase tracking-widest text-center text-white">Dakar</div>
                <ArrowRight className="w-4 h-4 text-orange-500 rotate-90 md:rotate-0" />
                <div className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-2xl sm:rounded-[2rem] bg-orange-500/20 border border-orange-500/30 text-orange-400 font-display font-black text-[10px] sm:text-sm uppercase tracking-widest shadow-lg shadow-orange-500/10 text-center">Yeumbeul Nord</div>
                <ArrowRight className="w-4 h-4 text-orange-500 rotate-90 md:rotate-0" />
                <div className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-2xl sm:rounded-[2rem] bg-white/10 border border-white/10 font-display font-black text-[10px] sm:text-sm uppercase tracking-widest text-center text-white">Ndioum</div>
            </div>
          </div>

          <p className="text-slate-400 text-sm sm:text-base md:text-xl max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed font-medium">
            Nelal Express n&apos;est pas juste une app. C&apos;est une équipe ancrée localement pour sécuriser vos envois entre la capitale, la banlieue et le Fouta.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/commander"
              className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-2xl sm:rounded-[2rem] font-display font-black text-base sm:text-lg transition-all shadow-2xl shadow-orange-500/30 flex items-center justify-center gap-3 group">
              Expédier Maintenant
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* EXPERTISE LOCALE - THE HUB SECTION */}
      <section className="py-24 px-6 relative border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-display font-black text-3xl md:text-5xl mb-8 tracking-tighter uppercase">
                Géré par des <br />
                <span className="text-orange-500">Enfants du Terroir.</span>
              </h2>
              <div className="space-y-6">
                {[
                  { title: "Point Yeumbeul Nord", desc: "Notre plateforme banlieue assure le maillage complet de Keur Massar à Pikine.", icon: <Home className="text-orange-500" />},
                  { title: "Service Dakar Elite", desc: "Rapidité absolue pour vos documents et colis précieux en centre-ville.", icon: <Navigation className="text-blue-500" />},
                  { title: "Transit Ndioum-Fouta", desc: "Le pont logistique direct pour vos envois vers le Nord du Sénégal.", icon: <Truck className="text-green-500" />},
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-orange-500/10 group-hover:border-orange-500/20 transition-all">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-display font-black text-lg mb-1 uppercase tracking-tight">{item.title}</h4>
                      <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
               <div className="absolute inset-0 bg-orange-500/20 blur-[100px] rounded-full"></div>
               <div className="relative bg-white/5 border border-white/10 rounded-3xl sm:rounded-[3rem] p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/5 space-y-3 sm:space-y-4">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500"><ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" /></div>
                        <div className="font-display font-black text-xl sm:text-2xl uppercase">100%</div>
                        <div className="text-[8px] font-black uppercase tracking-widest text-slate-500">Sécurité Colis</div>
                    </div>
                    <div className="bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/5 space-y-3 sm:space-y-4 sm:mt-8">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500"><Globe className="w-5 h-5 sm:w-6 sm:h-6" /></div>
                        <div className="font-display font-black text-xl sm:text-2xl uppercase">Direct</div>
                        <div className="text-[8px] font-black uppercase tracking-widest text-slate-500">Dakar ↔ Ndioum</div>
                    </div>
                    <div className="bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/5 space-y-3 sm:space-y-4">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500"><Users className="w-5 h-5 sm:w-6 sm:h-6" /></div>
                        <div className="font-display font-black text-xl sm:text-2xl uppercase">Local</div>
                        <div className="text-[8px] font-black uppercase tracking-widest text-slate-500">Équipe Dakaroise</div>
                    </div>
                    <div className="bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/5 space-y-3 sm:space-y-4 sm:mt-8">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500"><Zap className="w-5 h-5 sm:w-6 sm:h-6" /></div>
                        <div className="font-display font-black text-xl sm:text-2xl uppercase">Express</div>
                        <div className="text-[8px] font-black uppercase tracking-widest text-slate-500">Service Prioritaire</div>
                    </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE STATS - ELITE REDESIGN */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { value: 'Yeumbeul Nord', label: 'Notre quartier général', icon: <MapPin className="w-6 h-6" />, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
            { value: 'Transit Ndioum', label: 'Spécialité Nord-Sénégal', icon: <Zap className="w-6 h-6" />, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
            { value: 'Sécurité TOTALE', label: 'Paiement à la livraison', icon: <Wallet className="w-6 h-6" />, color: 'text-green-400 bg-green-500/10 border-green-500/20' },
          ].map((stat) => (
            <div key={stat.label} className={`bg-white/5 border rounded-[2.5rem] p-8 text-center group hover:bg-white/10 transition-all ${stat.color}`}>
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
              <div className="font-display font-black text-2xl mb-2 uppercase tracking-tight">{stat.value}</div>
              <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ZONES SECTION - STRATEGIC HUBS */}
      <section id="zones" className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h2 className="font-display font-black text-3xl md:text-5xl text-white mb-4 tracking-tighter uppercase">
            Nos Hubs de <span className="text-orange-500">Confiance</span>
          </h2>
          <div className="h-1.5 w-24 bg-orange-500 mx-auto rounded-full"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              type: 'Dakar Elite',
              icon: <Navigation className="w-10 h-10 text-blue-500 mb-6" />,
              zones: ['Plateau / Médina', 'Yoff / Almadies', 'Point E / Liberté', 'Fann / Mermoz'],
              tarif: 'Dès 1 000 F',
              color: 'bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/10'
            },
            {
              type: 'Focus Yeumbeul',
              icon: <Home className="w-10 h-10 text-orange-500 mb-6" />,
              zones: ['Yeumbeul Nord/Sud', 'Keur Massar', 'Pikine / Guédiawaye', 'Rufisque / Mbao'],
              tarif: 'Local dès 800 F',
              color: 'bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/10'
            },
            {
              type: 'Ligne Ndioum',
              icon: <Truck className="w-10 h-10 text-green-500 mb-6" />,
              zones: ['Ndioum (Hub Nord)', 'Saint-Louis', 'Podor / Matam', 'Thiès / Touba'],
              tarif: 'Dès 1 500 F',
              color: 'bg-gradient-to-br from-green-500/10 to-transparent border-green-500/10'
            },
          ].map((section) => (
            <div key={section.type} className={`border rounded-3xl sm:rounded-[3rem] p-6 sm:p-10 flex flex-col items-center text-center transition-all hover:-translate-y-2 duration-300 ${section.color}`}>
              <div className="bg-[#0F172A] p-3 sm:p-4 rounded-2xl sm:rounded-3xl mb-4 sm:mb-6 shadow-2xl border border-white/5 text-center">
                {section.icon}
              </div>
              <h3 className="font-display font-black text-xl sm:text-2xl mb-4 sm:mb-6 uppercase tracking-tight italic">{section.type}</h3>
              <div className="space-y-2 sm:space-y-3 mb-8 sm:mb-10 w-full text-center">
                {section.zones.map((z) => (
                  <div key={z} className="text-slate-400 text-xs sm:text-sm font-bold flex items-center justify-center gap-2">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                    {z}
                  </div>
                ))}
              </div>
              <div className="mt-auto inline-block bg-white text-slate-900 px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-black text-[8px] sm:text-[10px] uppercase tracking-[0.2em] shadow-xl">
                {section.tarif}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* NEIGHBORHOOD PROMO - NEW SECTION */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-24 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-orange-500/5 blur-[120px] rounded-full"></div>
        <div className="relative border border-orange-500/20 bg-orange-500/[0.03] rounded-[2rem] md:rounded-[3rem] p-6 md:p-16 overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-orange-500 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                <Zap className="w-3 h-3" /> Nouveau : Ultra-Local
              </div>
              <h2 className="font-display font-black text-3xl md:text-5xl text-white mb-6 tracking-tighter uppercase leading-none">
                La force du <br />
                <span className="text-orange-500 italic text-4xl md:text-6xl underline decoration-orange-500/30">Voisinage.</span>
              </h2>
              <p className="text-slate-400 text-sm md:text-lg font-medium mb-4 max-w-md">
                Envoyer des clés, un repas ou un document dans le même quartier n&apos;a jamais été aussi simple.
              </p>
              
              {/* LOCAL LANGUAGES SLOGANS */}
              <div className="space-y-2 mb-8">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-orange-400 font-display font-black text-[11px] md:text-[13px] italic tracking-tight">
                    &quot;Nelal mën na la jëndal&quot;
                  </p>
                   <span className="text-[7px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded uppercase not-italic font-bold">Wolof</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-blue-400 font-display font-black text-[11px] md:text-[13px] italic tracking-tight">
                    &quot;Nelal no waawi soodande ma&quot;
                  </p>
                  <span className="text-[7px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded uppercase not-italic font-bold">Pulaar</span>
                </div>
              </div>

              <div className="flex items-baseline gap-1 md:gap-2 mb-8">
                <span className="text-4xl md:text-5xl font-display font-black text-white italic">500</span>
                <span className="text-lg md:text-xl font-black text-orange-500 italic uppercase">FCFA</span>
                <span className="text-slate-500 text-[9px] font-black uppercase ml-1 md:ml-2 tracking-widest">Tarif Unique</span>
              </div>
              <Link href="/commander" className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-2xl font-display font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-orange-500 hover:text-white transition-all group">
                Commander Local <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {[
                { label: 'Documents', desc: 'Même quartier' },
                { label: 'Plats Cuisine', desc: 'Livraison express' },
                { label: 'Objets Oubliés', desc: 'Service d\'urgence' },
                { label: 'Cadeaux', desc: 'Entre voisins' },
              ].map((obj, i) => (
                <div key={i} className="bg-white/5 border border-white/10 p-4 md:p-5 rounded-2xl space-y-1 md:space-y-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                  <div className="font-display font-black text-sm md:text-base text-white uppercase tracking-tight">{obj.label}</div>
                  <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{obj.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* RECRUTEMENT - JOIN THE TEAM */}
      <section id="recrutement" className="max-w-7xl mx-auto px-6 py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-blue-500/5 blur-[120px] rounded-full -z-10"></div>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-slate-900 border border-white/10 rounded-[2rem] p-8 sm:p-12 shadow-2xl">
              <div className="inline-flex items-center gap-3 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 mb-8">
                <Briefcase className="w-4 h-4 text-orange-500" />
                <span className="text-orange-500 text-[10px] font-black uppercase tracking-widest">Opportunité de Carrière</span>
              </div>
              <h2 className="font-display font-black text-3xl sm:text-5xl text-white mb-8 tracking-tighter uppercase leading-tight">
                Devenez un Pilote <br />
                <span className="text-orange-500 italic">Nelal Express.</span>
              </h2>
              <p className="text-slate-400 text-sm sm:text-base mb-10 leading-relaxed font-medium">
                Vous possédez une moto ou un véhicule ? Vous connaissez Dakar ou la banlieue comme votre poche ? 
                Rejoignez la flotte la plus dynamique du Sénégal et boostez vos revenus.
              </p>
              
              <div className="space-y-5 mb-12">
                {[
                  "Revenus garantis et attractifs",
                  "Flexibilité totale de vos horaires",
                  "Assurance et support 24/7",
                  "Formation et équipement fournis"
                ].map((benefit, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-orange-500" />
                    </div>
                    <span className="text-white text-sm font-bold uppercase tracking-tight">{benefit}</span>
                  </div>
                ))}
              </div>

              <Link href="https://wa.me/221770000000?text=Bonjour,%20je%20souhaite%20rejoindre%20l'équipe%20Nelal%20Express%20en%20tant%20que%20livreur." target="_blank"
                className="inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-2xl font-display font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-orange-500 hover:text-white transition-all group">
                Postuler via WhatsApp
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div>
             <div className="space-y-12">
                <div>
                   <h3 className="font-display font-black text-2xl text-white mb-4 uppercase italic">Pourquoi nous ?</h3>
                   <p className="text-slate-500 text-sm leading-relaxed">
                     Chez Nelal, nous ne voyons pas seulement des livreurs, mais des partenaires stratégiques. Nous valorisons votre travail et votre sécurité avant tout.
                   </p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                      <div className="font-display font-black text-3xl text-orange-500 mb-1">+25%</div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">Revenus Moyens</div>
                   </div>
                   <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                      <div className="font-display font-black text-3xl text-blue-500 mb-1">Libre</div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">Planning</div>
                   </div>
                </div>
                <div className="p-8 bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20 rounded-[2rem]">
                   <p className="text-white font-medium italic text-lg leading-relaxed">
                     &quot;Depuis que j&apos;ai rejoint Nelal, j&apos;ai doublé mes courses quotidiennes grâce à l&apos;optimisation des trajets.&quot;
                   </p>
                   <div className="mt-6 flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-800 rounded-full border border-white/10 flex items-center justify-center font-black text-orange-500">M.S</div>
                      <div>
                         <div className="text-white font-black text-xs uppercase tracking-widest">Moussa S.</div>
                         <div className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">Partenaire depuis 2025</div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION - ULTRA PREMIUM */}
      <section className="max-w-7xl mx-auto px-6 py-12 sm:py-24 mb-12">
        <div className="bg-gradient-to-br from-slate-900 to-black rounded-3xl sm:rounded-[4rem] p-8 sm:p-12 md:p-24 text-center relative overflow-hidden border border-white/5 shadow-2xl">
          <div className="absolute top-0 right-0 w-[20rem] sm:w-[40rem] h-[20rem] sm:h-[40rem] bg-orange-500/5 rounded-full blur-[80px] sm:blur-[120px] -mr-20 sm:-mr-40 -mt-20 sm:-mt-40"></div>
          
          <h2 className="font-display font-black text-3xl sm:text-5xl md:text-8xl text-white mb-6 sm:mb-8 tracking-tighter uppercase leading-[0.85]">
            Nelal Express <br /><span className="text-orange-500 italic">C&apos;est le Terroir.</span>
          </h2>
          <p className="text-slate-400 mb-8 sm:mb-12 text-sm sm:text-lg md:text-2xl max-w-2xl mx-auto font-medium">
            De Yeumbeul Nord à Ndioum, nous sommes là pour vous.
          </p>
          <Link href="/auth/signup"
            className="inline-flex items-center gap-3 sm:gap-4 bg-white text-slate-900 px-8 sm:px-12 py-4 sm:py-6 rounded-2xl sm:rounded-[2.5rem] font-display font-black text-base sm:text-xl shadow-2xl transition-all hover:scale-105 active:scale-95 hover:bg-orange-500 hover:text-white">
            Rejoindre Nelal
            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-16 px-6 bg-black/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex flex-col items-center md:items-start gap-4">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center">
                 <span className="text-white font-display font-black text-sm">N</span>
               </div>
               <span className="font-display font-black text-2xl text-white tracking-tighter">Nelal Express</span>
             </div>
             <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] max-w-xs text-center md:text-left">
                L&apos;alliance de la technologie et de la logistique locale sénégalaise.
             </p>
          </div>
          <div className="text-slate-500 text-sm font-bold flex gap-8 uppercase tracking-widest text-[10px]">
             <span className="hover:text-white cursor-pointer transition-colors">Dakar</span>
             <span className="hover:text-white cursor-pointer transition-colors">Yeumbeul Nord</span>
             <span className="hover:text-white cursor-pointer transition-colors">Ndioum</span>
          </div>
          <p className="text-slate-600 text-sm font-medium">© 2026 Nelal Express · Sénégal</p>
        </div>
      </footer>
    </div>
  )
}
