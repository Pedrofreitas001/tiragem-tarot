import React, { useMemo, useState } from 'react';

type GalleryCard = {
  name: string;
  img: string;
  vibracao: string;
  significado: string;
  energia: string;
  mantra: string;
  featured: boolean;
};

interface WhatsAppShowcaseSectionProps {
  isPortuguese: boolean;
  showForm: boolean;
  onPrimaryAction: () => void;
  primaryLabel?: string;
  className?: string;
  showBottomCta?: boolean;
}

export const WhatsAppShowcaseSection: React.FC<WhatsAppShowcaseSectionProps> = ({
  isPortuguese,
  showForm,
  onPrimaryAction,
  primaryLabel,
  className = '',
  showBottomCta = true,
}) => {
  const [zoomedGalleryCard, setZoomedGalleryCard] = useState<GalleryCard | null>(null);

  const cards: GalleryCard[] = [
    {
      name: isPortuguese ? 'O Mundo' : 'The World',
      img: 'https://www.sacred-texts.com/tarot/pkt/img/ar21.jpg',
      vibracao: isPortuguese ? 'Completude e plenitude' : 'Wholeness and fullness',
      significado: isPortuguese ? 'Representa o fim de um ciclo e realizacao pessoal.' : 'Represents the end of a cycle and personal fulfillment.',
      energia: isPortuguese ? 'Harmonia e gratidao.' : 'Harmony and gratitude.',
      mantra: isPortuguese ? 'Eu celebro minha jornada.' : 'I celebrate my journey.',
      featured: false,
    },
    {
      name: isPortuguese ? 'A Lua' : 'The Moon',
      img: 'https://www.sacred-texts.com/tarot/pkt/img/ar18.jpg',
      vibracao: isPortuguese ? 'Intuicao e misterio' : 'Intuition and mystery',
      significado: isPortuguese ? 'Mostra caminhos ocultos e verdades internas.' : 'Shows hidden paths and inner truths.',
      energia: isPortuguese ? 'Sensibilidade e conexao interior.' : 'Sensitivity and inner connection.',
      mantra: isPortuguese ? 'Confio na minha intuicao.' : 'I trust my intuition.',
      featured: true,
    },
    {
      name: isPortuguese ? 'A Imperatriz' : 'The Empress',
      img: 'https://www.sacred-texts.com/tarot/pkt/img/ar03.jpg',
      vibracao: isPortuguese ? 'Abundancia e criacao' : 'Abundance and creation',
      significado: isPortuguese ? 'Simboliza nutricao, criatividade e prosperidade.' : 'Symbolizes nurturing, creativity and prosperity.',
      energia: isPortuguese ? 'Amor e expansao.' : 'Love and expansion.',
      mantra: isPortuguese ? 'Eu floresco em abundancia.' : 'I flourish in abundance.',
      featured: false,
    },
  ];

  const initialIndex = useMemo(() => {
    const idx = cards.findIndex((c) => c.featured);
    return idx >= 0 ? idx : 0;
  }, [cards]);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const denseStars = [
    { top: '6%', left: '5%', size: 3, opacity: 0.9 }, { top: '8%', left: '14%', size: 2, opacity: 0.82 },
    { top: '11%', left: '24%', size: 3, opacity: 0.88 }, { top: '14%', left: '36%', size: 2, opacity: 0.8 },
    { top: '9%', left: '52%', size: 3, opacity: 0.86 }, { top: '7%', left: '68%', size: 2, opacity: 0.78 },
    { top: '10%', left: '81%', size: 3, opacity: 0.9 }, { top: '15%', left: '92%', size: 2, opacity: 0.82 },
    { top: '21%', left: '8%', size: 3, opacity: 0.88 }, { top: '24%', left: '18%', size: 2, opacity: 0.8 },
    { top: '27%', left: '29%', size: 3, opacity: 0.9 }, { top: '22%', left: '44%', size: 2, opacity: 0.78 },
    { top: '25%', left: '58%', size: 3, opacity: 0.86 }, { top: '29%', left: '73%', size: 2, opacity: 0.8 },
    { top: '23%', left: '87%', size: 3, opacity: 0.88 }, { top: '33%', left: '12%', size: 2, opacity: 0.8 },
    { top: '36%', left: '22%', size: 3, opacity: 0.9 }, { top: '39%', left: '34%', size: 2, opacity: 0.82 },
    { top: '34%', left: '49%', size: 3, opacity: 0.86 }, { top: '38%', left: '63%', size: 2, opacity: 0.8 },
    { top: '41%', left: '77%', size: 3, opacity: 0.88 }, { top: '35%', left: '90%', size: 2, opacity: 0.78 },
    { top: '48%', left: '6%', size: 3, opacity: 0.9 }, { top: '52%', left: '16%', size: 2, opacity: 0.82 },
    { top: '56%', left: '27%', size: 3, opacity: 0.88 }, { top: '50%', left: '42%', size: 2, opacity: 0.8 },
    { top: '54%', left: '55%', size: 3, opacity: 0.86 }, { top: '58%', left: '70%', size: 2, opacity: 0.8 },
    { top: '53%', left: '84%', size: 3, opacity: 0.88 }, { top: '62%', left: '10%', size: 2, opacity: 0.78 },
    { top: '66%', left: '21%', size: 3, opacity: 0.9 }, { top: '70%', left: '33%', size: 2, opacity: 0.82 },
    { top: '65%', left: '47%', size: 3, opacity: 0.86 }, { top: '69%', left: '61%', size: 2, opacity: 0.8 },
    { top: '73%', left: '75%', size: 3, opacity: 0.88 }, { top: '68%', left: '89%', size: 2, opacity: 0.78 },
    { top: '79%', left: '8%', size: 3, opacity: 0.9 }, { top: '83%', left: '19%', size: 2, opacity: 0.82 },
    { top: '87%', left: '31%', size: 3, opacity: 0.88 }, { top: '81%', left: '45%', size: 2, opacity: 0.8 },
    { top: '85%', left: '59%', size: 3, opacity: 0.86 }, { top: '89%', left: '73%', size: 2, opacity: 0.8 },
    { top: '84%', left: '86%', size: 3, opacity: 0.88 }, { top: '91%', left: '95%', size: 2, opacity: 0.78 },
  ];

  const goPrev = () => setActiveIndex((prev) => (prev - 1 + cards.length) % cards.length);
  const goNext = () => setActiveIndex((prev) => (prev + 1) % cards.length);

  const getRelativePosition = (index: number) => {
    const total = cards.length;
    let diff = index - activeIndex;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    return diff;
  };

  const renderCardInner = (card: GalleryCard, compact = false) => (
    <div
      className="relative rounded-xl overflow-hidden shadow-xl"
      style={{
        background: 'linear-gradient(180deg, #2a1240 0%, #3d2563 40%, #251d3a 100%)',
        border: '1.5px solid rgba(212, 175, 55, 0.28)',
      }}
    >
      <div className="bg-red-600 text-white text-[7px] font-bold uppercase tracking-wider text-center py-1.5 px-2">
        {isPortuguese ? 'Exemplo Resumido' : 'Summary Example'}
      </div>
      <div className="mx-2.5 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(135, 95, 175, 0.25), transparent)' }}></div>
      <div className={`flex justify-center py-3 ${compact ? 'px-2' : 'px-4'}`}>
        <img
          src={card.img}
          alt={card.name}
          width={compact ? 106 : 134}
          height={compact ? 165 : 214}
          className={`object-cover rounded-md shadow-lg border border-yellow-500/20 ${compact ? 'w-[106px] h-[165px]' : 'w-[134px] h-[214px]'}`}
          loading="lazy"
        />
      </div>
      <p className="font-bold text-white text-center text-xs" style={{ fontFamily: "'Crimson Text', serif" }}>{card.name}</p>
      <p className="italic text-center px-2 mb-2 text-[8px]" style={{ color: '#d4af37', fontFamily: "'Crimson Text', serif" }}>
        "{card.vibracao}"
      </p>
      <div className="bg-white/5 rounded mx-2.5 px-2 py-1.5 mb-1.5">
        <p className={`text-gray-300 leading-snug text-center ${compact ? 'text-[6.5px]' : 'text-[7px]'}`}>{card.significado}</p>
      </div>
      <div className="flex items-start gap-1.5 px-2.5 mb-2">
        <span className="text-[6px] mt-0.5" style={{ color: '#d4af37' }}>*</span>
        <div>
          <span className={`font-semibold uppercase tracking-wide ${compact ? 'text-[6px]' : 'text-[7px]'}`} style={{ color: '#d4af37' }}>
            {isPortuguese ? 'Energia' : 'Energy'}
          </span>
          <p className={`text-gray-300 leading-snug ${compact ? 'text-[6px]' : 'text-[7px]'}`}>{card.energia}</p>
        </div>
      </div>
      <div className="mx-2.5 h-px bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent mb-1.5"></div>
      <div className="px-2.5 pb-2.5 text-center">
        <p className={`font-semibold uppercase tracking-wide mb-1 ${compact ? 'text-[6px]' : 'text-[7px]'}`} style={{ color: '#d4af37' }}>
          {isPortuguese ? 'Mantra do Dia' : 'Daily Mantra'}
        </p>
        <div className="bg-white/5 rounded px-2 py-1.5 border border-yellow-500/15">
          <p className={`italic ${compact ? 'text-[7px]' : 'text-[8px]'}`} style={{ color: '#d4af37', fontFamily: "'Crimson Text', serif" }}>
            "{card.mantra}"
          </p>
        </div>
      </div>
      <p className="text-gray-500 text-[6px] tracking-wider text-center pb-2">zayatarot.com</p>
    </div>
  );

  return (
    <section className={`relative z-10 py-20 md:py-28 px-4 md:px-6 ${className}`}>
      <style>{`
        .home-glass-card {
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .home-frequency-card input:checked + div {
          border-color: #A855F7;
          background: rgba(168, 85, 247, 0.15);
          box-shadow: 0 0 25px rgba(168, 85, 247, 0.25);
        }
        .text-gradient-gold-home {
          background: linear-gradient(180deg, #fffebb 0%, #e0c080 40%, #b88a44 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-scaleIn { animation: scaleIn 0.2s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
      `}</style>

      <div className="absolute inset-0 opacity-50 z-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.35) 0.8px, transparent 0.8px)', backgroundSize: '90px 90px' }}></div>
      <div className="absolute inset-0 pointer-events-none z-[1]">
        {denseStars.map((star, idx) => (
          <div
            key={`dense-star-${idx}`}
            className="absolute rounded-full bg-white"
            style={{
              top: star.top,
              left: star.left,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
            }}
          ></div>
        ))}
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-left mb-14 md:mb-20 px-2">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-normal text-gradient-gold-home mb-6 tracking-tight leading-tight" style={{ fontFamily: "'Crimson Text', serif" }}>
            {isPortuguese ? 'Carta do Dia no WhatsApp' : 'Daily Card on WhatsApp'}
          </h2>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl font-light" style={{ fontFamily: "'Inter', sans-serif" }}>
            {isPortuguese ? 'Receba uma mensagem diaria com orientacao do Tarot no seu celular.' : 'Receive a daily Tarot guidance message on your phone.'}
          </p>
        </div>

        <div className="mb-14 md:mb-20 relative">
          <div className="absolute -left-32 top-0 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-purple-500/18 to-transparent blur-3xl pointer-events-none"></div>
          <div className="absolute -right-24 top-16 w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-pink-500/12 to-transparent blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-[920px] mx-auto">
            <div className="flex items-center justify-between mb-4 px-1">
              <button
                type="button"
                onClick={goPrev}
                className="w-10 h-10 rounded-full border border-yellow-500/40 bg-[#120a20]/80 text-yellow-300 inline-flex items-center justify-center hover:bg-[#1a102e] transition-colors"
                aria-label={isPortuguese ? 'Carta anterior' : 'Previous card'}
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <p className="text-xs text-gray-300/90">
                {isPortuguese ? 'Navegue pelos modelos' : 'Browse template previews'}
              </p>
              <button
                type="button"
                onClick={goNext}
                className="w-10 h-10 rounded-full border border-yellow-500/40 bg-[#120a20]/80 text-yellow-300 inline-flex items-center justify-center hover:bg-[#1a102e] transition-colors"
                aria-label={isPortuguese ? 'Proxima carta' : 'Next card'}
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>

            <div className="relative h-[460px] sm:h-[515px] md:h-[570px] overflow-hidden">
              {cards.map((card, idx) => {
                const pos = getRelativePosition(idx);
                const isCenter = pos === 0;
                const isSide = Math.abs(pos) === 1;
                const translatePct = pos * 42;
                const scale = isCenter ? 1 : isSide ? 0.82 : 0.66;
                const opacity = isCenter ? 1 : isSide ? 0.45 : 0;
                const z = isCenter ? 30 : isSide ? 20 : 10;

                return (
                  <div
                    key={`carousel-${card.name}`}
                    className="absolute left-1/2 top-1/2 w-[242px] sm:w-[275px] md:w-[300px] transition-all duration-500 ease-out"
                    style={{
                      transform: `translate(-50%, -50%) translateX(${translatePct}%) scale(${scale})`,
                      opacity,
                      zIndex: z,
                      filter: isCenter ? 'none' : 'saturate(0.8)',
                    }}
                  >
                    <div
                      className="cursor-pointer"
                      onClick={() => {
                        if (isCenter) {
                          setZoomedGalleryCard(card);
                        } else {
                          setActiveIndex(idx);
                        }
                      }}
                    >
                      {renderCardInner(card, !isCenter)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {zoomedGalleryCard && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn" onClick={() => setZoomedGalleryCard(null)}>
              <div className="relative w-full max-w-[350px] animate-scaleIn" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => setZoomedGalleryCard(null)} className="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors flex items-center gap-1 text-xs">
                  <span className="material-symbols-outlined text-sm">close</span>
                  {isPortuguese ? 'Fechar' : 'Close'}
                </button>
                <div className="w-full max-w-[320px]">
                  {renderCardInner(zoomedGalleryCard, false)}
                </div>
              </div>
            </div>
          )}
        </div>

        {!showForm && showBottomCta && (
          <div className="flex justify-center">
            <button
              onClick={onPrimaryAction}
              className="group bg-[#D4AF37] hover:bg-[#B3922D] text-[#12091a] font-display font-bold text-sm md:text-base px-7 md:px-10 py-3.5 rounded shadow-[0_0_25px_rgba(212,175,55,0.35)] hover:shadow-[0_0_35px_rgba(212,175,55,0.55)] transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              {primaryLabel || (isPortuguese ? 'Receba sua mensagem do Tarot todos os dias' : 'Receive your Tarot message every day')}
              <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>
        )}

        {showForm && (
          <div className="relative">
            <div className="absolute -left-40 -top-20 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-purple-500/15 to-transparent blur-3xl pointer-events-none"></div>
            <div className="absolute -right-32 -top-10 w-[700px] h-[700px] rounded-full bg-gradient-to-br from-pink-500/11 to-transparent blur-3xl pointer-events-none"></div>
            <div className="home-glass-card w-full max-w-4xl mx-auto rounded-xl sm:rounded-[2rem] overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.5)] relative">
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 bg-red-600 text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-lg flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[12px]">group</span>
                {isPortuguese ? '+ 2 mil assinantes' : '+ 2k subscribers'}
              </div>

              <div className="flex flex-col lg:flex-row items-stretch">
                <div className="flex-1 p-6 pt-12 sm:pt-6 lg:p-10">
                  <header className="mb-6 text-center lg:text-left">
                    <h3 className="font-display text-2xl md:text-3xl text-white mb-4 leading-tight">
                      {isPortuguese ? 'Cadastre-se Agora' : 'Sign Up Now'}
                    </h3>
                    <p className="text-gray-400 text-sm max-w-lg">
                      {isPortuguese ? 'Preencha seus dados e comece a receber orientacoes misticas.' : 'Fill in your details and start receiving mystic guidance.'}
                    </p>
                  </header>

                  <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm" placeholder={isPortuguese ? 'Seu nome' : 'Your name'} />
                      <input className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm" placeholder="+55 (00) 00000-0000" />
                    </div>
                    <select className="w-full px-3 py-2.5 bg-[#1a1326]/90 border border-white/15 rounded-xl text-white text-sm appearance-none focus:outline-none focus:border-primary/60">
                      <option className="bg-[#1a1326] text-white" value="">{isPortuguese ? 'Selecione seu estado' : 'Select your state'}</option>
                      <option className="bg-[#1a1326] text-white" value="SP">Sao Paulo (SP)</option>
                      <option className="bg-[#1a1326] text-white" value="RJ">Rio de Janeiro (RJ)</option>
                      <option className="bg-[#1a1326] text-white" value="MG">Minas Gerais (MG)</option>
                      <option className="bg-[#1a1326] text-white" value="RS">Rio Grande do Sul (RS)</option>
                    </select>

                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'manha', icon: 'sunny', labelPt: 'Manha', labelEn: 'Morning' },
                        { id: 'tarde', icon: 'routine', labelPt: 'Tarde', labelEn: 'Afternoon' },
                        { id: 'noite', icon: 'nightlight', labelPt: 'Noite', labelEn: 'Night' },
                      ].map((period, idx) => (
                        <label key={period.id} className="home-frequency-card cursor-pointer group">
                          <input defaultChecked={idx === 0} className="hidden" name="freq" type="radio" value={period.id} />
                          <div className="home-glass-card flex flex-col items-center justify-center py-2.5 px-2 rounded-xl transition-all border border-transparent group-hover:border-primary/50 text-center">
                            <span className="material-symbols-outlined text-lg mb-1 text-yellow-500">{period.icon}</span>
                            <span className="text-[9px] font-bold text-gray-200 uppercase tracking-wider">
                              {isPortuguese ? period.labelPt : period.labelEn}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>

                    <label className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl px-3 py-3">
                      <input type="checkbox" className="mt-0.5 accent-yellow-500 w-4 h-4" />
                      <span className="text-xs text-gray-300 leading-relaxed">
                        {isPortuguese
                          ? 'Concordo em receber a Carta do Dia via WhatsApp e aceito os termos de comunicacao.'
                          : 'I agree to receive the Daily Card via WhatsApp and accept the communication terms.'}
                      </span>
                    </label>

                    <button
                      onClick={onPrimaryAction}
                      className="w-full sm:w-auto relative group overflow-hidden bg-primary text-white font-bold py-3 px-6 rounded-xl shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all active:scale-[0.98]"
                      type="button"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2 text-xs uppercase tracking-widest">
                        {isPortuguese ? 'Comecar a Receber' : 'Start Receiving'}
                        <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                      </span>
                    </button>
                  </form>
                </div>

                <div className="lg:w-[340px] bg-white/[0.02] border-l border-white/5 p-6 lg:p-8 flex flex-col justify-center gap-6">
                  {[
                    { icon: 'auto_awesome', titlePt: 'Personalizada', titleEn: 'Personalized', textPt: 'Cada mensagem e criada para trazer foco e clareza.', textEn: 'Each message is crafted to bring focus and clarity.' },
                    { icon: 'schedule', titlePt: 'Horario Ideal', titleEn: 'Ideal Time', textPt: 'Escolha o melhor horario para receber sua mensagem.', textEn: 'Choose the best time to receive your message.' },
                    { icon: 'chat', titlePt: 'Via WhatsApp', titleEn: 'Via WhatsApp', textPt: 'Receba no WhatsApp com praticidade todos os dias.', textEn: 'Receive it on WhatsApp every day with ease.' },
                  ].map((item) => (
                    <div key={item.icon} className="flex items-start gap-4">
                      <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-gradient-to-br from-yellow-500/15 to-yellow-600/5 border border-yellow-500/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-yellow-500 text-xl">{item.icon}</span>
                      </div>
                      <div>
                        <h4 className="text-white text-sm font-semibold mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                          {isPortuguese ? item.titlePt : item.titleEn}
                        </h4>
                        <p className="text-gray-400 text-xs leading-relaxed">
                          {isPortuguese ? item.textPt : item.textEn}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
