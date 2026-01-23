import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ArcanaNode from './ArcanaNode';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { PaywallModal } from '../PaywallModal';
import { TAROT_CARDS } from '../../tarotData';

/**
 * JourneySection - A Espiral do Louco (Versão Premium)
 * 
 * Experiência visual premium para explorar a jornada pessoal através dos Arcanos Maiores
 * Com suporte a diferentes níveis de acesso: guest, registered, subscriber
 */

interface JourneySectionProps {
  onStartReading?: () => void;
}

const JourneySection: React.FC<JourneySectionProps> = ({ onStartReading }) => {
  // Translation and user context
  const { isPortuguese } = useLanguage();
  const { user, tier, profile } = useAuth();
  const arcanaList = TAROT_CARDS.filter(card => card.arcana === 'major').sort((a, b) => a.number - b.number);

  // UI state
  const [selectedMarker, setSelectedMarker] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Access level logic - based on authentication tier
  const isGuest = !user;
  const isRegistered = user && tier === 'free';
  const isPremium = user && tier === 'premium';

  // Premium users can see Top 3
  const hasAccessToTop3 = isPremium;
  const hasAccessToCount = isPremium;

  // Card count for selected card
  let cardCount = 0;
  if (selectedMarker && hasAccessToCount) {
    // For now, just show demo data - in future could fetch from readings
    cardCount = Math.floor(Math.random() * 10) + 1;
  }

  // Top 3 cards logic - show real data if premium, demo data otherwise
  let top3: string[] = [];
  if (hasAccessToTop3) {
    // Premium users see real top 3 (would come from actual readings data)
    // For now, show first 3 major arcana
    top3 = arcanaList.slice(0, 3).map(card => String(card.id));
  } else {
    // Demo data for guests/free users - show random cards
    const shuffled = [...arcanaList].sort(() => 0.5 - Math.random());
    top3 = shuffled.slice(0, 3).map(card => String(card.id));
  }

  // Fallback: always show 3 cards
  if (top3.length < 3) {
    const used = new Set(top3);
    const fill = arcanaList.filter(card => !used.has(card.id)).slice(0, 3 - top3.length).map(card => String(card.id));
    top3 = [...top3, ...fill];
  }

  // Handlers
  const handleSelectMarker = (marker: any) => setSelectedMarker(marker);
  const handleOpenDetails = (marker: any) => {
    setSelectedMarker(marker);
    setIsDetailOpen(true);
  };
  const handleCloseDetail = () => setIsDetailOpen(false);

  return (
    <section className="relative pt-24 md:pt-36 pb-20 md:pb-32 overflow-hidden">
      {/* Premium background with gradient effects */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 left-0 w-96 h-96 bg-[#875faf]/8 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 right-0 w-96 h-96 bg-[#a77fd4]/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-full h-96 bg-gradient-to-b from-[#875faf]/5 via-transparent to-transparent opacity-50 blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          {/* Premium Header */}
          <div className="text-center mb-16 md:mb-20">
            <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#875faf]/10 border border-[#a77fd4]/30">
              <span className="text-[#a77fd4] text-xs uppercase tracking-widest font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>
                {isPortuguese ? 'Sua Jornada Pessoal' : 'Your Personal Journey'}
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-normal leading-[1.0] tracking-tight text-white mb-6 mt-0" style={{ fontFamily: "'Crimson Text', serif" }}>
              {isPortuguese ? 'A Espiral do Louco' : 'The Fool\'s Spiral'}
            </h1>

            <p className="text-gray-400 text-base md:text-lg font-light leading-relaxed max-w-2xl mx-auto mb-6" style={{ fontFamily: "'Crimson Text', serif" }}>
              {isPortuguese
                ? 'Acompanhe sua evolução espiritual através dos Arcanos Maiores e descubra as energias que guiam seu caminho.'
                : 'Track your spiritual evolution through the Major Arcana and discover the energies that guide your path.'
              }
            </p>

            {/* Progress bar */}
            <div className="max-w-lg mx-auto mt-10">
              <div className="relative h-2 bg-gradient-to-r from-[#1a1628] via-[#2a1a38] to-[#1a1628] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#875faf] via-[#ffd700] to-[#a77fd4] rounded-full transition-all duration-1000 ease-out shadow-lg"
                  style={{
                    width: '0%',
                    boxShadow: '0 0 20px rgba(167, 127, 212, 0.6)'
                  }}
                />
              </div>
              <div className="flex justify-between mt-3 text-xs text-gray-500 px-2" style={{ fontFamily: "'Crimson Text', serif" }}>
                <span className="text-[#ffd700]">O Louco (0)</span>
                <span className="text-[#a77fd4]">O Mundo (XXI)</span>
              </div>
            </div>
          </div>

          {/* Carousel Section */}
          <div className="relative mb-12 flex flex-col items-center">
            <div className="w-full relative flex items-center justify-center">
              {/* Left button */}
              <button
                type="button"
                aria-label="Scroll left"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-br from-[#2a1a38] to-[#1a1628] border border-[#a77fd4]/40 hover:border-[#ffd700]/60 hover:shadow-lg hover:shadow-[#a77fd4]/30 transition-all duration-300 group"
                onClick={() => { if (scrollRef.current) scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' }); }}
              >
                <span className="material-symbols-outlined text-white/80 group-hover:text-[#ffd700] text-2xl transition-colors">chevron_left</span>
              </button>

              {/* Carousel with Details */}
              <div
                ref={scrollRef}
                className="flex gap-8 md:gap-10 overflow-x-auto px-8 md:px-12 py-6 md:py-8 cursor-grab active:cursor-grabbing select-none justify-start items-start flex-1"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch',
                  scrollBehavior: 'smooth',
                  minHeight: 'clamp(320px, 36vw, 420px)',
                }}
              >
                {arcanaList.map((marker) => (
                  <div
                    key={marker.id}
                    className="flex-shrink-0 transition-all duration-300 hover:scale-105 flex flex-col items-center gap-6 group relative"
                    onClick={() => handleSelectMarker(marker)}
                  >
                    <ArcanaNode
                      marker={marker}
                      state={selectedMarker?.id === marker.id ? 'selected' : 'default'}
                      isPortuguese={isPortuguese}
                      onDetailsClick={() => handleOpenDetails(marker)}
                      size="large"
                      guestMode={isGuest}
                      selected={selectedMarker?.id === marker.id}
                    />
                    {/* Informação da carta com bola de luz estática */}
                    {selectedMarker?.id === marker.id && (
                      <div className="relative pt-4">
                        {/* Bola de luz estática melhorada */}
                        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-36 h-36 bg-gradient-to-b from-[#a77fd4]/30 to-[#a77fd4]/5 rounded-full blur-3xl" />
                        {/* Texto sem container */}
                        <div className="text-center relative z-10">
                          <p className="text-sm font-bold text-[#a77fd4] uppercase tracking-widest mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                            {marker.number}
                          </p>
                          <p className="text-base text-white font-medium leading-tight" style={{ fontFamily: "'Crimson Text', serif" }}>
                            {isPortuguese ? (marker.name_pt || marker.name) : marker.name}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Right button */}
              <button
                type="button"
                aria-label="Scroll right"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-br from-[#2a1a38] to-[#1a1628] border border-[#a77fd4]/40 hover:border-[#ffd700]/60 hover:shadow-lg hover:shadow-[#a77fd4]/30 transition-all duration-300 group"
                onClick={() => { if (scrollRef.current) scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' }); }}
              >
                <span className="material-symbols-outlined text-white/80 group-hover:text-[#ffd700] text-2xl transition-colors">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* Seção Expansível de Detalhes - FULL WIDTH */}
        {selectedMarker && isDetailOpen && (
          <div className="w-full mb-12 py-12 md:py-16 bg-[#0a0812] border-y border-[#a77fd4]/20">
            <div className="max-w-6xl mx-auto px-4">
              {/* Header com fechamento */}
              <div className="relative mb-10">
                <div className="flex gap-8 items-start">
                  {/* Imagem da carta */}
                  <div className="flex-shrink-0">
                    <img
                      src={selectedMarker?.imageUrl}
                      alt={isPortuguese ? selectedMarker.name_pt : selectedMarker.name}
                      className="w-40 h-56 object-contain"
                    />
                  </div>

                  {/* Info header */}
                  <div className="flex-1">
                    <p className="text-[#a77fd4] text-xs uppercase tracking-widest font-bold mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                      {isPortuguese ? 'Arcano Maior' : 'Major Arcana'} · {selectedMarker.number}
                    </p>
                    <h2 className="text-white text-4xl md:text-5xl font-normal leading-tight mb-4" style={{ fontFamily: "'Crimson Text', serif" }}>
                      {isPortuguese ? (selectedMarker.name_pt || selectedMarker.name) : (selectedMarker.name || selectedMarker.nameEn)}
                    </h2>
                    <p className="text-[#c9a9e3] text-base mb-8" style={{ fontFamily: "'Inter', sans-serif" }}>
                      {isPortuguese ? selectedMarker.essence : selectedMarker.essenceEn}
                    </p>

                    {/* Botões de ação */}
                    <div className="flex gap-3">
                      <Link
                        to={`/arquivo-arcano/${selectedMarker.slug}`}
                        className="px-4 py-2 rounded-lg bg-[#a77fd4] hover:bg-[#875faf] text-white transition-all text-sm font-medium flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm">explore</span>
                        {isPortuguese ? 'Ver no Arquivo Arcano' : 'View in Arcana Archive'}
                      </Link>
                      <button
                        onClick={handleCloseDetail}
                        className="px-4 py-2 rounded-lg bg-[#a77fd4]/15 hover:bg-[#a77fd4]/25 text-white transition-all border border-[#a77fd4]/40 text-sm font-medium"
                      >
                        <span className="material-symbols-outlined text-sm align-middle mr-1">close</span>
                        {isPortuguese ? 'Fechar' : 'Close'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-[#a77fd4]/30 to-transparent mb-10" />

              {/* Conteúdo */}
              <div className="space-y-10">

                {/* Jornada do Louco */}
                <div>
                  <h3 className="text-[#a77fd4]/90 text-sm uppercase tracking-widest font-bold mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
                    ✦ {isPortuguese ? 'Jornada do Louco' : 'Fool\'s Journey'}
                  </h3>
                  <p className="text-gray-300 text-lg leading-relaxed" style={{ fontFamily: "'Crimson Text', serif" }}>
                    {isPortuguese ? selectedMarker.narrative : selectedMarker.narrativeEn}
                  </p>
                </div>

                {/* Significados lado a lado */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-[#1a1628]/40 border border-[#a77fd4]/20 rounded-lg p-6">
                    <h4 className="text-[#ffd700]/90 text-sm uppercase tracking-widest font-bold mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
                      ↑ {isPortuguese ? 'Significado Positivo' : 'Upright Meaning'}
                    </h4>
                    <p className="text-gray-200 text-base leading-relaxed" style={{ fontFamily: "'Crimson Text', serif" }}>
                      {isPortuguese ? selectedMarker.meaning_up_pt : selectedMarker.meaning_up}
                    </p>
                  </div>

                  <div className="bg-[#1a1628]/40 border border-[#875faf]/20 rounded-lg p-6">
                    <h4 className="text-[#c9a9e3]/90 text-sm uppercase tracking-widest font-bold mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
                      ↓ {isPortuguese ? 'Significado Invertido' : 'Reversed Meaning'}
                    </h4>
                    <p className="text-gray-200 text-base leading-relaxed" style={{ fontFamily: "'Crimson Text', serif" }}>
                      {isPortuguese ? selectedMarker.meaning_rev_pt : selectedMarker.meaning_rev}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4">
          {/* Premium Insights Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
            {/* Card Count Widget */}
            <div className="group relative bg-gradient-to-br from-[#1a1628]/60 via-[#2a1a38]/50 to-[#1a1628]/60 border border-[#a77fd4]/20 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 hover:border-[#a77fd4]/40 hover:shadow-2xl hover:shadow-[#a77fd4]/20">
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-[#a77fd4]/10 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative p-8 md:p-10">
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-2xl md:text-3xl font-normal text-white mb-2" style={{ fontFamily: "'Crimson Text', serif" }}>
                        {isPortuguese ? 'Frequência da Carta' : 'Card Frequency'}
                      </h3>
                      <p className="text-sm text-gray-400" style={{ fontFamily: "'Inter', sans-serif" }}>
                        {isPortuguese ? 'Histórico de suas tiragens' : 'Your reading history'}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#a77fd4]/30 to-[#875faf]/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#ffd700] text-2xl">bar_chart</span>
                    </div>
                  </div>
                  <div className="h-1 w-16 bg-gradient-to-r from-[#a77fd4] to-[#ffd700] rounded-full" />
                </div>

                {selectedMarker ? (
                  <div className="flex gap-6 items-center">
                    <div className="flex-shrink-0">
                      <img
                        src={selectedMarker.imageUrl}
                        alt={isPortuguese ? selectedMarker.name_pt || selectedMarker.name : selectedMarker.name}
                        className="w-20 h-28 rounded-lg shadow-lg border border-[#a77fd4]/30 object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-normal text-white mb-2" style={{ fontFamily: "'Crimson Text', serif" }}>
                        {isPortuguese ? selectedMarker.name_pt || selectedMarker.name : selectedMarker.name}
                      </h4>
                      <p className="text-sm text-gray-400 mb-4">{isPortuguese ? selectedMarker.essence : selectedMarker.essenceEn}</p>
                      <div className="flex items-end gap-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">{isPortuguese ? 'Aparições' : 'Appearances'}</p>
                          <p className="text-4xl font-normal text-[#ffd700]" style={{ fontFamily: "'Crimson Text', serif" }}>
                            {hasAccessToCount ? cardCount : '-'}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">{isPortuguese ? 'vezes' : 'times'}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-8">
                    <p className="text-gray-400 text-center" style={{ fontFamily: "'Inter', sans-serif" }}>
                      {isPortuguese
                        ? 'Selecione uma carta acima para ver sua frequência'
                        : 'Select a card above to see its frequency'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Top 3 Ranking Widget with Premium Paywall */}
            <div className="group relative bg-gradient-to-br from-[#1a1628]/60 via-[#2a1a38]/50 to-[#1a1628]/60 border border-[#a77fd4]/20 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 hover:border-[#a77fd4]/40 hover:shadow-2xl hover:shadow-[#a77fd4]/20">
              <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-br from-[#a77fd4]/10 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative p-8 md:p-10">
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-2xl md:text-3xl font-normal text-white mb-2" style={{ fontFamily: "'Crimson Text', serif" }}>
                        {isPortuguese ? 'Top 3 Energias' : 'Top 3 Energies'}
                      </h3>
                      <p className="text-sm text-gray-400" style={{ fontFamily: "'Inter', sans-serif" }}>
                        {isPortuguese ? 'Seu ranking pessoal' : 'Your personal ranking'}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#a77fd4]/30 to-[#875faf]/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#ffd700] text-2xl">emoji_events</span>
                    </div>
                  </div>
                  <div className="h-1 w-16 bg-gradient-to-r from-[#a77fd4] to-[#ffd700] rounded-full" />
                </div>

                {/* Premium Paywall Banner */}
                {!hasAccessToTop3 && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-[#a77fd4]/10 via-[#ffd700]/5 to-[#a77fd4]/10 border-l-4 border-[#ffd700] rounded-lg flex items-start gap-3 justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="material-symbols-outlined text-[#ffd700] flex-shrink-0 text-xl">lock</span>
                      <div>
                        <p className="text-sm font-semibold text-white mb-1">
                          {isPortuguese ? 'Acesso Premium' : 'Premium Access'}
                        </p>
                        <p className="text-xs text-gray-300">
                          {isGuest
                            ? (isPortuguese ? 'Faça login para acessar seu ranking pessoal' : 'Login to access your ranking')
                            : (isPortuguese ? 'Faça upgrade para Premium para desbloquear seu ranking' : 'Upgrade to Premium to unlock your ranking')
                          }
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowPaywall(true)}
                      className="flex-shrink-0 ml-4 px-3 py-1 bg-gradient-to-r from-[#875faf] to-[#a77fd4] hover:from-[#a77fd4] hover:to-[#c9a9e3] text-white text-xs font-semibold rounded-lg transition-all duration-300 whitespace-nowrap"
                    >
                      {isPortuguese ? 'Desbloquear' : 'Unlock'}
                    </button>
                  </div>
                )}

                {/* Top 3 Cards Grid */}
                <div className={`grid grid-cols-3 gap-3 ${!hasAccessToTop3 ? 'opacity-60 blur-sm pointer-events-none' : ''}`}>
                  {top3.map((idx, position) => {
                    const card = arcanaList.find(a => a.id === idx);
                    if (!card) return null;

                    const medals = ['🥇', '🥈', '🥉'];

                    return (
                      <div key={card.id} className="flex flex-col items-center">
                        <div className="relative mb-2">
                          <img
                            src={card.imageUrl}
                            alt={card.name}
                            className={`w-16 h-24 rounded-lg shadow-lg border-2 object-cover transition-all ${position === 0 ? 'border-[#ffd700] scale-110' : 'border-[#a77fd4]/30'
                              }`}
                          />
                          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-xl">
                            {medals[position]}
                          </div>
                        </div>
                        <p className="text-xs text-center text-gray-300 truncate max-w-[70px]" style={{ fontFamily: "'Crimson Text', serif" }}>
                          {isPortuguese ? card.name_pt || card.name : card.name}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        div::-webkit-scrollbar {
          display: none;
        }
        
        @keyframes slideDownOpen {
          from {
            opacity: 0;
            transform: translateY(-40px);
            max-height: 0;
          }
          to {
            opacity: 1;
            transform: translateY(0);
            max-height: 1000px;
          }
        }
      `}</style>

      {/* Premium Ranking Paywall */}
      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} feature="ranking" />
    </section>
  );
};

export default JourneySection;
