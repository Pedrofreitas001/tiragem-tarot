import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { TAROT_CARDS } from '../../tarotData';

/**
 * JourneySection - A Jornada do Herói (Versão Premium)
 * 
 * Experiência visual premium para explorar a jornada pessoal através dos Arcanos Maiores
 * Com suporte a diferentes níveis de acesso: guest, registered, subscriber
 */

interface JourneySectionProps {
  showJourneyButton?: boolean;
  onToggleJourney?: () => void;
}

const JourneySection: React.FC<JourneySectionProps> = ({ showJourneyButton = false, onToggleJourney }) => {
  // Animation: reveal bullets on scroll
  const bulletRefs = useRef<(HTMLLIElement | null)[]>([]);
  useEffect(() => {
    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
          }
        });
      },
      { threshold: 0.2 }
    );
    bulletRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });
    return () => observer.disconnect();
  }, []);

  const { isPortuguese } = useLanguage();
  const arcanaList = TAROT_CARDS.filter(card => card.arcana === 'major').sort((a, b) => a.number - b.number);

  // Fan/baralho visual: distribuição harmônica horizontal
  return (
    <section className="relative pt-24 md:pt-36 pb-20 md:pb-32 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute -top-40 left-0 w-96 h-96 bg-[#875faf]/8 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 right-0 w-96 h-96 bg-[#a77fd4]/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-full h-96 bg-gradient-to-b from-[#875faf]/5 via-transparent to-transparent opacity-50 blur-3xl" />
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center">
        <div className="relative mb-4 flex flex-col items-center justify-center">
          <h2
            className="text-5xl md:text-7xl font-bold mb-0 text-gradient-gold drop-shadow-lg"
            style={{ fontFamily: 'Crimson Text, serif', letterSpacing: '-0.02em', fontWeight: 700 }}
          >
            {isPortuguese ? 'A Jornada do Herói' : "The Hero's Journey"}
          </h2>
          {/* Estrelas brancas pequenas */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none" aria-hidden="true">
            {/* Estrelas: pontos brancos */}
            <span style={{ position: 'absolute', top: '10%', left: '20%', width: 4, height: 4, background: '#fff', borderRadius: '50%', opacity: 0.7, boxShadow: '0 0 6px #fff' }} />
            <span style={{ position: 'absolute', top: '18%', left: '60%', width: 3, height: 3, background: '#fff', borderRadius: '50%', opacity: 0.5, boxShadow: '0 0 4px #fff' }} />
            <span style={{ position: 'absolute', top: '30%', left: '35%', width: 2, height: 2, background: '#fff', borderRadius: '50%', opacity: 0.6, boxShadow: '0 0 3px #fff' }} />
            <span style={{ position: 'absolute', top: '8%', left: '80%', width: 3, height: 3, background: '#fff', borderRadius: '50%', opacity: 0.5, boxShadow: '0 0 4px #fff' }} />
            <span style={{ position: 'absolute', top: '25%', left: '10%', width: 2, height: 2, background: '#fff', borderRadius: '50%', opacity: 0.4, boxShadow: '0 0 2px #fff' }} />
            <span style={{ position: 'absolute', top: '15%', left: '50%', width: 2, height: 2, background: '#fff', borderRadius: '50%', opacity: 0.6, boxShadow: '0 0 3px #fff' }} />
          </div>
        </div>
        <p className="text-gray-300 text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-medium text-center mb-8">
          O Tarot é um mapa simbólico da experiência humana. Cada Arcano Maior representa uma etapa da jornada que todos atravessamos — do início ao despertar, da crise à realização.
        </p>
        <div className="relative w-full max-w-5xl h-[320px] md:h-[420px] flex items-end justify-center select-none" style={{ pointerEvents: 'none' }}>
          {arcanaList.map((card, idx) => {
            const total = arcanaList.length;
            // ...existing code...
            const spread = 80;
            const left = 10 + (spread * idx) / (total - 1);
            const arcHeight = 80;
            const t = idx / (total - 1);
            const bottom = 100 + arcHeight * Math.sin(Math.PI * t);
            const angle = -30 + (60 * idx) / (total - 1);
            return (
              <img
                key={card.id}
                src={card.imageUrl}
                alt={isPortuguese ? card.name_pt : card.name}
                className="absolute w-[60px] md:w-[100px] h-[120px] md:h-[200px] rounded-lg shadow-2xl border-2 border-white/20 object-cover transition-transform"
                style={{
                  left: `calc(${left}% - 50px)`,
                  bottom: `${bottom}px`,
                  transform: `rotate(${angle}deg)`
                }}
                draggable={false}
              />
            );
          })}
        </div>

        {/* Botão Ver História Completa */}
        {showJourneyButton && onToggleJourney && (
          <div className="relative z-10 flex justify-center mt-2">
            <button
              onClick={onToggleJourney}
              className="group relative px-4 py-2 rounded-lg text-xs font-medium text-gray-400 hover:text-white transition-all duration-300 border border-gray-700/50 hover:border-purple-500/50 bg-black/20 hover:bg-purple-900/20 backdrop-blur-sm"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <span className="relative flex items-center gap-2">
                {isPortuguese ? 'Ver história completa' : 'See full story'}
                <span className="material-symbols-outlined text-sm opacity-70 group-hover:opacity-100">expand_more</span>
              </span>
            </button>
          </div>
        )}

      </div>
    </section>
  );
};

export default JourneySection;
