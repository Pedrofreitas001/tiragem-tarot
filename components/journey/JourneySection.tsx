import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ArcanaNode from './ArcanaNode';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { PaywallModal } from '../PaywallModal';
import { TAROT_CARDS } from '../../tarotData';
import { fetchReadingsFromSupabase } from '../../services/readingsService';

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

  // Card frequency tracking
  const [cardFrequency, setCardFrequency] = useState<Record<string, number>>({});
  const [top3CardIds, setTop3CardIds] = useState<string[]>([]);
  const [isLoadingTop3, setIsLoadingTop3] = useState(false);

  // Helper function to convert Supabase reading to localStorage format
  const convertSupabaseReadingToLocalFormat = (reading: any): any => {
    // Determine spread type from spread_type string
    const cardCount = reading.cards?.length || 0;
    const spreadType = reading.spread_type || '';

    // Map spread_type to proper display name
    const spreadNameMap: Record<string, string> = {
      'card_of_day': isPortuguese ? 'Carta do Dia' : 'Card of the Day',
      'three_card': isPortuguese ? 'Três Cartas' : 'Three Cards',
      'celtic_cross': isPortuguese ? 'Cruz Celta' : 'Celtic Cross',
      'amor': isPortuguese ? 'Spread do Amor' : 'Love Spread',
      'love': isPortuguese ? 'Spread do Amor' : 'Love Spread'
    };

    let spreadName = spreadNameMap[spreadType] ||
      spreadType?.split('_')?.map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))?.join(' ') ||
      (isPortuguese ? 'Leitura' : 'Reading');

    let typeBadge = 'SINCRONIZADO';
    let typeColor = 'text-purple-400 bg-purple-500/10';

    if (cardCount === 1) {
      typeBadge = isPortuguese ? 'DIÁRIA' : 'DAILY';
      typeColor = 'text-yellow-400 bg-yellow-500/10';
    } else if (cardCount === 3) {
      typeBadge = isPortuguese ? 'RÁPIDA' : 'QUICK';
      typeColor = 'text-primary bg-primary/10';
    } else if (cardCount === 10) {
      typeBadge = isPortuguese ? 'COMPLETA' : 'FULL';
      typeColor = 'text-blue-400 bg-blue-500/10';
    }

    // Format date properly
    let formattedDate = reading.created_at;
    try {
      const dateObj = typeof reading.created_at === 'string'
        ? new Date(reading.created_at)
        : reading.created_at;

      if (dateObj instanceof Date && !isNaN(dateObj.getTime())) {
        formattedDate = dateObj.toLocaleString(isPortuguese ? 'pt-BR' : 'en-US', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch (e) {
      formattedDate = new Date().toLocaleString(isPortuguese ? 'pt-BR' : 'en-US');
    }

    return {
      id: reading.id || reading.created_at?.getTime?.() || Date.now(),
      date: formattedDate,
      spreadName,
      typeBadge,
      typeColor,
      previewCards: reading.cards?.map((c: any) => c.imageUrl) || [],
      cardNames: reading.cards?.map((c: any) => c.name) || [],
      positions: reading.cards?.map((c: any, idx: number) => `Posição ${idx + 1}`) || [],
      notes: reading.synthesis || '',
      comment: reading.notes || '',
      rating: reading.rating || 0
    };
  };

  // Sync Supabase readings to localStorage when user logs in
  useEffect(() => {
    if (!user) return; // Only sync when user is logged in

    const syncSupabaseToLocalStorage = async () => {
      try {
        const supabaseReadings = await fetchReadingsFromSupabase(user.id, 100);
        if (supabaseReadings && supabaseReadings.length > 0) {
          // Convert Supabase readings to localStorage format
          const localHistory = JSON.parse(localStorage.getItem('tarot-history') || '[]');

          // Create a set of existing reading IDs to avoid duplicates
          const existingIds = new Set(localHistory.map((r: any) => r.id));

          // Convert Supabase readings to localStorage format using helper
          const convertedReadings = supabaseReadings
            .filter((reading: any) => !existingIds.has(reading.id)) // Skip duplicates
            .map(convertSupabaseReadingToLocalFormat);

          // Merge with existing history
          const merged = [...convertedReadings, ...localHistory].slice(0, 20);
          localStorage.setItem('tarot-history', JSON.stringify(merged));
        }
      } catch (e) {
        console.log('Could not sync Supabase readings to localStorage');
      }
    };

    syncSupabaseToLocalStorage();
  }, [user?.id, isPortuguese]); // Rerun if language changes too

  // Load reading history and calculate frequency
  useEffect(() => {
    const loadHistoryAndCalculateFrequency = async () => {
      try {
        const frequency: Record<string, number> = {};

        // Load from localStorage (which now includes synced Supabase data)
        const localHistory = JSON.parse(localStorage.getItem('tarot-history') || '[]');
        localHistory.forEach((reading: any) => {
          // From localStorage, cards are saved as cardNames (array of strings)
          // Need to find the card ID from the name
          reading.cardNames?.forEach((cardName: string) => {
            const foundCard = TAROT_CARDS.find(c => c.name === cardName || c.name_pt === cardName);
            if (foundCard) {
              const cardKey = String(foundCard.id);
              frequency[cardKey] = (frequency[cardKey] || 0) + 1;
            }
          });
        });

        // Calculate top 3 by frequency
        const sorted = Object.entries(frequency)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([cardId]) => cardId);

        setCardFrequency(frequency);
        setTop3CardIds(sorted);
      } catch (e) {
        console.error('Error loading reading history:', e);
      }
    };

    loadHistoryAndCalculateFrequency();
  }, [user?.id]); // Recalculate when user logs in/out

  // Manual refresh function for Top 3
  const refreshTop3 = async () => {
    setIsLoadingTop3(true);
    try {
      const frequency: Record<string, number> = {};

      // Load from localStorage
      const localHistory = JSON.parse(localStorage.getItem('tarot-history') || '[]');
      localHistory.forEach((reading: any) => {
        reading.cardNames?.forEach((cardName: string) => {
          const foundCard = TAROT_CARDS.find(c => c.name === cardName || c.name_pt === cardName);
          if (foundCard) {
            const cardKey = String(foundCard.id);
            frequency[cardKey] = (frequency[cardKey] || 0) + 1;
          }
        });
      });

      // Calculate top 3 by frequency
      const sorted = Object.entries(frequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([cardId]) => cardId);

      setCardFrequency(frequency);
      setTop3CardIds(sorted);
    } catch (e) {
      console.error('Error refreshing Top 3:', e);
    } finally {
      setTimeout(() => setIsLoadingTop3(false), 500); // Small delay for UX
    }
  };

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
    // Get count from calculated frequency
    const count = cardFrequency[String(selectedMarker.id)] || 0;
    cardCount = count;
  }

  // Top 3 cards logic - show real data if premium, demo data otherwise
  let top3: string[] = [];
  if (hasAccessToTop3) {
    // Premium users see real top 3 from history
    top3 = top3CardIds.length > 0 ? top3CardIds : arcanaList.slice(0, 3).map(card => String(card.id));
  } else {
    // Demo data for guests/free users - show random cards
    const shuffled = [...arcanaList].sort(() => 0.5 - Math.random());
    top3 = shuffled.slice(0, 3).map(card => String(card.id));
  }

  // Fallback: always show 3 cards
  if (top3.length < 3) {
    const used = new Set(top3);
    const fill = arcanaList.filter(card => !used.has(String(card.id))).slice(0, 3 - top3.length).map(card => String(card.id));
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
                    <div className="flex items-center gap-2">
                      {/* Refresh button - shows when user has access and enough data */}
                      {hasAccessToTop3 && top3CardIds.length >= 1 && (
                        <button
                          onClick={refreshTop3}
                          disabled={isLoadingTop3}
                          className="w-10 h-10 rounded-full bg-gradient-to-br from-[#a77fd4]/30 to-[#875faf]/20 hover:from-[#a77fd4]/40 hover:to-[#875faf]/30 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          title={isPortuguese ? 'Atualizar ranking' : 'Refresh ranking'}
                        >
                          <span className={`material-symbols-outlined text-[#ffd700] text-xl ${isLoadingTop3 ? 'animate-spin' : ''}`}>
                            {isLoadingTop3 ? 'progress_activity' : 'refresh'}
                          </span>
                        </button>
                      )}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#a77fd4]/30 to-[#875faf]/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#ffd700] text-2xl">emoji_events</span>
                      </div>
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

                {/* Top 3 Cards Grid or Empty State */}
                {top3CardIds.length < 3 && hasAccessToTop3 ? (
                  // Not enough data yet
                  <div className="p-8 bg-gradient-to-r from-[#a77fd4]/10 via-[#ffd700]/5 to-[#a77fd4]/10 border border-[#a77fd4]/30 rounded-lg flex flex-col items-center gap-4 text-center">
                    <span className="material-symbols-outlined text-[#ffd700] text-5xl">star_rate</span>
                    <div>
                      <p className="text-sm font-semibold text-white mb-2">
                        {isPortuguese ? (
                          top3CardIds.length === 0
                            ? 'Comece com sua primeira leitura'
                            : top3CardIds.length === 1
                              ? 'Faltam 2 cartas'
                              : 'Falta 1 carta'
                        ) : (
                          top3CardIds.length === 0
                            ? 'Start with your first reading'
                            : top3CardIds.length === 1
                              ? '2 cards missing'
                              : '1 card missing'
                        )}
                      </p>
                      <p className="text-xs text-gray-300 mb-4">
                        {isPortuguese
                          ? `Complete mais ${3 - top3CardIds.length} ${3 - top3CardIds.length === 1 ? 'leitura' : 'leituras'} para ver seu Top 3 Energias`
                          : `Complete ${3 - top3CardIds.length} more ${3 - top3CardIds.length === 1 ? 'reading' : 'readings'} to see your Top 3 Energies`
                        }
                      </p>
                    </div>
                    <Link
                      to="/spread"
                      className="mt-2 px-4 py-2 bg-gradient-to-r from-[#875faf] to-[#a77fd4] hover:from-[#a77fd4] hover:to-[#c9a9e3] text-white text-xs font-semibold rounded-lg transition-all duration-300"
                    >
                      {isPortuguese ? 'Começar Leitura' : 'Start Reading'}
                    </Link>
                  </div>
                ) : (
                  // Show Top 3 Cards Grid
                  <div className={`grid grid-cols-3 gap-3 ${!hasAccessToTop3 ? 'opacity-60 blur-sm pointer-events-none' : ''}`}>
                    {top3.map((cardId, position) => {
                      // Convert string ID to number for comparison
                      const numericId = typeof cardId === 'string' ? parseInt(cardId, 10) : cardId;
                      const card = arcanaList.find(a => a.id === numericId);
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
                )}
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
