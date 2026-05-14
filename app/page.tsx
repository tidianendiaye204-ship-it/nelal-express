// app/page.tsx
import Link from 'next/link'
import QuickOrderForm from '@/components/QuickOrderForm'
import WhatsAppBubble from '@/components/WhatsAppBubble'
import CustomCursor from '@/components/CustomCursor'
import ScrollReveal from '@/components/ScrollReveal'
import NewsletterForm from '@/components/NewsletterForm'
import PWAInstallButton from '@/components/PWAInstallButton'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-white font-inter overflow-x-hidden selection:bg-orange-500/30 selection:text-orange-200">
      <CustomCursor />

      {/* LIVE ACTIVITY BANNER */}
      <div className="fixed top-24 right-6 z-[90] hidden lg:block animate-in fade-in slide-in-from-right-10 duration-1000 delay-1000">
        <div className="glass-dark px-6 py-4 rounded-3xl border border-white/10 flex items-center gap-4 shadow-2xl">
          <div className="relative">
            <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
              <span className="material-symbols-rounded text-orange-500 animate-pulse">radar</span>
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-[#020617] rounded-full"></span>
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Activity</div>
            <div className="text-xs font-bold text-white tracking-tight">42 courses en cours à Dakar</div>
          </div>
        </div>
      </div>

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-[#020617]/40 backdrop-blur-2xl border-b border-white/5">
        <div className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-2xl shadow-orange-500/40 group-hover:scale-110 transition-transform">
              <span className="text-white font-black text-xl">N</span>
            </div>
            <span className="font-display font-black text-xl sm:text-2xl text-white tracking-tighter">Nelal<span className="text-orange-500">Express</span></span>
          </div>
          <div className="flex items-center gap-4 sm:gap-8">
            <div className="hidden lg:flex items-center gap-8">
                <Link href="#zones" className="text-slate-400 text-[10px] font-black hover:text-white transition-colors uppercase tracking-[0.2em]">Zones</Link>
                <Link href="#expertise" className="text-slate-400 text-[10px] font-black hover:text-white transition-colors uppercase tracking-[0.2em]">Expertise</Link>
                <Link href="#recrutement" className="text-slate-400 text-[10px] font-black hover:text-white transition-colors uppercase tracking-[0.2em]">Recrutement</Link>
            </div>
            <Link href="/auth/login"
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 sm:px-8 py-3 rounded-2xl text-xs font-black transition-all active:scale-95 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]">
              Espace Client
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-32 sm:pt-48 pb-20 sm:pb-32 px-6 min-h-screen flex items-center justify-center">
        {/* VIDEO BACKGROUND (Simulated with high-end overlay) */}
        <div className="absolute inset-0 z-0">
           <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/40 via-transparent to-[#020617] z-10"></div>
           <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/4391470/pexels-photo-4391470.jpeg?auto=compress&cs=tinysrgb&w=1600')] bg-cover bg-center opacity-10 saturate-0"></div>
        </div>

        {/* Background blobs for depth */}
        <div className="absolute top-1/4 -left-24 w-64 sm:w-[40rem] h-64 sm:h-[40rem] bg-orange-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 -right-24 w-80 sm:w-[50rem] h-80 sm:h-[50rem] bg-blue-500/10 rounded-full blur-[160px] animate-pulse delay-700"></div>
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <ScrollReveal delay={200}>
            <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 backdrop-blur-md rounded-full px-6 py-2 mb-10">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#25D366]"></span>
              </span>
              <span className="text-white/90 text-[10px] font-black uppercase tracking-[0.25em]">
                <strong className="text-orange-400">1,200+ livraisons</strong> réussies ce mois
              </span>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={400}>
            <h1 className="font-display font-black text-5xl sm:text-7xl md:text-[9rem] leading-[0.85] mb-12 tracking-tighter uppercase">
              L&apos;Excellence en <br />
              <span className="text-gradient">Mouvement</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={600} className="max-w-xl mx-auto mb-16">
            <QuickOrderForm />
          </ScrollReveal>

          <ScrollReveal delay={800}>
            <p className="text-slate-400 text-sm sm:text-base md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
              Nelal Express n&apos;est pas juste une application. C&apos;est une infrastructure humaine ancrée localement pour sécuriser vos envois entre la capitale et le Fouta.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <Link href="/commander"
                className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-10 py-5 rounded-2xl font-display font-black text-lg transition-all shadow-2xl shadow-orange-500/30 flex items-center justify-center gap-3 group relative overflow-hidden">
                <span className="relative z-10 flex items-center gap-3">
                  Expédier Maintenant
                  <span className="material-symbols-rounded group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </span>
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
              </Link>
              <Link href="#zones"
                className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 text-white px-10 py-5 rounded-2xl font-display font-black text-lg transition-all flex items-center justify-center gap-3">
                Voir nos tarifs
              </Link>
            </div>

            <div className="max-w-md mx-auto">
              <PWAInstallButton />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="py-10 border-y border-white/5 bg-[#020617] overflow-hidden flex whitespace-nowrap relative">
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: marquee 40s linear infinite;
          }
        `}} />
        <div className="animate-marquee inline-flex gap-20 items-center min-w-full">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-20 items-center px-10">
              {['Yeumbeul Nord', 'Almadies', 'Ndioum', 'Plateau', 'Keur Massar', 'Saint-Louis', 'Podor', 'Pikine'].map((town) => (
                <div key={town} className="flex items-center gap-10">
                   <span className="text-slate-700 font-display font-black text-2xl uppercase tracking-[0.2em] hover:text-orange-500 transition-colors cursor-default">{town}</span>
                   <span className="w-2 h-2 rounded-full bg-orange-500/30"></span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* COMMENT ÇA MARCHE */}
      <section className="py-32 px-6 bg-[#030712] relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-24 space-y-4">
               <span className="text-orange-500 font-black text-[10px] uppercase tracking-[0.4em]">Processus</span>
               <h2 className="font-display font-black text-4xl md:text-7xl text-white tracking-tighter uppercase">Simplicité <span className="text-gradient">Radicale</span></h2>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-4 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            
            {[
              { num: '01', title: 'Commande', desc: 'Formulaire ou WhatsApp en 1 clic.', icon: 'smartphone' },
              { num: '02', title: 'Récupération', desc: 'Un pilote arrive en moins de 20 min.', icon: 'location_on' },
              { num: '03', title: 'Suivi Live', desc: 'Notification directe à chaque étape.', icon: 'history' },
              { num: '04', title: 'Signature', desc: 'Confirmation sécurisée par code.', icon: 'check_circle' },
            ].map((step, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="relative group text-center space-y-6">
                  <div className="w-20 h-20 bg-slate-900 border border-white/5 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl group-hover:border-orange-500/50 group-hover:shadow-orange-500/10 transition-all duration-500">
                    <span className="material-symbols-rounded text-3xl text-orange-400 group-hover:scale-110 transition-transform">{step.icon}</span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-display font-black text-xl uppercase text-white tracking-tight">{step.title}</h3>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* EXPERTISE SECTION */}
      <section id="expertise" className="max-w-7xl mx-auto px-6 py-32">
         <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-12">
              <ScrollReveal>
                <div className="space-y-6">
                  <span className="text-orange-500 font-black text-[10px] uppercase tracking-[0.4em] bg-orange-500/10 px-4 py-2 rounded-full border border-orange-500/20">Notre Expertise</span>
                  <h2 className="font-display font-black text-5xl sm:text-7xl uppercase tracking-tighter leading-none">
                    Propulser la <br />
                    <span className="text-gradient">Logistique Urbaine</span>
                  </h2>
                  <p className="text-slate-400 text-base sm:text-lg max-w-md leading-relaxed font-medium">
                    Nelal Express n&apos;est pas qu&apos;un service de livraison. C&apos;est une infrastructure technologique pensée pour la rapidité sénégalaise.
                  </p>
                </div>
              </ScrollReveal>

              <div className="space-y-8">
                {[
                  { title: "Hub Yeumbeul Nord", desc: "Notre centre névralgique pour la banlieue dakaroise.", icon: 'home' },
                  { title: "Service Dakar Elite", desc: "Rapidité absolue pour vos documents précieux en centre-ville.", icon: 'navigation' },
                  { title: "Transit Ndioum-Fouta", desc: "Le pont logistique direct vers le Nord du Sénégal.", icon: 'local_shipping' },
                ].map((item, i) => (
                  <ScrollReveal key={i} delay={i * 100}>
                    <div className="flex gap-6 group cursor-default">
                      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-orange-500/20 group-hover:border-orange-500/40 transition-all text-orange-500 group-hover:scale-110">
                        <span className="material-symbols-rounded text-3xl">{item.icon}</span>
                      </div>
                      <div>
                        <h4 className="font-display font-black text-xl mb-1 uppercase tracking-tight text-white group-hover:text-orange-400 transition-colors">{item.title}</h4>
                        <p className="text-slate-500 text-sm leading-relaxed group-hover:text-slate-400 transition-colors font-medium">{item.desc}</p>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
            
            <ScrollReveal delay={400} className="relative">
               <div className="absolute inset-0 bg-orange-500/20 blur-[120px] rounded-full animate-pulse"></div>
               <div className="relative bg-white/5 border border-white/10 rounded-[3rem] p-8 sm:p-16 backdrop-blur-3xl shadow-2xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                    {[
                      { val: '100%', label: 'Sécurité Colis', icon: 'shield_with_heart', color: 'text-orange-500' },
                      { val: 'Direct', label: 'Dakar ↔ Ndioum', icon: 'public', color: 'text-blue-500' },
                      { val: 'Local', label: 'Équipe Dakaroise', icon: 'groups', color: 'text-green-500' },
                      { val: 'Express', label: 'Service Rapide', icon: 'bolt', color: 'text-purple-500' },
                    ].map((card, i) => (
                      <div key={i} className={`bg-[#020617] rounded-3xl p-8 border border-white/5 space-y-4 hover:border-orange-500/30 transition-all group ${i % 2 !== 0 ? 'sm:mt-12' : ''}`}>
                          <div className={`w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center ${card.color} group-hover:scale-110 transition-transform`}><span className="material-symbols-rounded text-3xl">{card.icon}</span></div>
                          <div className="font-display font-black text-3xl uppercase tracking-tighter">{card.val}</div>
                          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-white transition-colors">{card.label}</div>
                      </div>
                    ))}
                  </div>
               </div>
            </ScrollReveal>
         </div>
      </section>

      {/* NEIGHBORHOOD PROMO */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <ScrollReveal>
          <div className="relative border border-orange-500/20 bg-orange-500/[0.03] rounded-[4rem] p-8 md:p-20 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-orange-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <span className="inline-flex items-center gap-2 bg-orange-500 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
                   Hyper-Local
                </span>
                <h2 className="font-display font-black text-4xl md:text-7xl text-white tracking-tighter uppercase leading-none">
                  Le Coeur du <br />
                  <span className="text-orange-500 italic">Quartier.</span>
                </h2>
                <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-md">
                  Besoin d&apos;envoyer des clés, un repas ou un document dans le même secteur ? Profitez de notre tarif ultra-préférentiel.
                </p>
                
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl md:text-8xl font-display font-black text-white">500</span>
                  <span className="text-2xl font-black text-orange-500 uppercase tracking-tighter">FCFA</span>
                </div>
                
                <Link href="/commander" className="inline-flex items-center justify-center gap-4 bg-white text-slate-900 px-10 py-5 rounded-2xl font-display font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-orange-500 hover:text-white transition-all group">
                  Commander Local <span className="material-symbols-rounded group-hover:translate-x-2 transition-transform">arrow_forward</span>
                </Link>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { label: 'Documents', icon: 'description' },
                  { label: 'Cuisine', icon: 'restaurant' },
                  { label: 'Clés & Plis', icon: 'vpn_key' },
                  { label: 'Courses', icon: 'shopping_bag' },
                ].map((obj, i) => (
                  <div key={i} className="bg-[#020617] border border-white/5 p-8 rounded-[2.5rem] space-y-4 hover:border-orange-500/20 transition-colors">
                    <span className="material-symbols-rounded text-4xl text-orange-500/50">{obj.icon}</span>
                    <div className="font-display font-black text-xl text-white uppercase tracking-tight">{obj.label}</div>
                    <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Service de Proximité</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* RECRUTEMENT */}
      <section id="recrutement" className="max-w-7xl mx-auto px-6 py-32">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <ScrollReveal className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-orange-500 to-blue-600 rounded-[3rem] blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
            <div className="relative bg-slate-900 border border-white/10 rounded-[2.5rem] p-10 sm:p-16 shadow-2xl">
              <span className="text-orange-500 text-[10px] font-black uppercase tracking-widest block mb-8">Partenariat</span>
              <h2 className="font-display font-black text-4xl sm:text-6xl text-white mb-8 tracking-tighter uppercase leading-none">
                Devenez un <br />
                <span className="text-orange-500 italic text-gradient">Pilote Nelal.</span>
              </h2>
              <p className="text-slate-400 text-base sm:text-lg mb-12 leading-relaxed font-medium">
                Vous connaissez Dakar comme votre poche ? Rejoignez la flotte la plus tech du Sénégal et gérez vos revenus avec transparence.
              </p>
              
              <Link href="https://wa.me/221711165368" target="_blank"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-4 bg-white text-slate-900 px-10 py-5 rounded-2xl font-display font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-orange-500 hover:text-white transition-all group">
                Postuler sur WhatsApp
                <span className="material-symbols-rounded group-hover:translate-x-2 transition-transform">chat</span>
              </Link>
            </div>
          </ScrollReveal>

          <div className="space-y-12">
             <div className="grid grid-cols-2 gap-8">
                <ScrollReveal delay={200} className="p-8 bg-white/5 border border-white/5 rounded-3xl">
                   <div className="font-display font-black text-5xl text-orange-500 mb-2">+25%</div>
                   <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Revenus Garantis</div>
                </ScrollReveal>
                <ScrollReveal delay={400} className="p-8 bg-white/5 border border-white/5 rounded-3xl">
                   <div className="font-display font-black text-5xl text-blue-500 mb-2">Libre</div>
                   <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Planning Flexible</div>
                </ScrollReveal>
             </div>
             <ScrollReveal delay={600} className="p-10 bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20 rounded-[3rem] relative">
                <span className="material-symbols-rounded absolute top-8 right-8 text-6xl text-orange-500/10">format_quote</span>
                <p className="text-white font-medium italic text-xl leading-relaxed relative z-10">
                  &quot;Depuis que j&apos;ai rejoint Nelal, j&apos;ai doublé mes courses grâce à l&apos;optimisation algorithmique des trajets.&quot;
                </p>
                <div className="mt-8 flex items-center gap-5">
                   <div className="w-14 h-14 bg-slate-800 rounded-full border border-white/10 flex items-center justify-center font-black text-orange-500 text-xl shadow-xl">M.S</div>
                   <div>
                      <div className="text-white font-black text-sm uppercase tracking-widest">Moussa S.</div>
                      <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Partenaire Yeumbeul</div>
                   </div>
                </div>
             </ScrollReveal>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-32 px-6 bg-[#030712] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-24 space-y-6">
              <h2 className="font-display font-black text-4xl md:text-7xl text-white tracking-tighter uppercase">
                La Confiance <span className="text-gradient">Absolue</span>
              </h2>
              <p className="text-slate-500 text-lg font-medium">Note moyenne de 4.9/5 basée sur plus de 500 avis réels.</p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Fatou Diop", role: "E-commerce, Dakar", text: "Mes clientes reçoivent leurs colis en moins de 2h. Nelal a transformé mon business.", avatar: "FD" },
              { name: "Amadou Kane", role: "Architecte, Plateau", text: "Pour mes plans urgents, c'est le seul service en qui j'ai confiance. Rapide et sérieux.", avatar: "AK" },
              { name: "Aïssatou Ba", role: "Commerçante, Ndioum", text: "L'axe Ndioum-Dakar est géré de main de maître. On se sent vraiment épaulée.", avatar: "AB" }
            ].map((review, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] h-full space-y-8 hover:-translate-y-2 transition-all duration-500 hover:border-white/20">
                  <div className="flex gap-1">
                     {[1, 2, 3, 4, 5].map(s => <span key={s} className="material-symbols-rounded text-orange-500 text-lg">star</span>)}
                  </div>
                  <p className="text-slate-300 text-lg font-medium leading-relaxed italic">&quot;{review.text}&quot;</p>
                  <div className="flex items-center gap-5 pt-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center font-display font-black text-white text-xl shadow-xl">{review.avatar}</div>
                    <div>
                      <h4 className="text-white font-black text-sm uppercase tracking-widest">{review.name}</h4>
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{review.role}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION - ULTRA PREMIUM */}
      <section className="max-w-7xl mx-auto px-6 py-12 sm:py-24 mb-12">
        <ScrollReveal>
          <div className="bg-gradient-to-br from-slate-900 to-black rounded-3xl sm:rounded-[4rem] p-8 sm:p-12 md:p-24 text-center relative overflow-hidden border border-white/5 shadow-2xl group">
            <div className="absolute top-0 right-0 w-[20rem] sm:w-[40rem] h-[20rem] sm:h-[40rem] bg-orange-500/5 rounded-full blur-[80px] sm:blur-[120px] -mr-20 sm:-mr-40 -mt-20 sm:-mt-40 group-hover:bg-orange-500/10 transition-colors duration-1000"></div>
            
            <h2 className="font-display font-black text-3xl sm:text-5xl md:text-8xl text-white mb-6 sm:mb-8 tracking-tighter uppercase leading-[0.85]">
              Nelal Express <br /><span className="text-orange-500 italic">C&apos;est le Terroir.</span>
            </h2>
            <p className="text-slate-400 mb-8 sm:mb-12 text-sm sm:text-lg md:text-2xl max-w-2xl mx-auto font-medium">
              De Yeumbeul Nord à Ndioum, nous sommes là pour vous.
            </p>
            <Link href="/auth/signup"
              className="inline-flex items-center gap-3 sm:gap-4 bg-white text-slate-900 px-8 sm:px-12 py-4 sm:py-6 rounded-2xl sm:rounded-[2.5rem] font-display font-black text-base sm:text-xl shadow-2xl transition-all hover:scale-105 active:scale-95 hover:bg-orange-500 hover:text-white">
              Rejoindre Nelal
              <span className="material-symbols-rounded">arrow_forward</span>
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#020617] pt-32 pb-16 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-16 mb-24">
            <div className="col-span-1 md:col-span-1 space-y-8 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3">
                 <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-2xl">
                   <span className="text-white font-black text-xl">N</span>
                 </div>
                 <span className="font-display font-black text-2xl tracking-tighter uppercase">Nelal<span className="text-orange-500">Express</span></span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                L&apos;excellence logistique au Sénégal. Technologie, sécurité et ancrage local à chaque kilomètre.
              </p>
            </div>
            
            <div className="space-y-8 text-center md:text-left">
              <h4 className="font-display font-black text-xs uppercase tracking-[0.4em] text-white">Navigation</h4>
              <ul className="space-y-4 text-slate-500 text-sm font-bold uppercase tracking-widest text-[10px]">
                <li className="hover:text-orange-500 cursor-pointer transition-colors">Zones</li>
                <li className="hover:text-orange-500 cursor-pointer transition-colors">Tarifs</li>
                <li className="hover:text-orange-500 cursor-pointer transition-colors">Espace Client</li>
              </ul>
            </div>
            
            <div className="space-y-8 text-center md:text-left">
              <h4 className="font-display font-black text-xs uppercase tracking-[0.4em] text-white">Légal</h4>
              <ul className="space-y-4 text-slate-500 text-sm font-bold uppercase tracking-widest text-[10px]">
                <li className="hover:text-orange-500 cursor-pointer transition-colors">Confidentialité</li>
                <li className="hover:text-orange-500 cursor-pointer transition-colors">Conditions</li>
                <li className="hover:text-orange-500 cursor-pointer transition-colors">Cookies</li>
              </ul>
            </div>

            <NewsletterForm />
          </div>
          
          <div className="pt-12 border-t border-white/5 text-center">
            <p className="text-slate-700 text-[10px] font-black uppercase tracking-[0.5em]">
              &copy; {new Date().getFullYear()} Nelal Express &mdash; Logistics Digital Hub
            </p>
          </div>
        </div>
      </footer>

      {/* WhatsApp Floating Bubble */}
      <WhatsAppBubble />
    </div>
  )
}
